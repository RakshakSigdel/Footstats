import { useState } from "react";
import { Link } from "react-router-dom";
import sidebg from "/images/sidebg.jpeg";
import AuthenticationSideImage from "../../components/Design/authenticationsideimage";

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
    <div className="flex flex-row min-h-screen" style={{ backgroundColor: "#F0F4FF" }}>
      <AuthenticationSideImage 
        image={sidebg}
        title="New password loading..."
        subtitle="One quick goal and you're back in the game, type away!"
      />

      <div className="flex-1 flex items-center justify-center p-12">
        <div className="bg-white rounded-3xl p-12 w-full max-w-md shadow-xl border border-blue-100">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold font-serif text-gray-800">
                  New Password
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                  Enter your new secure password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    required
                    value={password}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-gray-800 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Confirm Password
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
                Remembered your old password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold font-serif text-gray-800">Success!</h2>
              <p className="text-gray-600">
                Your password has been reset successfully.
              </p>
              <Link
                to="/login"
                className="inline-block w-full h-12 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-gray-800 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Back to Login
                <span className="text-lg">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}