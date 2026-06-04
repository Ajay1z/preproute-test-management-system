import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <div className="lg:flex">
      <Sidebar />
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  </div>
);

export default MainLayout;
