import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import sidebg from "/images/sidebg.jpg";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin, login } from "../../services/api.auth";
import AuthenticationSideImage from "./components/Authenticationsideimage";

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
      // Store user info for quick access without API calls
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
    <div className="flex flex-row min-h-screen bg-[#eef1f6]">
      {/* Left Side - Image with Text Overlay */}
      <AuthenticationSideImage 
        image={sidebg}
        title="Welcome back to FootStats"
        subtitle="Time to log in and check if your goals still count "
      />

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="app-card w-full max-w-md rounded-3xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-serif text-gray-800">
              Login Your Account
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-10 rounded-xl px-4 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="w-full h-10 rounded-xl pl-4 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-1.01 2.27-2.74 4.14-4.9 5.26" />
                      <path d="M6.61 6.61C4.62 7.82 3 9.72 2 12c1.73 3.89 6 7 10 7 1.61 0 3.15-.38 4.53-1.05" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
            >
              Sign In
              <span className="text-lg">→</span>
            </button>

            <div className="pt-1">
              <p className="text-center text-xs text-gray-500 mb-2">Continue with Google</p>
              {isGoogleEnabled ? (
                <div className="flex justify-center">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                </div>
              ) : (
                <p className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  Google sign-in is not configured yet. Set VITE_GOOGLE_CLIENT_ID in Frontend/.env.
                </p>
              )}
            </div>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-gray-500">
                New to FootStats?
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}