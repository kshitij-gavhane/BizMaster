import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertCustomerSchema, type Customer, type InsertCustomer } from "@shared/schema";

type CustomerFormData = InsertCustomer;

interface CustomerFormProps {
  customer?: Customer;
  embedded?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CustomerForm({ customer, embedded = false, onSuccess, onCancel }: CustomerFormProps) {
  const { toast } = useToast();
  const isEditing = !!customer;

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: customer?.name || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      ratePerBrick: customer?.ratePerBrick || "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const response = await apiRequest("POST", "/api/customers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      if (!embedded) {
        toast({ title: "Success", description: "Customer created successfully" });
      }
      form.reset();
      if (!embedded) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create customer", 
        variant: "destructive" 
      });
      console.error("Create customer error:", error);
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const response = await apiRequest("PUT", `/api/customers/${customer!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Success", description: "Customer updated successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update customer", 
        variant: "destructive" 
      });
      console.error("Update customer error:", error);
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (isEditing) {
      updateCustomerMutation.mutate(data);
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  const isLoading = createCustomerMutation.isPending || updateCustomerMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-customer">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter customer name"
                  data-testid="input-customer-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="tel"
                  placeholder="Enter phone number"
                  data-testid="input-customer-phone"
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
                  placeholder="Enter rate per brick"
                  data-testid="input-rate-per-brick"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter customer address"
                  rows={3}
                  data-testid="textarea-customer-address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!embedded && (
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              data-testid="button-cancel-customer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={isLoading}
              data-testid="button-save-customer"
            >
              {isLoading ? "Saving..." : isEditing ? "Update Customer" : "Add Customer"}
            </Button>
          </div>
        )}

        {embedded && (
          <Button 
            type="submit" 
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            disabled={isLoading}
            data-testid="button-add-customer-embedded"
          >
            {isLoading ? "Adding..." : "Add Customer"}
          </Button>
        )}
      </form>
    </Form>
  );
}
