import { useState } from "react";
import { Link } from "react-router-dom";
import sidebg from "/images/sidebg.jpg";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => setPassword(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    setError("");
    console.log("Password reset:", password);
    setIsSubmitted(true);
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
          {!isSubmitted ? (
            <>
              <h2 className="text-3xl font-bold font-serif mb-4 text-center">
                New Password
              </h2>

              <p className="text-center text-sm text-gray-700 mb-6">
                Enter your new password
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  className="w-full h-12 bg-black text-white rounded-xl font-semibold flex items-center justify-center hover:bg-gray-800 transition"
                >
                  Confirm Password
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Remembered your old password?{" "}
                <Link
                  to="/login"
                  className="font-medium"
                  style={{ color: "#06b6d4" }}
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold font-serif mb-4">Success!</h2>
              <p className="text-gray-700">
                Your password has been reset successfully.
              </p>
              <Link
                to="/login"
                className="inline-block w-full h-12 bg-black text-white rounded-xl font-semibold flex items-center justify-center hover:bg-gray-800 transition"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
