import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/payments_provider.dart';
import '../providers/workers_provider.dart';
import '../widgets/metric_card.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<PaymentsProvider>(context, listen: false);
      provider.loadPayments();
      provider.loadWeeklyCalculations();
      Provider.of<WorkersProvider>(context, listen: false).loadWorkers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer2<PaymentsProvider, WorkersProvider>(
        builder: (context, paymentsProvider, workersProvider, child) {
          if (paymentsProvider.isLoading || workersProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final totalOutstanding = workersProvider.workers.fold(0.0, (sum, worker) =>
              sum + double.parse(worker.balance));

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Next Payment Day: ${DateFormat('EEEE, MMM d').format(paymentsProvider.getNextPaymentDate())}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 1,
                  childAspectRatio: 3,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  children: [
                    MetricCard(
                      title: 'Pending Payments',
                      value: '₹${paymentsProvider.getTotalPending().toStringAsFixed(0)}',
                      subtitle: 'for ${paymentsProvider.weeklyCalculations.length} workers',
                      icon: Icons.schedule,
                      color: Colors.orange,
                    ),
                    MetricCard(
                      title: 'This Week Paid',
                      value: '₹${paymentsProvider.getTotalPaid().toStringAsFixed(0)}',
                      subtitle: 'to ${paymentsProvider.payments.length} workers',
                      icon: Icons.check_circle,
                      color: Colors.green,
                    ),
                    MetricCard(
                      title: 'Outstanding Balance',
                      value: '₹${totalOutstanding.toStringAsFixed(0)}',
                      subtitle: 'overdue amounts',
                      icon: Icons.warning,
                      color: Colors.red,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'Payment Schedule',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                if (paymentsProvider.weeklyCalculations.isEmpty)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(
                        child: Text('No payment calculations available'),
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: paymentsProvider.weeklyCalculations.length,
                    itemBuilder: (context, index) {
                      final calc = paymentsProvider.weeklyCalculations[index];
                      final worker = workersProvider.getWorkerById(calc['workerId']);
                      
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.blue,
                            child: Text(
                              calc['workerName'][0].toUpperCase(),
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          title: Text(calc['workerName']),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Chip(
                                label: Text(calc['workerType'] == 'rojdaar' 
                                    ? 'Rojdaar' : 'Karagir'),
                                backgroundColor: calc['workerType'] == 'rojdaar'
                                    ? Colors.blue.shade100
                                    : Colors.green.shade100,
                              ),
                              Text(calc['workerType'] == 'rojdaar'
                                  ? '${calc['daysWorked']} days worked'
                                  : '${calc['bricksProduced']} bricks produced'),
                              Text('Current Balance: ₹${calc['currentBalance']}'),
                            ],
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '₹${double.parse(calc['grossAmount'].toString()).toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              const Text('Due', style: TextStyle(fontSize: 12)),
                            ],
                          ),
                          onTap: () => _showPaymentDialog(context, calc, worker),
                        ),
                      );
                    },
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showPaymentDialog(BuildContext context, Map<String, dynamic> calc, dynamic worker) {
    final paidAmountController = TextEditingController();
    final notesController = TextEditingController();
    bool isPartialPayment = false;
    
    final grossAmount = double.parse(calc['grossAmount'].toString());
    paidAmountController.text = grossAmount.toStringAsFixed(2);

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text('Pay ${calc['workerName']}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Gross Amount:'),
                            Text('₹${grossAmount.toStringAsFixed(2)}'),
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Current Balance:'),
                            Text('₹${calc['currentBalance']}'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Checkbox(
                      value: isPartialPayment,
                      onChanged: (value) {
                        setState(() {
                          isPartialPayment = value!;
                          if (!isPartialPayment) {
                            paidAmountController.text = grossAmount.toStringAsFixed(2);
                          }
                        });
                      },
                    ),
                    const Text('Partial Payment'),
                  ],
                ),
                TextField(
                  controller: paidAmountController,
                  decoration: const InputDecoration(
                    labelText: 'Amount to Pay',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                  enabled: isPartialPayment,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: notesController,
                  decoration: const InputDecoration(
                    labelText: 'Notes (Optional)',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => _processPayment(
                context,
                calc,
                paidAmountController.text,
                notesController.text,
              ),
              child: const Text('Process Payment'),
            ),
          ],
        ),
      ),
    );
  }

  void _processPayment(BuildContext context, Map<String, dynamic> calc, String paidAmount, String notes) async {
    if (paidAmount.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter payment amount')),
      );
      return;
    }

    final provider = Provider.of<PaymentsProvider>(context, listen: false);
    final grossAmount = double.parse(calc['grossAmount'].toString());
    final paid = double.parse(paidAmount);
    final balance = grossAmount - paid;

    final now = DateTime.now();
    final monday = now.subtract(Duration(days: (now.weekday - 1) % 7));
    final sunday = monday.add(const Duration(days: 6));

    final payment = {
      'workerId': calc['workerId'],
      'weekStartDate': DateFormat('yyyy-MM-dd').format(monday),
      'weekEndDate': DateFormat('yyyy-MM-dd').format(sunday),
      'daysWorked': calc['daysWorked'],
      'bricksProduced': calc['bricksProduced'],
      'grossAmount': grossAmount.toStringAsFixed(2),
      'paidAmount': paid.toStringAsFixed(2),
      'balanceAmount': balance.toStringAsFixed(2),
      'notes': notes.isEmpty ? null : notes,
    };

    try {
      await provider.processPayment(payment);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment processed successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to process payment: $e')),
        );
      }
    }
  }
}