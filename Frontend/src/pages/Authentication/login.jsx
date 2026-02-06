import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import sidebg from "/images/sidebg.jpg";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign-in data:", formData);
    // Redirect to home page after login
    navigate("/home");
  };
  const handleRoute =(e) =>{
    navigate("/dashboard")
  }

  return (
      <div className=" flex flex-row min-h-screen">
        <div
          className="w-1/2 bg-cover bg-center flex items-center justify-center overflow-hidden"
          style={{ backgroundImage: `url(${sidebg})` }}
        >
          <div className="text-white p-36 text-center space-y-2">
            <h1 className="text-5xl font-serif font-bold">Welcome To FootStats</h1>
          </div>
        </div>

      <div className="w-1/2 flex items-center justify-center p-12">
        <div className="  bg-gray-100 rounded-2xl p-10 w-full max-w-md shadow-lg">
          <h2 className="text-3xl font-bold font-serif mb-8 text-center">
            Login Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              placeholder="E-Mail"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="text-right -mt-2 mb-2">
             <Link
               to= "/forgot-password"
               className="text-sm font-medium"
                style={{ color: "#dc2626" }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
              onClick={handleRoute}
            >
              Sign In →
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium"
              style={{ color: "#1d4ed8" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
