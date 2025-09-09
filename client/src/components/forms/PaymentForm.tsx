import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertPaymentSchema, type Worker, type InsertPayment } from "@shared/schema";
import { z } from "zod";

const paymentFormSchema = insertPaymentSchema.extend({
  weekStartDate: z.string().min(1, "Week start date is required"),
  weekEndDate: z.string().min(1, "Week end date is required"),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  worker: Worker;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ worker, onSuccess, onCancel }: PaymentFormProps) {
  const { toast } = useToast();
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [availableAdvance, setAvailableAdvance] = useState(0);

  // Calculate current week dates
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStartDate = monday.toISOString().split('T')[0];
  const weekEndDate = sunday.toISOString().split('T')[0];

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      workerId: worker.id,
      weekStartDate,
      weekEndDate,
      daysWorked: 0,
      bricksProduced: 0,
      grossAmount: "0",
      paidAmount: "0",
      balanceAmount: "0",
      notes: "",
    },
  });

  // Fetch attendance data for the current week
  const { data: attendance = [] } = useQuery({
    queryKey: ["/api/attendance/worker", worker.id, weekStartDate, weekEndDate],
    queryFn: async () => {
      const response = await fetch(`/api/attendance/worker/${worker.id}?weekStart=${weekStartDate}&weekEnd=${weekEndDate}`);
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    },
  });

  // Fetch total available advance for the worker
  useEffect(() => {
    async function fetchAdvance() {
      try {
        const res = await fetch(`/api/advance-payments?workerId=${worker.id}`);
        if (!res.ok) return;
        const advances = await res.json();
        const totalRemaining = advances
          .map((a: any) => Math.max(0, Number(a.amount) - Number(a.adjustedAmount || 0)))
          .reduce((s: number, v: number) => s + v, 0);
        setAvailableAdvance(totalRemaining);
      } catch {}
    }
    fetchAdvance();
  }, [worker.id]);

  const processPaymentMutation = useMutation({
    mutationFn: async (data: InsertPayment & { applyAdvanceAmount?: number }) => {
      const response = await apiRequest("POST", "/api/payments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Success", description: "Payment processed successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to process payment", 
        variant: "destructive" 
      });
      console.error("Process payment error:", error);
    },
  });

  // Calculate payment details when attendance changes
  useEffect(() => {
    if (attendance.length === 0) return;

    let grossAmount = 0;
    let daysWorked = 0;
    let bricksProduced = 0;

    if (worker.type === 'rojdaar') {
      daysWorked = attendance.filter((a: any) => a.isPresent).length;
      grossAmount = daysWorked * Number(worker.dailyWage || 0);
    } else if (worker.type === 'karagir') {
      bricksProduced = attendance.reduce((sum: number, a: any) => sum + (a.bricksProduced || 0), 0);
      grossAmount = bricksProduced * Number(worker.pieceRate || 0);
    }

    form.setValue("daysWorked", daysWorked);
    form.setValue("bricksProduced", bricksProduced);
    form.setValue("grossAmount", grossAmount.toFixed(2));
    
    if (!isPartialPayment) {
      form.setValue("paidAmount", grossAmount.toFixed(2));
      form.setValue("balanceAmount", "0");
    }
  }, [attendance, worker, isPartialPayment, form]);

  // Update balance when paid amount changes
  const paidAmount = form.watch("paidAmount");
  const grossAmount = form.watch("grossAmount");
  const [advanceApplied, setAdvanceApplied] = useState(0);
  const [manualAdvanceCut, setManualAdvanceCut] = useState<number | null>(null);

  useEffect(() => {
    let balance = Number(grossAmount) - Number(paidAmount);
    async function applyAdvances() {
      try {
        const desiredCut = manualAdvanceCut ?? Math.max(0, balance);
        const use = Math.min(availableAdvance, desiredCut);
        setAdvanceApplied(use);
        balance = balance - use;
      } catch {}
      form.setValue("balanceAmount", balance.toFixed(2));
    }
    applyAdvances();
  }, [paidAmount, grossAmount, form, worker.id, manualAdvanceCut, availableAdvance]);

  // For non-partial payments, auto-apply advances to reduce payable amount by default
  useEffect(() => {
    if (isPartialPayment) return;
    async function autoApplyForFullPayment() {
      try {
        const gross = Number(form.getValues("grossAmount"));
        const desiredCut = manualAdvanceCut ?? gross;
        const use = Math.min(availableAdvance, desiredCut);
        setAdvanceApplied(use);
        const pay = Math.max(0, gross - use);
        form.setValue("paidAmount", pay.toFixed(2));
        form.setValue("balanceAmount", "0");
      } catch {}
    }
    autoApplyForFullPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPartialPayment, worker.id, form.watch("grossAmount"), manualAdvanceCut, availableAdvance]);

  const onSubmit = (data: PaymentFormData) => {
    const paymentData: InsertPayment = {
      workerId: data.workerId,
      weekStartDate: data.weekStartDate,
      weekEndDate: data.weekEndDate,
      daysWorked: data.daysWorked || null,
      bricksProduced: data.bricksProduced || null,
      grossAmount: data.grossAmount,
      paidAmount: data.paidAmount,
      balanceAmount: data.balanceAmount,
      notes: data.notes || null,
    };

    const applyAdvanceAmount = isPartialPayment
      ? (manualAdvanceCut ?? 0)
      : advanceApplied;

    processPaymentMutation.mutate({ ...paymentData, applyAdvanceAmount });
  };

  const weekRange = `${new Date(weekStartDate).toLocaleDateString()} - ${new Date(weekEndDate).toLocaleDateString()}`;

  return (
    <div className="space-y-6" data-testid="form-payment">
      {/* Worker Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {worker.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg" data-testid="text-worker-name">
                  {worker.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={worker.type === 'rojdaar' ? 'erp-badge-rojdaar' : 'erp-badge-karagir'}>
                    {worker.type === 'rojdaar' ? 'Rojdaar' : 'Karagir'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {worker.type === 'rojdaar' 
                      ? `₹${worker.dailyWage}/day` 
                      : `₹${worker.pieceRate}/brick`
                    }
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Balance</div>
              <div className="text-lg font-bold text-gray-900" data-testid="text-current-balance">
                ₹{Number(worker.balance).toLocaleString()}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Payment Period:</span> {weekRange}
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Work Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Work Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Advance Available</Label>
                <div className="text-lg font-semibold text-gray-900">₹{availableAdvance.toFixed(2)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Advance Used This Payment</Label>
                <div className="text-lg font-semibold text-gray-900">₹{advanceApplied.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Days Worked</Label>
                <div className="text-lg font-semibold text-gray-900" data-testid="text-days-worked">
                  {form.watch("daysWorked")}
                </div>
              </div>
              {worker.type === 'karagir' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bricks Produced</Label>
                  <div className="text-lg font-semibold text-gray-900" data-testid="text-bricks-produced">
                    {Number(form.watch("bricksProduced") || 0).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Gross Amount</Label>
              <div className="text-xl font-bold text-green-600" data-testid="text-gross-amount">
                ₹{Number(form.watch("grossAmount")).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Payment Details</CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="partial-payment" className="text-sm">Partial Payment</Label>
                <input
                  type="checkbox"
                  id="partial-payment"
                  checked={isPartialPayment}
                  onChange={(e) => setIsPartialPayment(e.target.checked)}
                  className="rounded"
                  data-testid="checkbox-partial-payment"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paid-amount" className="text-sm font-medium text-gray-700">
                Amount to Pay *
              </Label>
              <Input
                id="paid-amount"
                type="number"
                step="0.01"
                min="0"
                max={form.watch("grossAmount")}
                {...form.register("paidAmount")}
                disabled={!isPartialPayment}
                className="mt-1"
                data-testid="input-paid-amount"
              />
              {form.formState.errors.paidAmount && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.paidAmount.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Balance Amount</Label>
              <div className={`text-lg font-semibold ${
                Number(form.watch("balanceAmount")) > 0 ? 'text-red-600' : 'text-green-600'
              }`} data-testid="text-balance-amount">
                ₹{Number(form.watch("balanceAmount")).toLocaleString()}
              </div>
              {advanceApplied > 0 && (
                <div className="text-sm text-gray-500">Auto-applied advance: ₹{advanceApplied.toFixed(2)}</div>
              )}
            </div>

            <div>
              <Label htmlFor="advance-cut" className="text-sm font-medium text-gray-700">Cut Advance (₹)</Label>
              <Input
                id="advance-cut"
                type="number"
                step="0.01"
                min="0"
                value={manualAdvanceCut ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  if (val === null) return setManualAdvanceCut(null);
                  setManualAdvanceCut(Math.max(0, Math.min(val, availableAdvance)));
                }}
                placeholder="Enter amount to adjust from advance"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-use up to balance. Remaining after cut: ₹{(availableAdvance - advanceApplied).toFixed(2)}</p>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Add payment notes..."
                rows={3}
                className="mt-1"
                data-testid="textarea-payment-notes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={processPaymentMutation.isPending}
            data-testid="button-cancel-payment"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={processPaymentMutation.isPending || Number(form.watch("grossAmount")) === 0}
            data-testid="button-process-payment"
          >
            {processPaymentMutation.isPending ? "Processing..." : "Process Payment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
