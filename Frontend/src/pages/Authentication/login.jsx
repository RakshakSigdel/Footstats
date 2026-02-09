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
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sign In Button Pressed");
    try {
      const data = await login(formData.email, formData.password);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="flex flex-row min-h-screen" style={{ backgroundColor: "#F0F4FF" }}>
      {/* Left Side - Image with Text Overlay */}
      <AuthenticationSideImage 
        image={sidebg}
        title="Welcome back to FootStats"
        subtitle="Time to log in and check if your goals still count "
      />

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="bg-white rounded-3xl p-12 w-full max-w-md shadow-xl border border-blue-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif text-gray-800">
              Login Your Account
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-gray-800 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
              <span className="text-lg">→</span>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                New to FootStats?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
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