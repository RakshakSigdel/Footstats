import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/Global/ProtectedRoute";
import ProtectedShell from "./components/Global/ProtectedShell";
import AppSkeleton from "./components/ui/AppSkeleton";
import PageTransition, { PageTransitionItem } from "./components/ui/PageTransition";
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

function PublicRouteElement({ children }) {
  return (
    <Suspense fallback={<AppSkeleton />}>
      <PageTransition>
        <PageTransitionItem>{children}</PageTransitionItem>
      </PageTransition>
    </Suspense>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/register" element={<PublicRouteElement><Register /></PublicRouteElement>} />
      <Route path="/login" element={<PublicRouteElement><Login /></PublicRouteElement>} />
      <Route path="/forgot-password" element={<PublicRouteElement><ForgotPassword /></PublicRouteElement>} />
      <Route path="/reset-password" element={<PublicRouteElement><ResetPassword /></PublicRouteElement>} />
      <Route path="/payment" element={<PublicRouteElement><PaymentComponent /></PublicRouteElement>} />
      <Route path="/payment-success" element={<PublicRouteElement><Success /></PublicRouteElement>} />
      <Route path="/payment-failure" element={<PublicRouteElement><Failure /></PublicRouteElement>} />

      <Route element={<ProtectedRoute><ProtectedShell /></ProtectedRoute>}>
        <Route path="/clubs" element={<MyClubs />} />
        <Route path="/club/:clubId" element={<ClubDetails />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournament/:tournamentId" element={<TournamentDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/schedules" element={<Schedule />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/:scheduleId" element={<ScheduleDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/player/:playerId" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SidebarProvider>
          <div className="relative min-h-screen">
            <ParticlesBackground
              className="pointer-events-none fixed inset-0 z-40 opacity-75"
              quantity={110}
              staticity={55}
              ease={60}
              size={0.6}
              color="#0ea5e9"
              vx={0.01}
              vy={0.01}
            />
            <div className="relative z-10">
              <AnimatedRoutes />
            </div>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
