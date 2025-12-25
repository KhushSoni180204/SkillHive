import TopNav from "./TopNav";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

export default function MainLayout({ children }) {
  const location = useLocation();

  // Show sidebar only on dashboard routes
  const showSidebar = location.pathname.includes("/dashboard") || location.pathname.includes("/profile");

  return (
    <div className="d-flex flex-column min-vh-100">
      <TopNav />

      <div className="d-flex flex-grow-1">
        {showSidebar && <Sidebar />}

        <main className="flex-grow-1 p-4">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
