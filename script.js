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

// Show a loading placeholder
const commentsList = document.getElementById("commentsList");
commentsList.textContent = "Loading comments...";

// Post top-level comment
document.getElementById("submitComment").onclick = async () => {
  const input = document.getElementById("commentInput");
  const usernameInput = document.getElementById("usernameInput");

  const text = input.value.trim();
  if (!text) return;

  let username = usernameInput.value.trim();
  if (!username) username = "Anonymous";

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
  commentsList.innerHTML = ""; // Clear loading placeholder

  const topLevel = comments.filter(c => c.parentId === null);
  topLevel.forEach(comment => {
    commentsList.appendChild(renderCommentWithReplies(comment, comments));
  });
}

// Recursive function to render a comment + all replies
function renderCommentWithReplies(comment, allComments) {
  const div = createCommentElement(comment);

  const childReplies = allComments.filter(c => c.parentId === comment.id);
  childReplies.forEach(reply => {
    const replyEl = renderCommentWithReplies(reply, allComments);
    replyEl.classList.add("reply"); // indent styling
    div.appendChild(replyEl);
  });

  return div;
}

// Create a single comment element
function createCommentElement(comment) {
  const div = document.createElement("div");
  div.classList.add("comment");
  div.dataset.id = comment.id;

  // Username
  const author = document.createElement("strong");
  author.textContent = comment.username || "Anonymous";
  author.style.marginRight = "5px";

  // Comment text
  const text = document.createElement("span");
  text.classList.add("comment-text");
  text.textContent = comment.text;

  // Timestamp
  const time = document.createElement("span");
  time.classList.add("timestamp");
  time.textContent = formatTime(comment.createdAt);
  time.style.marginLeft = "10px";
  time.style.color = "#666";
  time.style.fontSize = "0.8em";

  // Reply button
  const replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";
  replyBtn.style.marginLeft = "10px";

  // Reply box (hidden initially)
  const replyBox = document.createElement("div");
  replyBox.classList.add("reply-box");
  replyBox.style.display = "none"; // ensures first-click works

  const replyInput = document.createElement("textarea");
  replyInput.rows = 2;
  replyInput.placeholder = "Write a reply...";

  const submitReply = document.createElement("button");
  submitReply.textContent = "Post Reply";

  replyBox.appendChild(replyInput);
  replyBox.appendChild(submitReply);

  // Toggle reply box
  replyBtn.onclick = () => {
    replyBox.style.display = replyBox.style.display === "none" ? "block" : "none";
    if (replyBox.style.display === "block") {
      setTimeout(() => replyInput.focus(), 0); // ensures focus works on first click
    }
  };

  // Submit reply
  submitReply.onclick = async () => {
    const replyText = replyInput.value.trim();
    if (!replyText) return;

    let replyUsername = document.getElementById("usernameInput").value.trim();
    if (!replyUsername) replyUsername = "Anonymous";

    // Render instantly
    renderTemporaryComment(replyText, comment.id, replyUsername);

    // Send to Firestore
    await addDoc(commentsRef, {
      text: replyText,
      parentId: comment.id,
      createdAt: Date.now(),
      username: replyUsername
    });

    replyInput.value = "";
    replyBox.style.display = "none";
  };

  // Assemble comment
  div.appendChild(author);
  div.appendChild(text);
  div.appendChild(time);
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

  const time = document.createElement("span");
  time.classList.add("timestamp");
  time.textContent = "just now";
  time.style.marginLeft = "10px";
  time.style.color = "#666";
  time.style.fontSize = "0.8em";

  div.appendChild(author);
  div.appendChild(p);
  div.appendChild(time);

  if (parentId) {
    const parentDiv = document.querySelector(`.comment[data-id='${parentId}']`);
    if (parentDiv) parentDiv.appendChild(div);
  } else {
    commentsList.appendChild(div);
  }
}

// Format timestamp into human-readable text
function formatTime(timestamp) {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
