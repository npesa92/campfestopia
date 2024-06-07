import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBc-tktHAt9Y5sxLOK5lbPTA9szau-6K1Y",
  authDomain: "npesa-sandbox.firebaseapp.com",
  databaseURL: "https://npesa-sandbox.firebaseio.com",
  projectId: "npesa-sandbox",
  storageBucket: "npesa-sandbox.appspot.com",
  messagingSenderId: "1050781522650",
  appId: "1:1050781522650:web:d86719a6bf6d687166e3e3"
};

const fire = initializeApp(firebaseConfig);

export { fire };