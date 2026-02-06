import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
//Authentication
import Register from "./pages/Authentication/register";
import Login from "./pages/Authentication/login";
import ForgotPassword from './pages/Authentication/forgotPassword';
import ResetPassword from './pages/Authentication/resetPassword';
//Other Pages
import Dashboard from './pages/Dashboard';
import Home from './pages/home'
import MyClubs from './pages/MyClubs';
import Tournaments from './pages/Tournaments';
import Sidebar from './components/Global/Sidebar';
import Topbar from './components/Global/Topbar';
//Model Form
import CreateClub from './components/Club/CreateClub';
import EditClub from './components/Club/EditClub';
import CreateTournament from './components/Tournament/HostTournament'
import EditTournament from './components/Tournament/EditTournament'

function App() {
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [isEditClubOpen, setIsEditClubOpen] = useState(false);
  const [selectedClubData, setSelectedClubData] = useState(null);
  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [isEditTournamentOpen, setIsEditTournamentOpen] = useState(false);
  const [selectedTournamentData, setSelectedTournamentData] = useState(null);

  const handleCreateClub = (formData) => {
    console.log('Club created:', formData);
    setIsCreateClubOpen(false);
    // Add API call here to save club to backend
  };

  const handleEditClub = (formData) => {
    console.log('Club updated:', formData);
    setIsEditClubOpen(false);
    // Add API call here to update club in backend
  };

  const openEditClub = (clubData) => {
    setSelectedClubData(clubData);
    setIsEditClubOpen(true);
  };

  const handleCreateTournament = (formData) => {
    console.log('Tournament created:', formData);
    setIsCreateTournamentOpen(false);
    // Add API call here to save tournament to backend
  };

  const handleEditTournament = (formData) => {
    console.log('Tournament updated:', formData);
    setIsEditTournamentOpen(false);
    // Add API call here to update tournament in backend
  };

  const openEditTournament = (tournamentData) => {
    setSelectedTournamentData(tournamentData);
    setIsEditTournamentOpen(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/clubs" element={<MyClubs />} />
        <Route path="/my-clubs" element={<MyClubs />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/topbar" element={<Topbar />} />
      </Routes>

      <CreateClub 
        isOpen={isCreateClubOpen}
        onClose={() => setIsCreateClubOpen(false)}
        onCreateClub={handleCreateClub}
      />

      <EditClub 
        isOpen={isEditClubOpen}
        onClose={() => setIsEditClubOpen(false)}
        onEditClub={handleEditClub}
        clubData={selectedClubData}
      />

      <CreateTournament 
        isOpen={isCreateTournamentOpen}
        onClose={() => setIsCreateTournamentOpen(false)}
        onCreateTournament={handleCreateTournament}
      />

      <EditTournament 
        isOpen={isEditTournamentOpen}
        onClose={() => setIsEditTournamentOpen(false)}
        onEditTournament={handleEditTournament}
        tournamentData={selectedTournamentData}
      />
    </BrowserRouter>
  );
}

export default App;