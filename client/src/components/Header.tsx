import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/Sidebar";

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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800" data-testid="page-title">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3 md:space-x-4">
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
