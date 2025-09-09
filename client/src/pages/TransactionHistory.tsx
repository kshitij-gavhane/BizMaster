import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Calendar, User, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import type { Worker, Payment, AdvancePayment } from "@shared/schema";

interface Transaction {
  id: string;
  type: 'payment' | 'advance';
  workerId: string;
  workerName: string;
  amount: number;
  date: Date;
  description: string;
  originalData: Payment | AdvancePayment;
}

export default function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  // Fetch data
  const { data: workers = [] } = useQuery({
    queryKey: ["/api/workers"],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: advancePayments = [] } = useQuery({
    queryKey: ["/api/advance-payments"],
  });

  // Combine and format transactions
  const transactions: Transaction[] = useMemo(() => {
    const allTransactions: Transaction[] = [];

    // Add regular payments
    payments.forEach((payment: any) => {
      const worker = workers.find((w: any) => w.id === payment.workerId);
      if (worker) {
        allTransactions.push({
          id: payment.id,
          type: 'payment',
          workerId: payment.workerId,
          workerName: worker.name,
          amount: Number(payment.paidAmount),
          date: new Date(payment.paymentDate),
          description: `Paid salary ₹${Number(payment.paidAmount).toLocaleString()} to ${worker.name}`,
          originalData: payment
        });
      }
    });

    // Add advance payments
    advancePayments.forEach((advance: any) => {
      const worker = workers.find((w: any) => w.id === advance.workerId);
      if (worker) {
        allTransactions.push({
          id: advance.id,
          type: 'advance',
          workerId: advance.workerId,
          workerName: worker.name,
          amount: Number(advance.amount),
          date: new Date(advance.paymentDate),
          description: `Paid advance payment ₹${Number(advance.amount).toLocaleString()} to ${worker.name}`,
          originalData: advance
        });
      }
    });

    // Sort by date (newest first)
    return allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [payments, advancePayments, workers]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorker = selectedWorker === "all" || transaction.workerId === selectedWorker;
      const matchesDate = dateFilter === "all" || 
                         (dateFilter === "today" && isToday(transaction.date)) ||
                         (dateFilter === "week" && isThisWeek(transaction.date)) ||
                         (dateFilter === "month" && isThisMonth(transaction.date));

      return matchesSearch && matchesWorker && matchesDate;
    });
  }, [transactions, searchTerm, selectedWorker, dateFilter]);

  // Date helper functions
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return date >= weekStart && date <= weekEnd;
  };

  const isThisMonth = (date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  // Calculate summary statistics
  const totalPayments = filteredTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
  const totalAdvances = filteredTransactions.filter(t => t.type === 'advance').reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalPayments - totalAdvances;

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-2">Complete record of all payment activities</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by worker name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Worker</label>
              <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                <SelectTrigger>
                  <SelectValue placeholder="All Workers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workers</SelectItem>
                  {workers.map((worker: any) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedWorker("all");
                  setDateFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Payments</p>
                <p className="text-2xl font-bold text-green-900">₹{totalPayments.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Advances</p>
                <p className="text-2xl font-bold text-red-900">₹{totalAdvances.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="text-red-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Net Amount</p>
                <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                  ₹{netAmount.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction Records ({filteredTransactions.length})</span>
            <span className="text-sm font-normal text-gray-500">
              Sorted by date (newest first)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'payment' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'payment' ? (
                        <TrendingUp className="h-6 w-6" />
                      ) : (
                        <TrendingDown className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {transaction.workerName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {transaction.date.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'payment' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'payment' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </div>
                    <Badge className={`mt-1 ${
                      transaction.type === 'payment' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'payment' ? 'Payment' : 'Advance'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {transactions.length === 0 ? (
                  "No transactions found. Start making payments to see transaction history."
                ) : (
                  "No transactions match your current filters. Try adjusting your search criteria."
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={showTransactionDetail} onOpenChange={setShowTransactionDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Header */}
              <div className="text-center border-b border-gray-200 pb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  selectedTransaction.type === 'payment' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {selectedTransaction.type === 'payment' ? (
                    <TrendingUp className="h-8 w-8" />
                  ) : (
                    <TrendingDown className="h-8 w-8" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTransaction.type === 'payment' ? 'Salary Payment' : 'Advance Payment'}
                </h3>
                <p className="text-gray-600">
                  {selectedTransaction.description}
                </p>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-lg font-mono">{selectedTransaction.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-lg">{selectedTransaction.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Worker</label>
                  <p className="text-lg">{selectedTransaction.workerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className={`text-xl font-bold ${
                    selectedTransaction.type === 'payment' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Type-specific Details */}
              {selectedTransaction.type === 'payment' ? (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Week Period</label>
                      <p className="text-lg">
                        {selectedTransaction.originalData.weekStartDate} to {selectedTransaction.originalData.weekEndDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Gross Amount</label>
                      <p className="text-lg">₹{Number(selectedTransaction.originalData.grossAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Days Worked</label>
                      <p className="text-lg">{selectedTransaction.originalData.daysWorked || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Bricks Produced</label>
                      <p className="text-lg">{selectedTransaction.originalData.bricksProduced || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedTransaction.originalData.notes && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-lg">{selectedTransaction.originalData.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Advance Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Reason</label>
                      <p className="text-lg">{selectedTransaction.originalData.reason || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Payment Method</label>
                      <p className="text-lg">Cash/Transfer</p>
                    </div>
                  </div>
                  {selectedTransaction.originalData.notes && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-lg">{selectedTransaction.originalData.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTransactionDetail(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
