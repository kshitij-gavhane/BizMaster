import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sales_provider.dart';
import '../providers/customers_provider.dart';
import '../models/sales_order.dart';
import '../widgets/sales_order_form.dart';

class SalesScreen extends StatefulWidget {
  const SalesScreen({super.key});

  @override
  State<SalesScreen> createState() => _SalesScreenState();
}

class _SalesScreenState extends State<SalesScreen> {
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<SalesProvider>(context, listen: false).loadOrders();
      Provider.of<CustomersProvider>(context, listen: false).loadCustomers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer2<SalesProvider, CustomersProvider>(
        builder: (context, salesProvider, customersProvider, child) {
          if (salesProvider.isLoading || customersProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final filteredOrders = salesProvider.getOrdersByStatus(_statusFilter);

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: DropdownButtonFormField<String>(
                  value: _statusFilter,
                  decoration: const InputDecoration(
                    labelText: 'Filter by Status',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('All Orders')),
                    DropdownMenuItem(value: 'pending', child: Text('Pending')),
                    DropdownMenuItem(value: 'delivered', child: Text('Delivered')),
                    DropdownMenuItem(value: 'invoiced', child: Text('Invoiced')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _statusFilter = value!;
                    });
                  },
                ),
              ),
              Expanded(
                child: filteredOrders.isEmpty
                    ? const Center(child: Text('No orders found'))
                    : ListView.builder(
                        itemCount: filteredOrders.length,
                        itemBuilder: (context, index) {
                          final order = filteredOrders[index];
                          final customer = customersProvider.getCustomerById(order.customerId);
                          
                          return Card(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 4),
                            child: ListTile(
                              title: Text('Order ${order.orderNumber}'),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Customer: ${customer?.name ?? 'Unknown'}'),
                                  Text('Quantity: ${order.quantity} bricks'),
                                  Text('Vehicle: ${order.vehicleType} - ${order.vehicleNumber}'),
                                  Text('Driver: ${order.driverName}'),
                                  Text('Total: ₹${double.parse(order.totalAmount).toStringAsFixed(2)}'),
                                ],
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Chip(
                                    label: Text(_getStatusText(order.status)),
                                    backgroundColor: _getStatusColor(order.status),
                                  ),
                                  if (order.status == 'pending')
                                    IconButton(
                                      icon: const Icon(Icons.check_circle),
                                      onPressed: () => _markAsDelivered(order.id),
                                      tooltip: 'Mark as Delivered',
                                    ),
                                ],
                              ),
                              isThreeLine: true,
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showSalesOrderForm(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'delivered':
        return 'Delivered';
      case 'invoiced':
        return 'Invoiced';
      default:
        return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange.shade100;
      case 'delivered':
        return Colors.green.shade100;
      case 'invoiced':
        return Colors.blue.shade100;
      default:
        return Colors.grey.shade100;
    }
  }

  void _showSalesOrderForm(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: const SalesOrderForm(),
      ),
    );
  }

  void _markAsDelivered(String orderId) async {
    final provider = Provider.of<SalesProvider>(context, listen: false);
    try {
      await provider.markAsDelivered(orderId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order marked as delivered')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update order: $e')),
        );
      }
    }
  }
}