import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/Global/ProtectedRoute";
import AppSkeleton from "./components/ui/AppSkeleton";
import PageTransition from "./components/ui/PageTransition";
import ParticlesBackground from "./pages/Player/Components/ParticlesBackground";

const Register = lazy(() => import("./pages/Authentication/register"));
const Login = lazy(() => import("./pages/Authentication/login"));
const ForgotPassword = lazy(() => import("./pages/Authentication/forgotPassword"));
const ResetPassword = lazy(() => import("./pages/Authentication/resetPassword"));
const MyClubs = lazy(() => import("./pages/Club/MyClubs"));
const ClubDetails = lazy(() => import("./pages/Club/ClubDetails"));
const Tournaments = lazy(() => import("./pages/Tournament/MyTournaments"));
const TournamentDetails = lazy(() => import("./pages/Tournament/TournamentDetails"));
const Dashboard = lazy(() => import("./pages/Player/Dashboard"));
const Discover = lazy(() => import("./pages/App/Discover"));
const Schedule = lazy(() => import("./pages/Schedule/Schedule"));
const ScheduleDetails = lazy(() => import("./pages/Schedule/ScheduleDetails"));
const Profile = lazy(() => import("./pages/Player/Profile"));
const Settings = lazy(() => import("./pages/App/Settings"));
const PaymentComponent = lazy(() => import("./components/payment/paymentForm"));
const Success = lazy(() => import("./components/payment/success"));
const Failure = lazy(() => import("./components/payment/failure"));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<AppSkeleton />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><PaymentComponent /></PageTransition>} />
          <Route path="/payment-success" element={<PageTransition><Success /></PageTransition>} />
          <Route path="/payment-failure" element={<PageTransition><Failure /></PageTransition>} />
          <Route path="/clubs" element={<ProtectedRoute><MyClubs /></ProtectedRoute>} />
          <Route path="/club/:clubId" element={<ProtectedRoute><ClubDetails /></ProtectedRoute>} />
          <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
          <Route path="/tournament/:tournamentId" element={<ProtectedRoute><TournamentDetails /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/schedule/:scheduleId" element={<ProtectedRoute><ScheduleDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/player/:playerId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SidebarProvider>
          <div className="relative min-h-screen">
            <ParticlesBackground
              className="pointer-events-none fixed inset-0 z-30 opacity-70"
              quantity={110}
              staticity={55}
              ease={60}
              size={0.6}
              color="#0ea5e9"
              vx={0.01}
              vy={0.01}
            />
            <div className="relative z-20">
              <AnimatedRoutes />
            </div>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
