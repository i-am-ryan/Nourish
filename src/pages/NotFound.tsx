import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

return (
  <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-green-600">
        🌟 Thank You for Visiting Us!
      </h1>
      <p className="text-xl text-gray-700 mb-4">
        We appreciate your time and hope you enjoyed exploring our platform.
        Come back soon for more updates and exciting features.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
      >
        Return to Home
      </a>
    </div>
  </div>
);
}


export default NotFound;
