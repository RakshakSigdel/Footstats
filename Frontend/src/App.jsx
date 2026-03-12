import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
//Authentication
import Register from "./pages/Authentication/register";
import Login from "./pages/Authentication/login";
import ForgotPassword from "./pages/Authentication/forgotPassword";
import ResetPassword from "./pages/Authentication/resetPassword";
//Club Routes
import MyClubs from "./pages/Club/MyClubs";
import ClubDetails from "./pages/Club/ClubDetails";
//Tournament Routes
import Tournaments from "./pages/Tournament/MyTournaments";
import TournamentDetails from "./pages/Tournament/TournamentDetails";
//Other Pages
import Dashboard from "./pages/Player/Dashboard";
import Discover from "./pages/App/Discover";
import Schedule from "./pages/Schedule/Schedule";
import ScheduleDetails from "./pages/Schedule/ScheduleDetails";
import Profile from "./pages/Player/Profile";
import Settings from "./pages/App/Settings";
import PlayerProfile from "./pages/Player/PlayerProfile";
//Components
import ProtectedRoute from "./components/Global/ProtectedRoute";
//Context
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SidebarProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes - Require Authentication */}
          {/* Clubs Routes */}
          <Route path="/clubs" element={<ProtectedRoute><MyClubs /></ProtectedRoute>} />
          <Route path="/club/:clubId" element={<ProtectedRoute><ClubDetails /></ProtectedRoute>} />
          {/* Tournament Routes */}
          <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
          <Route path="/tournament/:tournamentId" element={<ProtectedRoute><TournamentDetails /></ProtectedRoute>} />
          {/* Other Protected Pages */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/schedule/:scheduleId" element={<ProtectedRoute><ScheduleDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/player/:playerId" element={<ProtectedRoute><PlayerProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
