// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await logout(); // Esto llama al endpoint /logout y borra la cookie
    navigate("/login");
  };

  // Cerrar menú si se hace clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center bg-gray-900">
      <header className="w-full top-0 left-0 mx-auto text-white py-4 px-4 sm:px-6 bg-gradient-to-r from-sky-900 via-sky-700 to-sky-500 border-b border-sky-900">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-white font-bold text-xl sm:text-2xl transition duration-300 hover:scale-115 hover:text-orange-600">
            EDUC
          </Link>

          <div className="relative" ref={menuRef}>
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white transition duration-300 hover:scale-115 hover:text-orange-600 focus:outline-none"
                >
                <i className="fa-regular fa-circle-user fa-xl"></i>
            </button>



            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-md shadow-lg z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500 italic">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-red-500 hover:text-white transition"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;
