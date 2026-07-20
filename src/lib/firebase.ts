import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCa1RNOmzcT1AqI9zadKBfrK9kHFLLsp_w",
  authDomain: "aaroh-ai-633f4.firebaseapp.com",
  projectId: "aaroh-ai-633f4",
  storageBucket: "aaroh-ai-633f4.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
