import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import './index.css'
import App from './App.jsx'
import ErrorBoundary from "./components/ui/ErrorBoundary";

const sanitizeEnvValue = (value) =>
  String(value || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1");

const googleClientId = sanitizeEnvValue(import.meta.env.VITE_GOOGLE_CLIENT_ID);
const queryClient = new QueryClient();

console.log("===== GOOGLE OAUTH DEBUG INFO =====");
console.log("Exact Origin you are visiting:", window.location.origin);
console.log("Is this Origin exactly in Google Console?:", window.location.origin === "http://localhost:5173" || window.location.origin === "http://127.0.0.1:5173");
console.log("Client ID loaded by App:", googleClientId);
console.log("===================================");

const appTree = (
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <App />
            <Toaster richColors position="top-right" />
          </ErrorBoundary>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    ) : (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
          <Toaster richColors position="top-right" />
        </ErrorBoundary>
      </QueryClientProvider>
    )}
  </StrictMode>
);

createRoot(document.getElementById('root')).render(
  appTree,
)
