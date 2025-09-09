import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaymentForm from "@/components/forms/PaymentForm";
import type { Worker } from "@shared/schema";

export default function Payments() {
  const [periodFilter, setPeriodFilter] = useState("this-week");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: workers = [] } = useQuery({
    queryKey: ["/api/workers"],
  });

  const { data: weeklyCalculations = [], isLoading: calculationsLoading } = useQuery({
    queryKey: ["/api/payments/calculate-weekly"],
    queryFn: async () => {
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Get Monday
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const response = await fetch('/api/payments/calculate-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: monday.toISOString().split('T')[0],
          weekEnd: sunday.toISOString().split('T')[0]
        })
      });
      
      if (!response.ok) throw new Error('Failed to calculate payments');
      return response.json();
    },
  });

  const isLoading = paymentsLoading || calculationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate payment metrics
  const totalPending = weeklyCalculations.reduce((sum: number, calc: any) => sum + Number(calc.grossAmount), 0);
  const totalPaid = payments.reduce((sum: number, payment: any) => sum + Number(payment.paidAmount), 0);
  const totalOutstanding = workers.reduce((sum: number, worker: any) => sum + Number(worker.balance), 0);

  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(nextPaymentDate.getDate() + ((1 + 7 - nextPaymentDate.getDay()) % 7)); // Next Monday

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700" 
            data-testid="button-process-payments"
            onClick={() => {
              setShowPaymentForm(true);
              setSelectedWorker(null);
              setPaymentType("full");
            }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Process Payments
          </Button>
          <Select value={periodFilter} onValueChange={setPeriodFilter} data-testid="select-payment-period">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500" data-testid="text-next-payment">
          Next Payment Day: <span className="font-medium text-blue-600">
            {nextPaymentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Payment Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white" data-testid="card-pending-payments">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-pending-amount">
                  ₹{totalPending.toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="text-yellow-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">for {weeklyCalculations.length} workers</p>
          </CardContent>
        </Card>

        <Card className="bg-white" data-testid="card-paid-amount">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Week Paid</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-paid-amount">
                  ₹{totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">to {payments.length} workers</p>
          </CardContent>
        </Card>

        <Card className="bg-white" data-testid="card-outstanding-balance">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Outstanding Balance</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-outstanding-amount">
                  ₹{totalOutstanding.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">overdue amounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    This Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weeklyCalculations.length > 0 ? (
                  weeklyCalculations.map((calc: any, index: number) => (
                    <tr key={calc.workerId} data-testid={`row-payment-${calc.workerId}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {calc.workerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900" data-testid={`text-worker-name-${index}`}>
                              {calc.workerName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {calc.workerId.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={calc.workerType === 'rojdaar' ? 'erp-badge-rojdaar' : 'erp-badge-karagir'}
                          data-testid={`badge-type-${index}`}
                        >
                          {calc.workerType === 'rojdaar' ? 'Rojdaar' : 'Karagir'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-work-summary-${index}`}>
                        {calc.workerType === 'rojdaar' 
                          ? `${calc.daysWorked} days worked`
                          : `${calc.bricksProduced} bricks produced`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`text-due-amount-${index}`}>
                        ₹{Number(calc.grossAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-current-balance-${index}`}>
                        ₹{Number(calc.currentBalance).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          data-testid={`button-pay-full-${index}`}
                          onClick={() => {
                            const worker = workers.find((w: any) => w.id === calc.workerId);
                            if (worker) {
                              setSelectedWorker(worker);
                              setPaymentType("full");
                              setShowPaymentForm(true);
                            }
                          }}
                        >
                          Pay Full
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          data-testid={`button-partial-${index}`}
                          onClick={() => {
                            const worker = workers.find((w: any) => w.id === calc.workerId);
                            if (worker) {
                              setSelectedWorker(worker);
                              setPaymentType("partial");
                              setShowPaymentForm(true);
                            }
                          }}
                        >
                          Partial
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500" data-testid="no-payments">
                      No payment calculations available for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedWorker 
                ? `${paymentType === 'full' ? 'Pay Full' : 'Partial Payment'} - ${selectedWorker.name}`
                : 'Process Payment'
              }
            </DialogTitle>
          </DialogHeader>
          {selectedWorker ? (
            <PaymentForm 
              worker={selectedWorker}
              onSuccess={() => {
                setShowPaymentForm(false);
                setSelectedWorker(null);
                // Refresh the data
                window.location.reload();
              }}
              onCancel={() => {
                setShowPaymentForm(false);
                setSelectedWorker(null);
              }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Please select a worker from the payment schedule to process payment.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
