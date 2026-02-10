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
  storageBucket: "pbus-74c6d.firebasestorage.app",
  messagingSenderId: "377804479541",
  appId: "1:377804479541:web:bdc045940360560a2f257c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const commentsRef = collection(db, "comments");

// Post comment
document.getElementById("submitComment").onclick = async () => {
  const input = document.getElementById("commentInput");
  const usernameInput = document.getElementById("usernameInput");
  const text = input.value.trim();
  if (!text) return;

  const username = usernameInput.value.trim() || "Anonymous";

  await addDoc(commentsRef, {
    text,
    parentId: null,
    username,
    createdAt: Date.now()
  });

  input.value = "";
};

// Listen for comments
const q = query(commentsRef, orderBy("createdAt", "asc"));

onSnapshot(q, (snapshot) => {
  const comments = [];
  snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
  renderComments(comments);
});

function renderComments(comments) {
  const list = document.getElementById("commentsList");
  list.innerHTML = "";

  const topLevel = comments.filter(c => c.parentId === null);
  const replies = comments.filter(c => c.parentId !== null);

  topLevel.forEach(comment => {
    const li = createCommentElement(comment);

    replies
      .filter(r => r.parentId === comment.id)
      .forEach(reply => li.appendChild(createCommentElement(reply, true)));

    list.appendChild(li);
  });
}

function createCommentElement(comment, isReply = false) {
  const div = document.createElement("div");
  div.style.marginLeft = isReply ? "20px" : "0";
  div.style.borderLeft = isReply ? "2px solid #ccc" : "none";
  div.style.padding = "5px";

  const user = document.createElement("strong");
  user.textContent = comment.username + " ";
  const timestamp = document.createElement("span");
  timestamp.style.fontSize = "0.8em";
  timestamp.style.color = "#555";
  timestamp.textContent = new Date(comment.createdAt).toLocaleString();

  const text = document.createElement("p");
  text.textContent = comment.text;

  const replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";
  replyBtn.style.fontSize = "0.8em";
  replyBtn.onclick = async () => {
    const replyText = prompt("Reply:");
    if (!replyText) return;

    const usernameInput = document.getElementById("usernameInput");
    const username = usernameInput.value.trim() || "Anonymous";

    await addDoc(commentsRef, {
      text: replyText,
      parentId: comment.id,
      username,
      createdAt: Date.now()
    });
  };

  div.appendChild(user);
  div.appendChild(timestamp);
  div.appendChild(text);
  div.appendChild(replyBtn);

  return div;
}

// ================= PDF.js viewer =================
const url = "yourfile.pdf"; // path to your PDF
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
    canvas.style.display = "block";
    canvas.style.margin = "20px auto";

    await page.render({ canvasContext: context, viewport }).promise;

    container.appendChild(canvas);
  }
}

renderPDF();


