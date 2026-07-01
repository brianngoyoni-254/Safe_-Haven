import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAO32385_D1N4PGHjDn4n8h7s3dNIg3NLA",
  authDomain: "safe-haven-92581.firebaseapp.com",
  projectId: "safe-haven-92581",
  storageBucket: "safe-haven-92581.firebasestorage.app",
  messagingSenderId: "965393715016",
  appId: "1:965393715016:web:55dd463b99e1cc7c9ded7d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();