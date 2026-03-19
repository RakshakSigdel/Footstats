import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const sanitizeEnvValue = (value) =>
  String(value || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1");

const googleClientId = sanitizeEnvValue(import.meta.env.VITE_GOOGLE_CLIENT_ID);

console.log("===== GOOGLE OAUTH DEBUG INFO =====");
console.log("Exact Origin you are visiting:", window.location.origin);
console.log("Is this Origin exactly in Google Console?:", window.location.origin === "http://localhost:5173" || window.location.origin === "http://127.0.0.1:5173");
console.log("Client ID loaded by App:", googleClientId);
console.log("===================================");

const appTree = (
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);

createRoot(document.getElementById('root')).render(
  appTree,
)
