import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { MobileSidebar, Sidebar } from "../components/layout/Sidebar";
import { connectSocket, disconnectSocket } from "../lib/socket";

const DashboardLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // LoginForm only connects on a fresh sign-in; a page reload lands here
  // with a valid token and no socket, so connect on mount too.
  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  return (
    <div className="flex min-h-screen bg-app">
      <Sidebar />
      <MobileSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setIsMenuOpen(true)} />
        <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
