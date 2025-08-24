import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/workers_provider.dart';
import '../models/advance_payment.dart';
import '../services/api_service.dart';

class AdvancePaymentForm extends StatefulWidget {
  final String? selectedWorkerId;

  const AdvancePaymentForm({super.key, this.selectedWorkerId});

  @override
  State<AdvancePaymentForm> createState() => _AdvancePaymentFormState();
}

class _AdvancePaymentFormState extends State<AdvancePaymentForm> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();
  
  String? _selectedWorkerId;
  String? _selectedReason;
  bool _isProcessing = false;

  final List<Map<String, String>> _reasons = [
    {'value': 'emergency', 'label': 'Emergency'},
    {'value': 'medical', 'label': 'Medical'},
    {'value': 'personal', 'label': 'Personal'},
    {'value': 'festival', 'label': 'Festival'},
    {'value': 'other', 'label': 'Other'},
  ];

  @override
  void initState() {
    super.initState();
    _selectedWorkerId = widget.selectedWorkerId;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Consumer<WorkersProvider>(
        builder: (context, workersProvider, child) {
          return Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Give Advance Payment',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _selectedWorkerId,
                  decoration: const InputDecoration(
                    labelText: 'Select Worker *',
                    border: OutlineInputBorder(),
                  ),
                  items: workersProvider.workers.map((worker) {
                    return DropdownMenuItem(
                      value: worker.id,
                      child: Text('${worker.name} (Balance: ₹${worker.balance})'),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedWorkerId = value;
                    });
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please select a worker';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _amountController,
                  decoration: const InputDecoration(
                    labelText: 'Amount (₹) *',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter amount';
                    }
                    if (double.tryParse(value) == null) {
                      return 'Please enter a valid number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _selectedReason,
                  decoration: const InputDecoration(
                    labelText: 'Reason (Optional)',
                    border: OutlineInputBorder(),
                  ),
                  items: _reasons.map((reason) {
                    return DropdownMenuItem(
                      value: reason['value'],
                      child: Text(reason['label']!),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedReason = value;
                    });
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
                if (_selectedWorkerId != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Current Balance:'),
                            Text(_getWorkerBalance()),
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('After Advance:'),
                            Text(_getBalanceAfterAdvance()),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
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
                        onPressed: _isProcessing ? null : _processAdvance,
                        child: Text(_isProcessing ? 'Processing...' : 'Give Advance'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _getWorkerBalance() {
    final workersProvider = Provider.of<WorkersProvider>(context, listen: false);
    final worker = workersProvider.getWorkerById(_selectedWorkerId!);
    return worker != null ? '₹${worker.balance}' : '₹0';
  }

  String _getBalanceAfterAdvance() {
    final workersProvider = Provider.of<WorkersProvider>(context, listen: false);
    final worker = workersProvider.getWorkerById(_selectedWorkerId!);
    if (worker == null) return '₹0';
    
    final currentBalance = double.parse(worker.balance);
    final advanceAmount = double.tryParse(_amountController.text) ?? 0;
    final newBalance = currentBalance - advanceAmount;
    
    return '₹${newBalance.toStringAsFixed(2)}';
  }

  void _processAdvance() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isProcessing = true;
      });

      try {
        final advance = AdvancePayment(
          id: '',
          workerId: _selectedWorkerId!,
          amount: _amountController.text,
          reason: _selectedReason,
          notes: _notesController.text.isEmpty ? null : _notesController.text,
          paymentDate: DateTime.now(),
        );

        await ApiService().createAdvancePayment(advance.toJson());
        
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Advance payment processed successfully')),
          );
          
          // Refresh workers data
          Provider.of<WorkersProvider>(context, listen: false).loadWorkers();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to process advance: $e')),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isProcessing = false;
          });
        }
      }
    }
  }
}