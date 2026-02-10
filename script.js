import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

onSnapshot(q, (snapshot) => {
  const comments = [];
  snapshot.forEach(doc => {
    comments.push({ id: doc.id, ...doc.data() });
  });

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
      .forEach(reply => {
        li.appendChild(createCommentElement(reply, true));
      });

    list.appendChild(li);
  });
}

function createCommentElement(comment, isReply = false) {
  const div = document.createElement("div");
  div.style.marginLeft = isReply ? "20px" : "0";
  div.style.borderLeft = isReply ? "2px solid #ccc" : "none";
  div.style.padding = "5px";

  const text = document.createElement("p");
  text.textContent = comment.text;

  const replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";
  replyBtn.style.fontSize = "0.8em";

  replyBtn.onclick = async () => {
    const replyText = prompt("Reply:");
    if (!replyText) return;

    await addDoc(commentsRef, {
      text: replyText,
      parentId: comment.id,
      createdAt: Date.now()
    });
  };

  div.appendChild(text);
  div.appendChild(replyBtn);

  return div;
}


