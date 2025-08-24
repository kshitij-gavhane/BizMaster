import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, FileText, Edit, CheckCircle } from "lucide-react";
import SalesOrderForm from "@/components/forms/SalesOrderForm";
import { queryClient } from "@/lib/queryClient";
import type { SalesOrder } from "@shared/schema";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/sales-orders"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const filteredOrders = orders.filter((order: SalesOrder) => {
    const customer = customers.find((c: any) => c.id === order.customerId);
    const customerName = customer?.name || "";
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const markAsDelivered = async (orderId: string) => {
    try {
      const response = await fetch(`/api/sales-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "delivered",
          deliveryDate: new Date().toISOString().split('T')[0]
        }),
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      }
    } catch (error) {
      console.error("Failed to mark order as delivered:", error);
    }
  };

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
        <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" data-testid="button-new-sales-order">
              <Plus className="mr-2 h-4 w-4" />
              New Sales Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Sales Order</DialogTitle>
            </DialogHeader>
            <SalesOrderForm 
              customers={customers}
              onSuccess={() => setShowOrderForm(false)}
              onCancel={() => setShowOrderForm(false)}
            />
          </DialogContent>
        </Dialog>
        
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="select-status-filter">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="invoiced">Invoiced</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="search"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
            data-testid="input-search-orders"
          />
          <Button variant="outline" size="icon" data-testid="button-search">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: SalesOrder) => {
                    const customer = customers.find((c: any) => c.id === order.customerId);
                    
                    return (
                      <tr key={order.id} data-testid={`row-order-${order.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`text-order-number-${order.id}`}>
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-customer-${order.id}`}>
                          {customer?.name || 'Unknown Customer'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-quantity-${order.id}`}>
                          {order.quantity.toLocaleString()} bricks
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-vehicle-${order.id}`}>
                          {order.vehicleType} - {order.vehicleNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-driver-${order.id}`}>
                          {order.driverName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={
                              order.status === 'delivered' ? 'erp-badge-delivered' :
                              order.status === 'invoiced' ? 'bg-blue-100 text-blue-800' :
                              'erp-badge-pending'
                            }
                            data-testid={`badge-status-${order.id}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-view-${order.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {order.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => markAsDelivered(order.id)}
                              data-testid={`button-mark-delivered-${order.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Delivered
                            </Button>
                          )}
                          {order.status === 'delivered' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              data-testid={`button-invoice-${order.id}`}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                          )}
                          {order.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-edit-${order.id}`}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500" data-testid="no-orders">
                      {searchTerm || statusFilter !== "all" ? "No orders match your criteria" : "No sales orders found. Create your first order to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
