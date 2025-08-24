import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, DollarSign, CreditCard } from "lucide-react";
import WorkerForm from "@/components/forms/WorkerForm";
import PaymentForm from "@/components/forms/PaymentForm";
import { AdvancePaymentForm } from "@/components/forms/AdvancePaymentForm";
import { queryClient } from "@/lib/queryClient";
import type { Worker } from "@shared/schema";

export default function Workers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);

  const { data: workers = [], isLoading } = useQuery({
    queryKey: ["/api/workers"],
  });

  const deleteWorkerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workers/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete worker");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
    },
  });

  const filteredWorkers = workers.filter((worker: Worker) => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || worker.type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Dialog open={showWorkerForm} onOpenChange={setShowWorkerForm}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700" data-testid="button-add-worker">
                <Plus className="mr-2 h-4 w-4" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Worker</DialogTitle>
              </DialogHeader>
              <WorkerForm 
                onSuccess={() => setShowWorkerForm(false)}
                onCancel={() => setShowWorkerForm(false)}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => setShowAdvanceForm(true)}
            data-testid="button-advance-payment"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Give Advance
          </Button>
          
          <Select value={filterType} onValueChange={setFilterType} data-testid="select-worker-type">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workers</SelectItem>
              <SelectItem value="rojdaar">Rojdaar (Daily Wage)</SelectItem>
              <SelectItem value="karagir">Karagir (Piece Rate)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
            data-testid="input-search-workers"
          />
          <Button variant="outline" size="icon" data-testid="button-search">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Workers Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
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
                {filteredWorkers.length > 0 ? (
                  filteredWorkers.map((worker: Worker) => (
                    <tr key={worker.id} data-testid={`row-worker-${worker.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900" data-testid={`text-worker-name-${worker.id}`}>
                              {worker.name}
                            </div>
                            <div className="text-sm text-gray-500">ID: {worker.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={worker.type === 'rojdaar' ? 'erp-badge-rojdaar' : 'erp-badge-karagir'}
                          data-testid={`badge-type-${worker.id}`}
                        >
                          {worker.type === 'rojdaar' ? 'Rojdaar' : 'Karagir'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-rate-${worker.id}`}>
                        {worker.type === 'rojdaar' 
                          ? `₹${worker.dailyWage}/day`
                          : `₹${worker.pieceRate}/brick`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-phone-${worker.id}`}>
                        {worker.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-balance-${worker.id}`}>
                        ₹{Number(worker.balance).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowWorkerForm(true);
                          }}
                          data-testid={`button-edit-${worker.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowPaymentForm(true);
                          }}
                          data-testid={`button-pay-${worker.id}`}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pay
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowAdvanceForm(true);
                          }}
                          data-testid={`button-advance-${worker.id}`}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Advance
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500" data-testid="no-workers">
                      {searchTerm || filterType !== "all" ? "No workers match your criteria" : "No workers found. Add your first worker to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Process Payment - {selectedWorker?.name}</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <PaymentForm 
              worker={selectedWorker}
              onSuccess={() => setShowPaymentForm(false)}
              onCancel={() => setShowPaymentForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Worker Dialog */}
      <Dialog open={showWorkerForm && selectedWorker !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedWorker(null);
          setShowWorkerForm(false);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Worker - {selectedWorker?.name}</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <WorkerForm 
              worker={selectedWorker}
              onSuccess={() => {
                setSelectedWorker(null);
                setShowWorkerForm(false);
              }}
              onCancel={() => {
                setSelectedWorker(null);
                setShowWorkerForm(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Advance Payment Dialog */}
      <AdvancePaymentForm
        workers={workers}
        selectedWorkerId={selectedWorker?.id}
        open={showAdvanceForm}
        onOpenChange={(open) => {
          setShowAdvanceForm(open);
          if (!open) setSelectedWorker(null);
        }}
      />
    </div>
  );
}
