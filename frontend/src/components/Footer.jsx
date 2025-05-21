import React from "react";

function Footer() {
  return (
    <div className="relative flex flex-col items-center justify-center bg-gray-900">
      {/* Footer */}
        <footer className="w-full bottom-0 left-0 mx-auto text-white pt-4 pb-6 px-4 sm:px-6 bg-gradient-to-r from-purple-800 via-pink-600 to-red-400 border-t border-purple-800">
            <div className="flex justify-center items-center">
                <span className="font-medium text-sm sm:text-base">
                    © {new Date().getFullYear()} EDUC. Todos los derechos reservados.
                </span>
            </div>
        </footer>

    </div>
  );
}

export default Footer;


