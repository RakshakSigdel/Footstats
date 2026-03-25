import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import sidebg from "/images/sidebg.jpg";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin, login } from "../../services/api.auth";
import AuthenticationSideImage from "./components/Authenticationsideimage";
import DynamicBackground from "../../components/ui/DynamicBackground";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleEnabled = Boolean(googleClientId?.trim());

  const handleChange = (e) => {
    setError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(formData.email, formData.password);
      if (!data?.token) throw new Error("Invalid response from server");
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/dashboard");
    } catch (err) {
      const message = err?.message || "Login failed. Please try again.";
      setError(message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError(null);
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        throw new Error("Google sign-in failed");
      }

      const data = await googleLogin(idToken);
      if (!data?.token) throw new Error("Invalid response from server");

      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Google sign-in failed");
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DynamicBackground
        className="z-0"
        patternType="grid"
        patternSize={48}
        patternColor="rgba(15,23,42,0.03)"
        gradient="linear-gradient(135deg, rgba(240,253,244,0.95) 0%, rgba(241,245,249,0.92) 50%, rgba(236,254,255,0.9) 100%)"
        showAccents
      />
      <div className="relative z-10 flex flex-row min-h-screen" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f1f5f9 50%, #ecfeff 100%)" }}>
        {/* Left Side - Image with Text Overlay */}
        <AuthenticationSideImage 
          image={sidebg}
          title="Welcome back to FootStats"
          subtitle="Time to log in and check if your goals still count "
        />

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="app-card w-full max-w-md rounded-3xl p-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-7"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <img src="/images/NoLogo.png" alt="FootStats" className="w-8 h-8 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Enter your credentials to continue
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-11 rounded-xl px-4 text-sm"
              />
            </motion.div>

            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl pl-4 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </motion.div>

            <motion.button
              custom={3}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
            >
              Sign In
              <ArrowRight size={16} />
            </motion.button>

            <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="pt-1">
              <p className="text-center text-xs text-slate-500 mb-3">Or continue with</p>
              {isGoogleEnabled ? (
                <div className="flex justify-center">
                  <GoogleLogin locale="en" onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                </div>
              ) : (
                <p className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  Google sign-in is not configured yet. Set VITE_GOOGLE_CLIENT_ID in Frontend/.env.
                </p>
              )}
            </motion.div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 rounded-full">
                New to FootStats?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  );
}