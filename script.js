import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
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

const commentsList = document.getElementById("commentsList");

// ------------------ Comments ------------------

document.getElementById("submitComment").onclick = async () => {
  const textInput = document.getElementById("commentInput");
  const usernameInput = document.getElementById("usernameInput");

  const text = textInput.value.trim();
  if (!text) return;

  const username = usernameInput.value.trim() || "Anonymous";

  await addDoc(commentsRef, {
    text,
    parentId: null,
    createdAt: Date.now(),
    username
  });

  textInput.value = "";
};

const q = query(commentsRef, orderBy("createdAt", "asc"));
onSnapshot(q, snapshot => {
  const comments = [];
  snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
  renderComments(comments);
});

function renderComments(comments) {
  commentsList.innerHTML = "";
  const topLevel = comments.filter(c => c.parentId === null);
  topLevel.forEach(comment => {
    commentsList.appendChild(renderComment(comment, comments));
  });
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
  replyBtn.textContent = "Reply";
  replyBtn.classList.add("replyBtn");

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

  // Render child replies
  const childReplies = allComments.filter(c => c.parentId === comment.id);
  if (childReplies.length > 0) {
    const repliesDiv = document.createElement("div");
    repliesDiv.classList.add("replies");
    childReplies.forEach(reply => repliesDiv.appendChild(renderComment(reply, allComments)));
    div.appendChild(repliesDiv);
  }

  return div;
}

// ------------------ PDF.js ------------------

const url = "pdfs/story-dad.pdf"; // PDF in /pdfs folder
const container = document.getElementById("pdfViewer");
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js';

async function renderPDF() {
  const pdf = await pdfjsLib.getDocument(url).promise;

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
}

renderPDF();
