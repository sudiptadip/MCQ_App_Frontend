import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  LogOut,
  Menu,
  X,
  User as UserIcon
} from "lucide-react";
import { Button } from "../components/ui/button";
import { storage } from "../utils/storage";
import { STORAGE_KEYS } from "../constants";
import type { User } from "../features/auth/types";
import { useState, useEffect } from "react";
import SidebarMenu, { navItems } from "../components/layout/SidebarMenu";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = storage.get<User>(STORAGE_KEYS.USER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    navigate("/login");
  };


  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Sidebar Backdrop (Mobile Only) */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "relative"}
          ${isSidebarOpen ? "w-64 translate-x-0" : isMobile ? "w-64 -translate-x-full" : "w-20"}
          transition-all duration-300 bg-background border-r flex flex-col h-full
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-background">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && !isMobile ? (
              <BookOpen className="text-primary" />
            ) : (
              <span className="font-bold text-xl text-primary uppercase tracking-wider">
                MCQ App
              </span>
            )}
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto bg-background">
          <SidebarMenu isSidebarOpen={isSidebarOpen} isMobile={isMobile} />
        </nav>

        <div className="p-4 border-t bg-background shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {(isSidebarOpen || isMobile) && <span className="font-medium">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted rounded-full"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </Button>
            <h2 className="font-semibold text-lg hidden sm:block">
              {navItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none mb-1">{user?.name || "User"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{user?.role || "Student"}</p>
            </div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <UserIcon size={20} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;