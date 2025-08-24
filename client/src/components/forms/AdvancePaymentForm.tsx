import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const advancePaymentSchema = z.object({
  workerId: z.string().min(1, "Please select a worker"),
  amount: z.string().min(1, "Please enter amount").regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type AdvancePaymentFormData = z.infer<typeof advancePaymentSchema>;

interface Worker {
  id: string;
  name: string;
  type: string;
  balance: string;
}

interface AdvancePaymentFormProps {
  workers: Worker[];
  selectedWorkerId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvancePaymentForm({ workers, selectedWorkerId, open, onOpenChange }: AdvancePaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdvancePaymentFormData>({
    resolver: zodResolver(advancePaymentSchema),
    defaultValues: {
      workerId: selectedWorkerId || "",
      amount: "",
      reason: "",
      notes: "",
    },
  });

  const advancePaymentMutation = useMutation({
    mutationFn: async (data: AdvancePaymentFormData) => {
      const response = await fetch("/api/advance-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to process advance payment");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/advance-payments"] });
      toast({
        title: "Advance Payment Processed",
        description: "The advance payment has been successfully processed.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdvancePaymentFormData) => {
    advancePaymentMutation.mutate(data);
  };

  const selectedWorker = workers.find(w => w.id === form.watch("workerId"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Give Advance Payment</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="workerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worker</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-worker">
                        <SelectValue placeholder="Select a worker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name} ({worker.type}) - Balance: ₹{worker.balance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedWorker && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Current Balance:</strong> ₹{selectedWorker.balance}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  After advance, balance will be: ₹{(Number(selectedWorker.balance) - Number(form.watch("amount") || 0)).toFixed(2)}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      placeholder="Enter advance amount" 
                      data-testid="input-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-reason">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional notes..." 
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={advancePaymentMutation.isPending}
                data-testid="button-submit"
              >
                {advancePaymentMutation.isPending ? "Processing..." : "Give Advance"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}