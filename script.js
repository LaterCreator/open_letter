import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE",
  projectId: "PASTE_HERE",
  storageBucket: "PASTE_HERE",
  messagingSenderId: "PASTE_HERE",
  appId: "PASTE_HERE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore collection
const commentsRef = collection(db, "comments");

// Post comment
document.getElementById("submitComment").onclick = async () => {
  const text = document.getElementById("commentInput").value;
  if (!text.trim()) return;

  await addDoc(commentsRef, {
    text,
    createdAt: Date.now()

  });

  document.getElementById("commentInput").value = "";
};

// Live comments
const q = query(commentsRef, orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  const list = document.getElementById("commentsList");
  list.innerHTML = "";

  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().text;
    list.appendChild(li);
  });
});

