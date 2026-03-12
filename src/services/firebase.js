import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "gestao-contratos-setelagoas.firebaseapp.com",
  projectId: "gestao-contratos-setelagoas",
  storageBucket: "gestao-contratos-setelagoas.appspot.com",
  messagingSenderId: "COLE_AQUI_O_SENDER_ID",
  appId: "COLE_AQUI_O_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);