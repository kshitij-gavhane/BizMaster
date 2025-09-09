import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import Workers from "@/pages/Workers";
import Attendance from "@/pages/Attendance";
import Sales from "@/pages/Sales";
import Customers from "@/pages/Customers";
import Inventory from "@/pages/Inventory";
import Payments from "@/pages/Payments";
import TransactionHistory from "@/pages/TransactionHistory";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="p-4 md:p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/workers" component={Workers} />
            <Route path="/attendance" component={Attendance} />
            <Route path="/sales" component={Sales} />
            <Route path="/customers" component={Customers} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/payments" component={Payments} />
            <Route path="/transactions" component={TransactionHistory} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
