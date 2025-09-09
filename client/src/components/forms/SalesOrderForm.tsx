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
import { insertSalesOrderSchema, type Customer, type InsertSalesOrder } from "@shared/schema";
import { z } from "zod";
import { useState, useEffect } from "react";

const salesOrderFormSchema = insertSalesOrderSchema.extend({
  orderDate: z.string().min(1, "Order date is required"),
});

type SalesOrderFormData = z.infer<typeof salesOrderFormSchema>;

interface SalesOrderFormProps {
  customers: Customer[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SalesOrderForm({ customers, onSuccess, onCancel }: SalesOrderFormProps) {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  const form = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderFormSchema),
    defaultValues: {
      customerId: "",
      quantity: 0,
      ratePerBrick: "",
      vehicleType: "",
      vehicleNumber: "",
      driverName: "",
      ownFleet: false as any,
      driverWorkerId: undefined as any,
      orderDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const quantity = form.watch("quantity");
  const ratePerBrick = form.watch("ratePerBrick");

  // Auto-calculate total amount
  useEffect(() => {
    const amount = Number(quantity) * Number(ratePerBrick);
    setCalculatedAmount(isNaN(amount) ? 0 : amount);
  }, [quantity, ratePerBrick]);

  // Auto-fill rate when customer is selected
  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      form.setValue("customerId", customerId);
      form.setValue("ratePerBrick", customer.ratePerBrick);
    }
  };

  const createSalesOrderMutation = useMutation({
    mutationFn: async (data: InsertSalesOrder) => {
      const response = await apiRequest("POST", "/api/sales-orders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({ title: "Success", description: "Sales order created successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create sales order", 
        variant: "destructive" 
      });
      console.error("Create sales order error:", error);
    },
  });

  const onSubmit = (data: SalesOrderFormData) => {
    const salesOrderData: InsertSalesOrder = {
      customerId: data.customerId,
      quantity: data.quantity,
      ratePerBrick: data.ratePerBrick,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      driverName: data.driverName,
      ownFleet: (data as any).ownFleet ?? false,
      driverWorkerId: (data as any).driverWorkerId || null,
      orderDate: data.orderDate,
      notes: data.notes || null,
    };

    createSalesOrderMutation.mutate(salesOrderData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-sales-order">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select 
                  onValueChange={handleCustomerChange} 
                  value={field.value}
                  data-testid="select-customer"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} (₹{Number(customer.ratePerBrick).toFixed(2)}/brick)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Date *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="date"
                    data-testid="input-order-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity (Bricks) *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-quantity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ratePerBrick"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate per Brick (₹) *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    step="0.0001"
                    placeholder="Rate per brick"
                    data-testid="input-rate-per-brick"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col justify-end">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="text-lg font-bold text-gray-900" data-testid="text-total-amount">
                ₹{calculatedAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} data-testid="select-vehicle-type">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="tractor">Tractor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Number *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., MP 09 AB 1234"
                    data-testid="input-vehicle-number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="driverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Driver Name *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter driver name"
                  data-testid="input-driver-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="own-fleet" {...form.register("ownFleet" as any)} />
            <label htmlFor="own-fleet" className="text-sm">Delivered by own fleet</label>
          </div>
          {(form.watch("ownFleet" as any) as unknown as boolean) && (
            <FormField
              control={form.control}
              name={"driverWorkerId" as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter driver worker ID (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Any additional notes..."
                  rows={3}
                  data-testid="textarea-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCustomer && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Customer Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-blue-700">
                <span className="font-medium">Name:</span> {selectedCustomer.name}
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Phone:</span> {selectedCustomer.phone || 'N/A'}
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Rate:</span> ₹{Number(selectedCustomer.ratePerBrick).toFixed(4)}/brick
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Total Orders:</span> {selectedCustomer.totalOrders}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createSalesOrderMutation.isPending}
            data-testid="button-cancel-sales-order"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={createSalesOrderMutation.isPending}
            data-testid="button-create-sales-order"
          >
            {createSalesOrderMutation.isPending ? "Creating..." : "Create Sales Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
