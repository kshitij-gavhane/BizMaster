import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertInventoryMovementSchema, type InsertInventoryMovement } from "@shared/schema";
import { z } from "zod";

const adjustmentFormSchema = insertInventoryMovementSchema.extend({
  adjustmentType: z.enum(["production", "damage", "manual"]),
  adjustmentQuantity: z.number().min(1, "Quantity must be at least 1"),
});

type AdjustmentFormData = z.infer<typeof adjustmentFormSchema>;

interface InventoryAdjustmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InventoryAdjustmentForm({ onSuccess, onCancel }: InventoryAdjustmentFormProps) {
  const { toast } = useToast();

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      type: "production",
      quantity: 0,
      reason: "",
      adjustmentType: "production",
      adjustmentQuantity: 0,
    },
  });

  const adjustmentType = form.watch("adjustmentType");

  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: InsertInventoryMovement) => {
      const response = await apiRequest("POST", "/api/inventory/movements", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Success", description: "Inventory adjustment applied successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to apply inventory adjustment", 
        variant: "destructive" 
      });
      console.error("Create adjustment error:", error);
    },
  });

  const onSubmit = (data: AdjustmentFormData) => {
    // Determine if it's addition or deduction based on adjustment type
    let quantity = data.adjustmentQuantity;
    let movementType = data.adjustmentType;
    let reason = data.reason;

    if (adjustmentType === "damage") {
      quantity = -Math.abs(quantity); // Always negative for damage
      movementType = "damage";
      reason = reason || "Damaged stock deduction";
    } else if (adjustmentType === "production") {
      quantity = Math.abs(quantity); // Always positive for production
      movementType = "production";
      reason = reason || "Production stock addition";
    } else {
      // Manual adjustment - keep the sign as entered
      movementType = "adjustment";
      reason = reason || "Manual stock adjustment";
    }

    const adjustmentData: InsertInventoryMovement = {
      type: movementType,
      quantity: quantity,
      reason: reason,
      referenceId: null,
    };

    createAdjustmentMutation.mutate(adjustmentData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-inventory-adjustment">
        <FormField
          control={form.control}
          name="adjustmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adjustment Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} data-testid="select-adjustment-type">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="production">Production Addition</SelectItem>
                  <SelectItem value="damage">Damage Deduction</SelectItem>
                  <SelectItem value="manual">Manual Correction</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adjustmentQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Quantity *
                {adjustmentType === "production" && " (Addition)"}
                {adjustmentType === "damage" && " (Deduction)"}
                {adjustmentType === "manual" && " (+ for addition, - for deduction)"}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number"
                  min={adjustmentType === "manual" ? undefined : "1"}
                  placeholder="Enter quantity"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  data-testid="input-adjustment-quantity"
                />
              </FormControl>
              <FormMessage />
              {adjustmentType === "damage" && (
                <p className="text-sm text-red-600">
                  This will reduce inventory by the specified amount
                </p>
              )}
              {adjustmentType === "production" && (
                <p className="text-sm text-green-600">
                  This will add to inventory by the specified amount
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter reason for adjustment"
                  rows={3}
                  data-testid="textarea-adjustment-reason"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Important:</p>
              <p className="text-yellow-700 mt-1">
                This adjustment will immediately modify your current inventory levels. 
                Please ensure the quantity and type are correct before submitting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createAdjustmentMutation.isPending}
            data-testid="button-cancel-adjustment"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={createAdjustmentMutation.isPending}
            data-testid="button-apply-adjustment"
          >
            {createAdjustmentMutation.isPending ? "Applying..." : "Apply Adjustment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
