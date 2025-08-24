import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/workers_provider.dart';
import '../models/worker.dart';
import '../widgets/worker_form.dart';
import '../widgets/advance_payment_form.dart';

class WorkersScreen extends StatefulWidget {
  const WorkersScreen({super.key});

  @override
  State<WorkersScreen> createState() => _WorkersScreenState();
}

class _WorkersScreenState extends State<WorkersScreen> {
  String _filterType = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<WorkersProvider>(context, listen: false).loadWorkers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<WorkersProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          List<Worker> filteredWorkers = provider.workers;
          if (_filterType != 'all') {
            filteredWorkers = provider.getWorkersByType(_filterType);
          }
          if (_searchQuery.isNotEmpty) {
            filteredWorkers = filteredWorkers
                .where((worker) => worker.name
                    .toLowerCase()
                    .contains(_searchQuery.toLowerCase()))
                .toList();
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      decoration: const InputDecoration(
                        labelText: 'Search Workers',
                        prefixIcon: Icon(Icons.search),
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) {
                        setState(() {
                          _searchQuery = value;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _filterType,
                            decoration: const InputDecoration(
                              labelText: 'Filter by Type',
                              border: OutlineInputBorder(),
                            ),
                            items: const [
                              DropdownMenuItem(value: 'all', child: Text('All Workers')),
                              DropdownMenuItem(value: 'rojdaar', child: Text('Rojdaar')),
                              DropdownMenuItem(value: 'karagir', child: Text('Karagir')),
                            ],
                            onChanged: (value) {
                              setState(() {
                                _filterType = value!;
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: filteredWorkers.isEmpty
                    ? const Center(
                        child: Text('No workers found'),
                      )
                    : ListView.builder(
                        itemCount: filteredWorkers.length,
                        itemBuilder: (context, index) {
                          final worker = filteredWorkers[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.blue,
                                child: Text(
                                  worker.name[0].toUpperCase(),
                                  style: const TextStyle(color: Colors.white),
                                ),
                              ),
                              title: Text(worker.name),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Chip(
                                    label: Text(worker.type == 'rojdaar' 
                                        ? 'Rojdaar' : 'Karagir'),
                                    backgroundColor: worker.type == 'rojdaar'
                                        ? Colors.blue.shade100
                                        : Colors.green.shade100,
                                  ),
                                  Text(worker.type == 'rojdaar'
                                      ? '₹${worker.dailyWage}/day'
                                      : '₹${worker.pieceRate}/brick'),
                                  Text('Balance: ₹${worker.balance}'),
                                ],
                              ),
                              trailing: PopupMenuButton(
                                itemBuilder: (context) => [
                                  const PopupMenuItem(
                                    value: 'edit',
                                    child: Text('Edit'),
                                  ),
                                  const PopupMenuItem(
                                    value: 'advance',
                                    child: Text('Give Advance'),
                                  ),
                                  const PopupMenuItem(
                                    value: 'delete',
                                    child: Text('Delete'),
                                  ),
                                ],
                                onSelected: (value) {
                                  if (value == 'edit') {
                                    _showWorkerForm(context, worker);
                                  } else if (value == 'advance') {
                                    _showAdvanceForm(context, worker.id);
                                  } else if (value == 'delete') {
                                    _confirmDelete(context, provider, worker);
                                  }
                                },
                              ),
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
        onPressed: () => _showWorkerForm(context, null),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showWorkerForm(BuildContext context, Worker? worker) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: WorkerForm(worker: worker),
      ),
    );
  }

  void _showAdvanceForm(BuildContext context, String workerId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: AdvancePaymentForm(selectedWorkerId: workerId),
      ),
    );
  }

  void _confirmDelete(BuildContext context, WorkersProvider provider, Worker worker) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Worker'),
        content: Text('Are you sure you want to delete ${worker.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await provider.deleteWorker(worker.id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Worker deleted successfully')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to delete worker: $e')),
                  );
                }
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}