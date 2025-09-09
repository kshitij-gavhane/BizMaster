import { Link, useLocation } from "wouter";
import {
  ChartLine,
  Users,
  CalendarCheck,
  ShoppingCart,
  UserCheck,
  Package,
  CreditCard,
  History
} from "lucide-react";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: ChartLine },
  { path: "/workers", label: "Workers", icon: Users },
  { path: "/attendance", label: "Attendance", icon: CalendarCheck },
  { path: "/sales", label: "Sales Orders", icon: ShoppingCart },
  { path: "/customers", label: "Customers", icon: UserCheck },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/payments", label: "Payments", icon: CreditCard },
  { path: "/transactions", label: "Transaction History", icon: History },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg hidden md:block">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800" data-testid="app-title">HIM Bricks</h1>
        <p className="text-sm text-gray-500">Manufacturing Management</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-2 md:px-4 space-y-2">
          {navigationItems.map(({ path, label, icon: Icon }) => {
            const isActive = location === path;
            return (
              <Link
                key={path}
                href={path}
                className={`flex items-center px-3 py-3 md:px-4 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
