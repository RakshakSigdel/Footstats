import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import Dashboard from './pages/Dashboard';
import MyClubs from './pages/MyClubs';
import Tournaments from './pages/Tournaments';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clubs" element={<MyClubs />} />
        <Route path="/my-clubs" element={<MyClubs />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/topbar" element={<Topbar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;