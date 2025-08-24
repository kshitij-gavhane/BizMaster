import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import CustomerForm from "@/components/forms/CustomerForm";
import type { Customer } from "@shared/schema";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

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
        <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" data-testid="button-add-customer">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm 
              onSuccess={() => setShowCustomerForm(false)}
              onCancel={() => setShowCustomerForm(false)}
            />
          </DialogContent>
        </Dialog>
        
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
            data-testid="input-search-customers"
          />
          <Button variant="outline" size="icon" data-testid="button-search">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Directory</h3>
              <div className="divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer: Customer) => (
                    <div 
                      key={customer.id} 
                      className="p-6 hover:bg-gray-50 transition-colors"
                      data-testid={`customer-item-${customer.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900" data-testid={`text-customer-name-${customer.id}`}>
                              {customer.name}
                            </h4>
                            <p className="text-sm text-gray-500" data-testid={`text-customer-phone-${customer.id}`}>
                              Contact: {customer.phone || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500" data-testid={`text-customer-rate-${customer.id}`}>
                              Rate: ₹{Number(customer.ratePerBrick).toFixed(2)}/brick
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900" data-testid={`text-total-orders-${customer.id}`}>
                            Total Orders: {customer.totalOrders}
                          </p>
                          <p className="text-sm text-gray-500" data-testid={`text-last-order-${customer.id}`}>
                            Last Order: {customer.lastOrderDate 
                              ? new Date(customer.lastOrderDate).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500" data-testid="no-customers">
                    {searchTerm ? "No customers match your search" : "No customers found. Add your first customer to get started."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Quick Add */}
        <div>
          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Add Customer</h3>
              <CustomerForm 
                embedded={true}
                onSuccess={() => {}}
                onCancel={() => {}}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
