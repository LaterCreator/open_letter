import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ---------------- Firebase Setup ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCNnwgxQlqXPtwJSJfSffoRNbk46NcPwxw",
  authDomain: "pbus-74c6d.firebaseapp.com",
  projectId: "pbus-74c6d",
  storageBucket: "pbus-74c6d.appspot.com",
  messagingSenderId: "377804479541",
  appId: "1:377804479541:web:bdc045940360560a2f257c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const commentsRef = collection(db, "comments");

// ---------------- PDF.js Rendering ----------------
const pdfUrl = "pdfs/story-dad.pdf";  // PDF location
const container = document.getElementById("pdfViewer");

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js';

async function renderPDF() {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    container.appendChild(canvas);
  }

  // After PDF loads, create comment section
  createCommentSection();
}

renderPDF();

// ---------------- Comment Section ----------------
function createCommentSection() {
  const commentSection = document.createElement('div');
  commentSection.id = "commentSection";
  commentSection.innerHTML = `
    <div id="commentForm">
      <input type="text" id="usernameInput" placeholder="Username (optional)">
      <textarea id="commentInput" placeholder="Add a public comment..."></textarea>
      <button id="submitComment">Post Comment</button>
    </div>
    <div id="commentsList">Loading comments...</div>
  `;

  document.querySelector('.container').appendChild(commentSection);

  const commentsList = document.getElementById("commentsList");

  // Submit top-level comment
  document.getElementById("submitComment").onclick = async () => {
    const text = document.getElementById("commentInput").value.trim();
    if (!text) return;

    const username = document.getElementById("usernameInput").value.trim() || "Anonymous";

    await addDoc(commentsRef, {
      text,
      parentId: null,
      createdAt: Date.now(),
      username
    });

    document.getElementById("commentInput").value = "";
  };

  // Listen to Firestore updates
  const q = query(commentsRef, orderBy("createdAt", "asc"));
  onSnapshot(q, snapshot => {
    const comments = [];
    snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
    renderComments(comments, commentsList);
  });
}

function renderComments(comments, container) {
  container.innerHTML = "";
  const topLevel = comments.filter(c => c.parentId === null);
  topLevel.forEach(comment => container.appendChild(renderComment(comment, comments)));
}

function renderComment(comment, allComments) {
  const div = document.createElement("div");
  div.classList.add("comment");
  div.dataset.id = comment.id;

  const author = document.createElement("strong");
  author.textContent = comment.username;

  const time = document.createElement("span");
  time.classList.add("timestamp");
  time.textContent = new Date(comment.createdAt).toLocaleString();

  const text = document.createElement("span");
  text.textContent = comment.text;

  const replyBtn = document.createElement("button");
  replyBtn.classList.add("replyBtn");
  replyBtn.textContent = "Reply";

  const replyBox = document.createElement("div");
  replyBox.classList.add("reply-box");
  replyBox.style.display = "none";

  const replyInput = document.createElement("textarea");
  replyInput.rows = 2;
  replyInput.placeholder = "Write a reply...";

  const submitReply = document.createElement("button");
  submitReply.textContent = "Post Reply";

  replyBox.appendChild(replyInput);
  replyBox.appendChild(submitReply);

  replyBtn.onclick = () => {
    replyBox.style.display = replyBox.style.display === "none" ? "block" : "none";
    if (replyBox.style.display === "block") replyInput.focus();
  };

  submitReply.onclick = async () => {
    const replyText = replyInput.value.trim();
    if (!replyText) return;

    const username = document.getElementById("usernameInput").value.trim() || "Anonymous";

    await addDoc(commentsRef, {
      text: replyText,
      parentId: comment.id,
      createdAt: Date.now(),
      username
    });

    replyInput.value = "";
    replyBox.style.display = "none";
  };

  div.appendChild(author);
  div.appendChild(time);
  div.appendChild(document.createElement("br"));
  div.appendChild(text);
  div.appendChild(replyBtn);
  div.appendChild(replyBox);

  // Nested replies
  const childReplies = allComments.filter(c => c.parentId === comment.id);
  if (childReplies.length) {
    const repliesDiv = document.createElement("div");
    repliesDiv.classList.add("replies");
    childReplies.forEach(reply => repliesDiv.appendChild(renderComment(reply, allComments)));
    div.appendChild(repliesDiv);
  }

  return div;
}
