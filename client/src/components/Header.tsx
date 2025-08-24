import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/workers": "Worker Management",
  "/attendance": "Attendance Tracking",
  "/sales": "Sales Orders",
  "/customers": "Customer Management",
  "/inventory": "Inventory Management",
  "/payments": "Payment Management",
};

interface HeaderProps {
  onNewEntry?: () => void;
}

export default function Header({ onNewEntry }: HeaderProps) {
  const [location] = useLocation();
  const title = pageTitles[location] || "Dashboard";
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800" data-testid="page-title">
          {title}
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500" data-testid="current-date">
            Today: {currentDate}
          </span>
          {onNewEntry && (
            <Button 
              onClick={onNewEntry}
              className="bg-blue-600 text-white hover:bg-blue-700"
              data-testid="button-new-entry"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
