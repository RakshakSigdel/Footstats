import { useState } from "react";
import sidebg from "/images/sidebg3.jpg";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/api.auth";
import AuthenticationSideImage from "../../components/Design/authenticationsideimage";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData.firstName, formData.lastName, formData.email, formData.password);
    navigate("/login");
    console.log("Form submitted:", formData);
  };

  return (
    <div className="flex flex-row min-h-screen" style={{ backgroundColor: "#F0F4FF" }}>
      <AuthenticationSideImage 
        image={sidebg}
        title="Join the FootStats squad"
        subtitle="New season, new stats, new you let's get you on the pitch"
      />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border border-blue-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-serif text-gray-800">
              Register Your Account
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Create a new account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full h-10 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full h-10 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

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
                placeholder="Create a strong password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-10 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-gray-800 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm mt-4"
            >
              Sign Up
              <span className="text-lg">→</span>
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-gray-500">
                Already a member?
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}