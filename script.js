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

// Post top-level comment
document.getElementById("submitComment").onclick = async () => {
  const input = document.getElementById("commentInput");
  const text = input.value.trim();
  if (!text) return;

  await addDoc(commentsRef, {
    text,
    parentId: null,
    createdAt: Date.now()
  });

  input.value = "";
};

// Listen for comments
const q = query(commentsRef, orderBy("createdAt", "asc"));

onSnapshot(q, snapshot => {
  const comments = [];
  snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
  renderComments(comments);
});

// Render comments and nested replies
function renderComments(comments) {
  const list = document.getElementById("commentsList");
  list.innerHTML = "";

  const topLevel = comments.filter(c => c.parentId === null);
  const replies = comments.filter(c => c.parentId !== null);

  topLevel.forEach(comment => {
    const commentEl = createCommentElement(comment);

    // Append replies
    replies.filter(r => r.parentId === comment.id).forEach(reply => {
      commentEl.appendChild(createCommentElement(reply, true));
    });

    list.appendChild(commentEl);
  });
}

// Create comment or reply element
function createCommentElement(comment, isReply = false) {
  const div = document.createElement("div");
  div.classList.add("comment");
  if (isReply) div.classList.add("reply");

  const text = document.createElement("p");
  text.classList.add("comment-text");
  text.textContent = comment.text;

  const replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";

  // Reply box (hidden)
  const replyBox = document.createElement("div");
  replyBox.classList.add("reply-box");

  const replyInput = document.createElement("textarea");
  replyInput.rows = 2;
  replyInput.placeholder = "Write a reply...";

  const submitReply = document.createElement("button");
  submitReply.textContent = "Post Reply";

  replyBox.appendChild(replyInput);
  replyBox.appendChild(submitReply);

  replyBtn.onclick = () => {
    replyBox.style.display = replyBox.style.display === "none" ? "block" : "none";
    replyInput.focus();
  };

  submitReply.onclick = async () => {
    const replyText = replyInput.value.trim();
    if (!replyText) return;

    await addDoc(commentsRef, {
      text: replyText,
      parentId: comment.id,
      createdAt: Date.now()
    });

    replyInput.value = "";
    replyBox.style.display = "none";
  };

  div.appendChild(text);
  div.appendChild(replyBtn);
  div.appendChild(replyBox);

  return div;
}



