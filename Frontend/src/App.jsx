import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
//Authentication
import Register from "./pages/Authentication/register";
import Login from "./pages/Authentication/login";
import ForgotPassword from "./pages/Authentication/forgotPassword";
import ResetPassword from "./pages/Authentication/resetPassword";
//Club Routes
import MyClubs from "./pages/MyClubs";
import ClubDetails from "./pages/ClubDetails";
//Tournament Routes
import Tournaments from "./pages/MyTournaments";
import TournamentDetails from "./pages/TournamentDetails";
//Other Pages
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Clubs Routes */}
        <Route path="/clubs" element={<MyClubs />} />
        <Route path="/club/:clubId" element={<ClubDetails />} />
        {/* Tournament Routes */}
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournament/:tournamentId" element={<TournamentDetails />} />
        {/* Other Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Discover" element={<Discover />} />
        <Route path="/schedules" element={<Schedule />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="Settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
