import { useState } from "react";
import sidebg from "/images/sidebg3.jpg";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import {
  googleLogin,
  register,
} from "../../services/api.auth";
import AuthenticationSideImage from "./components/Authenticationsideimage";
import DynamicBackground from "../../components/ui/DynamicBackground";

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleEnabled = Boolean(googleClientId?.trim());

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: "Weak", color: "text-red-500", bar: "bg-gradient-to-r from-red-400 to-red-500", width: "w-1/3" };
    if (score <= 4) return { label: "Medium", color: "text-amber-500", bar: "bg-gradient-to-r from-amber-400 to-amber-500", width: "w-2/3" };
    return { label: "Strong", color: "text-sky-500", bar: "bg-gradient-to-r from-sky-400 to-sky-500", width: "w-full" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setError(null);
    setSuccess(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const response = await register(formData.firstName, formData.lastName, formData.email, formData.password);
      setSuccess(response?.message || "Registered successfully. Please login.");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      const message = err?.message || err?.error || "Registration failed. Please try again.";
      setError(message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError(null);
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("Google sign-in failed");

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
        gradient="linear-gradient(135deg, rgba(239,246,255,0.95) 0%, rgba(241,245,249,0.92) 50%, rgba(236,254,255,0.9) 100%)"
        showAccents
      />
      <div className="relative z-10 flex flex-row min-h-screen">
      <AuthenticationSideImage 
        image={sidebg}
        title="Join the FootStats squad"
        subtitle="New season, new stats, new you — let's get you on the pitch"
      />

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
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <img src="/images/NoLogo.png" alt="FootStats" className="w-8 h-8 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
              Create Account
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Start tracking your football journey
            </p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-sm">
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">First Name</label>
              <input type="text" name="firstName" placeholder="Enter your first name" required value={formData.firstName} onChange={handleChange} className="w-full h-11 rounded-xl px-4 text-sm" />
            </motion.div>

            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Last Name</label>
              <input type="text" name="lastName" placeholder="Enter your last name" required value={formData.lastName} onChange={handleChange} className="w-full h-11 rounded-xl px-4 text-sm" />
            </motion.div>

            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input type="email" name="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} className="w-full h-11 rounded-xl px-4 text-sm" />
            </motion.div>

            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl pl-4 pr-11 text-sm"
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2.5">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: passwordStrength.width === "w-full" ? "100%" : passwordStrength.width === "w-2/3" ? "66%" : "33%" }}
                      className={`h-full rounded-full ${passwordStrength.bar}`}
                    />
                  </div>
                  <p className={`mt-1 text-xs font-semibold ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </motion.div>

            <motion.button
              custom={4}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
            >
              Create Account
              <ArrowRight size={16} />
            </motion.button>

            <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible" className="pt-1">
              <p className="text-center text-xs text-slate-500 mb-3">Or continue with</p>
              {isGoogleEnabled ? (
                <div className="flex justify-center">
                  <GoogleLogin locale="en" onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                </div>
              ) : (
                <p className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  Google sign-up is not configured yet. Set VITE_GOOGLE_CLIENT_ID in Frontend/.env.
                </p>
              )}
            </motion.div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 rounded-full">Already a member?</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
      </div>
    </div>
  );
}