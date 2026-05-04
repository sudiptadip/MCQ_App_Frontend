import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ContactRound,
  ListChevronsDownUp,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Define the nav items outside the component
export const navItems = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/" },
  { icon: <ContactRound size={20} />, label: "Franchise", path: "/franchise" },
  { icon: <Users size={20} />, label: "Student", path: "/student" },
  { icon: <ListChevronsDownUp size={20} />, label: "Category", path: "/category" },
  { icon: <BookOpen size={20} />, label: "My Exams", path: "/exams" },
  { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
];

interface SidebarMenuProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
}

const SidebarMenu = ({ isSidebarOpen, isMobile }: SidebarMenuProps) => {
  const location = useLocation();

  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className={`
            flex items-center gap-3 p-3 rounded-xl transition-all duration-200
            ${location.pathname === item.path
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          `}
        >
          {item.icon}
          {(isSidebarOpen || isMobile) && (
            <span className="font-medium whitespace-nowrap">{item.label}</span>
          )}
        </Link>
      ))}
    </>
  );
};

export default SidebarMenu;