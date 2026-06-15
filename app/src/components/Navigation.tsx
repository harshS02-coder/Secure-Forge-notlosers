import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = location.pathname === "/";

  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "SCAN", path: "/scan" },
    { label: "REPORTS", path: "/reports" },
    { label: "SETTINGS", path: "/settings" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-[#f6f6f6]/95 backdrop-blur-sm border-b border-[#e6e6e6]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-6 lg:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo-shield.png"
              alt="NexusAI"
              className="w-8 h-8"
            />
            <span
              className={`text-lg tracking-[0.3em] font-medium ${
                scrolled || !isHome ? "text-[#262626]" : "text-[#262626]"
              }`}
            >
              NEXUS
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`eyebrow text-[13px] transition-colors duration-200 ${
                  location.pathname === link.path
                    ? "text-[#1c69d4]"
                    : scrolled || !isHome
                    ? "text-[#262626] hover:text-[#1c69d4]"
                    : "text-[#262626] hover:text-[#1c69d4]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#666]" />
                  <span className="text-sm text-[#262626]">{user.name || "User"}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1 text-[#666] hover:text-[#d20000] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-sm px-6 py-2"
              >
                SIGN IN
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-[#262626]" />
            ) : (
              <Menu className="w-6 h-6 text-[#262626]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#f6f6f6] border-t border-[#e6e6e6] px-6 py-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`eyebrow text-[13px] py-2 ${
                  location.pathname === link.path
                    ? "text-[#1c69d4]"
                    : "text-[#262626]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="text-left text-[#d20000] text-sm py-2"
              >
                SIGN OUT
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary text-sm text-center"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
