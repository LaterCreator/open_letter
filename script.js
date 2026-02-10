import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCNnwgxQlqXPtwJSJfSffoRNbk46NcPwxw",
  authDomain: "pbus-74c6d.firebaseapp.com",
  projectId: "pbus-74c6d",
  storageBucket: "pbus-74c6d.appspot.com",
  messagingSenderId: "377804479541",
  appId: "1:377804479541:web:bdc045940360560a2f257c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const commentsRef = collection(db, "comments");

// Ask for username once
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Enter your name:") || "Anonymous";
  localStorage.setItem("username", username);
}

// Post top-level comment
document.getElementById("submitComment").onclick = async () => {
  const input = document.getElementById("commentInput");
  const text = input.value.trim();
  if (!text) return;

  // Render instantly
  renderTemporaryComment(text, null, username);

  // Send to Firestore
  await addDoc(commentsRef, {
    text,
    parentId: null,
    createdAt: Date.now(),
    username: username
  });

  input.value = "";
};

// Listen for comments from Firestore
const q = query(commentsRef, orderBy("createdAt", "asc"));
onSnapshot(q, snapshot => {
  const comments = [];
  snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
  renderComments(comments);
});

// Render all top-level comments
function renderComments(comments) {
  const list = document.getElementById("commentsList");
  list.innerHTML = "";

  const topLevel = comments.filter(c => c.parentId === null);
  topLevel.forEach(comment => {
    list.appendChild(renderCommentWithReplies(comment, comments));
  });
}

// Recursive function to render a comment + all its replies
function renderCommentWithReplies(comment, allComments) {
  const div = createCommentElement(comment);

  const childReplies = allComments.filter(c => c.parentId === comment.id);
  childReplies.forEach(reply => {
    const replyEl = renderCommentWithReplies(reply, allComments);
    replyEl.classList.add("reply");
    div.appendChild(replyEl);
  });

  return div;
}

// Create single comment or reply element
function createCommentElement(comment) {
  const div = document.createElement("div");
  div.classList.add("comment");

  // Username
  const author = document.createElement("strong");
  author.textContent = comment.username || "Anonymous";
  author.style.marginRight = "5px";

  // Comment text
  const text = document.createElement("span");
  text.classList.add("comment-text");
  text.textContent = comment.text;

  // Reply button
  const replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";

  // Reply box (hidden by default)
  const replyBox = document.createElement("div");
  replyBox.classList.add("reply-box");

  const replyInput = document.createElement("textarea");
  replyInput.rows = 2;
  replyInput.placeholder = "Write a reply...";

  const submitReply = document.createElement("button");
  submitReply.textContent = "Post Reply";

  replyBox.appendChild(replyInput);
  replyBox.appendChild(submitReply);

  // Toggle reply box with first-click fix
  replyBtn.onclick = () => {
    replyBox.style.display = replyBox.style.display === "none" ? "block" : "none";
    if (replyBox.style.display === "block") {
      setTimeout(() => replyInput.focus(), 0); // ensures focus works
    }
  };

  // Submit reply
  submitReply.onclick = async () => {
    const replyText = replyInput.value.trim();
    if (!replyText) return;

    // Render instantly
    renderTemporaryComment(replyText, comment.id, username);

    // Send to Firestore
    await addDoc(commentsRef, {
      text: replyText,
      parentId: comment.id,
      createdAt: Date.now(),
      username: username
    });

    replyInput.value = "";
    replyBox.style.display = "none";
  };

  div.appendChild(author);
  div.appendChild(text);
  div.appendChild(replyBtn);
  div.appendChild(replyBox);

  return div;
}

// Render temporary comment instantly before Firestore confirms
function renderTemporaryComment(text, parentId, username) {
  const div = document.createElement("div");
  div.classList.add("comment");
  if (parentId) div.classList.add("reply");

  const author = document.createElement("strong");
  author.textContent = username || "Anonymous";
  author.style.marginRight = "5px";

  const p = document.createElement("span");
  p.classList.add("comment-text");
  p.textContent = text;

  div.appendChild(author);
  div.appendChild(p);

  if (parentId) {
    // Append under parent comment
    const allComments = document.querySelectorAll(".comment");
    allComments.forEach(c => {
      const parentText = c.querySelector(".comment-text");
      if (parentText && parentText.textContent === parentId) return; // optional check
      if (c.dataset.id === parentId) c.appendChild(div);
    });
  } else {
    document.getElementById("commentsList").appendChild(div);
  }
}

