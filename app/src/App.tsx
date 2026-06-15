import { Routes, Route } from "react-router";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
