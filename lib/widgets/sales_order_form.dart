import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/sales_provider.dart';
import '../providers/customers_provider.dart';
import '../models/sales_order.dart';
import '../models/customer.dart';

class SalesOrderForm extends StatefulWidget {
  const SalesOrderForm({super.key});

  @override
  State<SalesOrderForm> createState() => _SalesOrderFormState();
}

class _SalesOrderFormState extends State<SalesOrderForm> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController();
  final _rateController = TextEditingController();
  final _vehicleNumberController = TextEditingController();
  final _driverNameController = TextEditingController();
  final _notesController = TextEditingController();
  
  String? _selectedCustomerId;
  String _vehicleType = 'truck';
  DateTime _orderDate = DateTime.now();
  double _totalAmount = 0.0;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Consumer<CustomersProvider>(
        builder: (context, customersProvider, child) {
          return Form(
            key: _formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Create Sales Order',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _selectedCustomerId,
                    decoration: const InputDecoration(
                      labelText: 'Customer *',
                      border: OutlineInputBorder(),
                    ),
                    items: customersProvider.customers.map((customer) {
                      return DropdownMenuItem(
                        value: customer.id,
                        child: Text('${customer.name} (₹${double.parse(customer.ratePerBrick).toStringAsFixed(2)}/brick)'),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedCustomerId = value;
                        if (value != null) {
                          final customer = customersProvider.getCustomerById(value);
                          if (customer != null) {
                            _rateController.text = customer.ratePerBrick;
                            _calculateTotal();
                          }
                        }
                      });
                    },
                    validator: (value) {
                      if (value == null) {
                        return 'Please select a customer';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _quantityController,
                          decoration: const InputDecoration(
                            labelText: 'Quantity (Bricks) *',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.number,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter quantity';
                            }
                            if (int.tryParse(value) == null) {
                              return 'Please enter a valid number';
                            }
                            return null;
                          },
                          onChanged: (value) => _calculateTotal(),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _rateController,
                          decoration: const InputDecoration(
                            labelText: 'Rate per Brick (₹) *',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.number,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter rate';
                            }
                            return null;
                          },
                          onChanged: (value) => _calculateTotal(),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Amount:'),
                        Text(
                          '₹${_totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _vehicleType,
                    decoration: const InputDecoration(
                      labelText: 'Vehicle Type *',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'truck', child: Text('Truck')),
                      DropdownMenuItem(value: 'tractor', child: Text('Tractor')),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _vehicleType = value!;
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _vehicleNumberController,
                    decoration: const InputDecoration(
                      labelText: 'Vehicle Number *',
                      border: OutlineInputBorder(),
                      hintText: 'e.g., MP 09 AB 1234',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter vehicle number';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _driverNameController,
                    decoration: const InputDecoration(
                      labelText: 'Driver Name *',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter driver name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _notesController,
                    decoration: const InputDecoration(
                      labelText: 'Notes (Optional)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Cancel'),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _saveSalesOrder,
                          child: const Text('Create Order'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _calculateTotal() {
    final quantity = int.tryParse(_quantityController.text) ?? 0;
    final rate = double.tryParse(_rateController.text) ?? 0.0;
    setState(() {
      _totalAmount = quantity * rate;
    });
  }

  void _saveSalesOrder() async {
    if (_formKey.currentState!.validate()) {
      final provider = Provider.of<SalesProvider>(context, listen: false);
      
      final order = SalesOrder(
        id: '',
        orderNumber: '',
        customerId: _selectedCustomerId!,
        quantity: int.parse(_quantityController.text),
        ratePerBrick: _rateController.text,
        totalAmount: _totalAmount.toStringAsFixed(2),
        vehicleType: _vehicleType,
        vehicleNumber: _vehicleNumberController.text,
        driverName: _driverNameController.text,
        status: 'pending',
        orderDate: DateFormat('yyyy-MM-dd').format(_orderDate),
        notes: _notesController.text.isEmpty ? null : _notesController.text,
        createdAt: DateTime.now(),
      );

      try {
        await provider.addOrder(order);
        
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Sales order created successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to create order: $e')),
          );
        }
      }
    }
  }
}