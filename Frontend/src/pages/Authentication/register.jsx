import { useState } from "react";
import sidebg from "/images/sidebg.jpg";
import { Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

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
            Register Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: "firstName", type: "text", placeholder: "First Name" },
              { name: "lastName", type: "text", placeholder: "Last Name" },
              { name: "email", type: "email", placeholder: "E-Mail" },
              { name: "password", type: "password", placeholder: "Password" },
            ].map((fld) => (
              <input
                key={fld.name}
                name={fld.name}
                type={fld.type}
                placeholder={fld.placeholder}
                required
                value={formData[fld.name]}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ))}

            <button
              type="submit"
              className="w-full h-12 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
            >
              Sign Up →
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-medium" style={{ color: "#1d4ed8" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}