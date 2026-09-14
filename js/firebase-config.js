// Chaves públicas do projeto Firebase (seguras para expor no cliente —
// a proteção real vem das regras de segurança do Firestore).
const firebaseConfig = {
  apiKey: "AIzaSyDe1RVRXUCo2DnTtoGDan6GNTTiW5S8RRY",
  authDomain: "controle-de-gastos-d6df7.firebaseapp.com",
  projectId: "controle-de-gastos-d6df7",
  storageBucket: "controle-de-gastos-d6df7.firebasestorage.app",
  messagingSenderId: "952130779199",
  appId: "1:952130779199:web:7f1d49de4b913df1b9e08a",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
