import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/customers_provider.dart';
import '../models/customer.dart';
import '../widgets/customer_form.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<CustomersProvider>(context, listen: false).loadCustomers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<CustomersProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          List<Customer> filteredCustomers = provider.customers;
          if (_searchQuery.isNotEmpty) {
            filteredCustomers = filteredCustomers
                .where((customer) => 
                    customer.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                    (customer.phone?.contains(_searchQuery) ?? false))
                .toList();
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  decoration: const InputDecoration(
                    labelText: 'Search Customers',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                ),
              ),
              Expanded(
                child: filteredCustomers.isEmpty
                    ? const Center(child: Text('No customers found'))
                    : ListView.builder(
                        itemCount: filteredCustomers.length,
                        itemBuilder: (context, index) {
                          final customer = filteredCustomers[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.green,
                                child: Text(
                                  customer.name[0].toUpperCase(),
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ),
                              title: Text(customer.name),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Phone: ${customer.phone ?? 'N/A'}'),
                                  Text('Rate: ₹${double.parse(customer.ratePerBrick).toStringAsFixed(2)}/brick'),
                                  Text('Orders: ${customer.totalOrders}'),
                                  if (customer.lastOrderDate != null)
                                    Text('Last Order: ${customer.lastOrderDate}'),
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
        onPressed: () => _showCustomerForm(context, null),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showCustomerForm(BuildContext context, Customer? customer) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: CustomerForm(customer: customer),
      ),
    );
  }
}