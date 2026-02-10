import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInAnonymously } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth);

const commentsRef = collection(db, "comments");

document.getElementById("submitComment").onclick = async () => {
  const text = document.getElementById("commentInput").value;
  if (!text.trim()) return;

  await addDoc(commentsRef, {
    text,
    createdAt: serverTimestamp()
  });

  document.getElementById("commentInput").value = "";
};

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
