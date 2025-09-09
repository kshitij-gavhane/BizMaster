import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, FileText, Edit, CheckCircle, XCircle } from "lucide-react";
import SalesOrderForm from "@/components/forms/SalesOrderForm";
import { queryClient } from "@/lib/queryClient";
import type { SalesOrder, Customer } from "@shared/schema";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const { data: orders = [], isLoading } = useQuery<SalesOrder[]>({
    queryKey: ["/api/sales-orders"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
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

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/sales-orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
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
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
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
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowViewDialog(true);
                            }}
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
                          {order.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => cancelOrder(order.id)}
                              data-testid={`button-cancel-order-${order.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                          {order.status === 'delivered' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowInvoiceDialog(true);
                              }}
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

      {/* View Order Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Sales Order</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Order Number</label>
                  <p className="text-lg font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge className={
                    selectedOrder.status === 'delivered' ? 'erp-badge-delivered' :
                    selectedOrder.status === 'invoiced' ? 'bg-blue-100 text-blue-800' :
                    'erp-badge-pending'
                  }>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-lg">{customers.find((c: any) => c.id === selectedOrder.customerId)?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Order Date</label>
                  <p className="text-lg">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <p className="text-lg">{selectedOrder.quantity.toLocaleString()} bricks</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rate per Brick</label>
                  <p className="text-lg">₹{Number(selectedOrder.ratePerBrick).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="text-xl font-bold text-green-600">₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Vehicle</label>
                  <p className="text-lg">{selectedOrder.vehicleType} - {selectedOrder.vehicleNumber}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Driver</label>
                <p className="text-lg">{selectedOrder.driverName}</p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="text-center border-b-2 border-gray-300 pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Him Bricks</h1>
                <p className="text-gray-600 mt-2">Invoice</p>
                <p className="text-sm text-gray-500">Your Trusted Brick Supplier</p>
              </div>

              {/* Company & Customer Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">From:</h3>
                  <p className="font-medium">Him Bricks</p>
                  <p className="text-gray-600">76, Vaknath</p>
                  <p className="text-gray-600">Pulgaon Bypass, Pulgaon</p>
                  <p className="text-gray-600">Phone: +91 9890138621</p>
                  <p className="text-gray-600">Email: himbricks01@gmail.com</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">To:</h3>
                  <p className="font-medium">{customers.find((c: any) => c.id === selectedOrder.customerId)?.name}</p>
                  <p className="text-gray-600">{customers.find((c: any) => c.id === selectedOrder.customerId)?.address || 'Address not provided'}</p>
                  <p className="text-gray-600">Phone: {customers.find((c: any) => c.id === selectedOrder.customerId)?.phone || 'Not provided'}</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="border border-gray-300 p-3 rounded">
                  <p className="text-sm text-gray-600">Invoice #</p>
                  <p className="font-semibold">INV-{selectedOrder.orderNumber}</p>
                </div>
                <div className="border border-gray-300 p-3 rounded">
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                </div>
                <div className="border border-gray-300 p-3 rounded">
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Rate</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-900">High Quality Bricks</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{selectedOrder.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">₹{Number(selectedOrder.ratePerBrick).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{Number(selectedOrder.totalAmount).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{Number(selectedOrder.totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (0%):</span>
                    <span className="font-medium">₹0.00</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold text-green-600">₹{Number(selectedOrder.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="border-t border-gray-300 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Delivery Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type: <span className="font-medium">{selectedOrder.vehicleType}</span></p>
                    <p className="text-sm text-gray-600">Vehicle Number: <span className="font-medium">{selectedOrder.vehicleNumber}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Driver: <span className="font-medium">{selectedOrder.driverName}</span></p>
                    <p className="text-sm text-gray-600">Delivery Date: <span className="font-medium">{selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : 'Pending'}</span></p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-300">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInvoiceDialog(false)}
                >
                  Close
                </Button>
                <Button 
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    // Mark as invoiced
                    markAsDelivered(selectedOrder.id);
                    setShowInvoiceDialog(false);
                  }}
                >
                  Mark as Invoiced
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
