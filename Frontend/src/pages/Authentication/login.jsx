import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import sidebg from "/images/sidebg.jpg";
import { login } from "../../services/api.auth";
import AuthenticationSideImage from "../../components/Design/authenticationsideimage";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      const message = "Invalid Credentials";
      setError(message);
    }
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
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border border-blue-100">
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
                className="w-full h-10 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-10 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
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
              className="w-full h-10 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-slate-800 hover:to-slate-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm mt-4"
            >
              Sign In
              <span className="text-lg">→</span>
            </button>
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