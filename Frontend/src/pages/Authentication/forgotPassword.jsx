import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import sidebg from "/images/sidebg.jpg";

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
    <div className="flex flex-row min-h-screen">
      <div
        className="w-1/2 bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${sidebg})` }}
      >
        <div className="text-white p-36 text-center space-y-2">
          <h1 className="text-5xl font-serif font-bold">Welcome To FootStats</h1>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center p-12">
        <div className="bg-gray-100 rounded-2xl p-10 w-full max-w-md shadow-lg">
          <h2 className="text-3xl font-bold font-serif mb-4 text-center">
            Forgot Password?
          </h2>

          <p className="text-center text-sm text-gray-600 mb-6">
            Enter Your Email Address
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="w-full h-12 bg-black text-white rounded-xl font-semibold flex items-center justify-center hover:bg-gray-800 transition"
            >
              Send Email
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium"
              style={{ color: "#1d4ed8" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
