import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const routes = ["products", "categories", "ingredients"];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-green-50 lg:h-screen">
      {/* Mobile / tablet top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-green-200 bg-white px-4 lg:hidden">
        <span className="text-xl font-bold text-green-700">Admin Panel</span>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="rounded-lg p-2 text-green-700 transition-colors hover:bg-green-50"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-green-200 bg-white transition-transform duration-300 lg:static lg:h-screen lg:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-green-200 p-4 lg:p-6">
          <span className="text-xl font-bold text-green-700 lg:text-2xl">
            Admin Panel
          </span>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {routes.map((route) => (
            <NavLink
              key={route}
              to={`/${route}`}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded px-4 py-2 transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-green-50"
                }`
              }
            >
              {route.charAt(0).toUpperCase() + route.slice(1)}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="m-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 pt-20 md:p-6 md:pt-24 lg:p-6 lg:pt-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
