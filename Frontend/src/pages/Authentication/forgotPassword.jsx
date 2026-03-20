import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import sidebg from "/images/sidebg1.jpg";
import AuthenticationSideImage from "./components/Authenticationsideimage";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setEmail(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reset password email:", email);
    // After sending email, navigate to reset password page
    navigate("/reset-password");
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#eef1f6]">
      <AuthenticationSideImage 
        image={sidebg}
        title="Password playing hide and seek?"
        subtitle="No stress, just drop your email and we'll send the rescue link"
      />

      <div className="flex-1 flex items-center justify-center p-12">
        <div className="bg-white rounded-3xl p-12 w-full max-w-md shadow-xl border border-blue-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif text-gray-800">
              Forgot Password?
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Enter your email address to receive a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-slate-800 hover:to-slate-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Send Email
              <span className="text-lg">→</span>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Remember your password?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
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