import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/inventory_provider.dart';
import '../widgets/metric_card.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<InventoryProvider>(context, listen: false);
      provider.loadInventory();
      provider.loadMovements();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<InventoryProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Inventory Overview',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  childAspectRatio: 1.2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  children: [
                    MetricCard(
                      title: 'Current Stock',
                      value: provider.currentStock.toString(),
                      subtitle: 'bricks available',
                      icon: Icons.inventory,
                      color: Colors.blue,
                    ),
                    MetricCard(
                      title: 'Khanger Stock',
                      value: provider.khangerStock.toString(),
                      subtitle: 'byproduct units',
                      icon: Icons.recycling,
                      color: Colors.orange,
                    ),
                    MetricCard(
                      title: 'Weekly Sales',
                      value: provider.getWeeklySales().toString(),
                      subtitle: 'bricks sold',
                      icon: Icons.trending_down,
                      color: Colors.green,
                    ),
                    MetricCard(
                      title: 'Burn Rate',
                      value: provider.getBurnRate().toStringAsFixed(0),
                      subtitle: 'bricks/day avg',
                      icon: Icons.analytics,
                      color: Colors.red,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'Recent Movements',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                if (provider.movements.isEmpty)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(
                        child: Text('No movements recorded yet'),
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: provider.movements.length > 10 ? 10 : provider.movements.length,
                    itemBuilder: (context, index) {
                      final movement = provider.movements[index];
                      final isNegative = movement['quantity'] < 0;
                      
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isNegative 
                                ? Colors.red.shade100 
                                : Colors.green.shade100,
                            child: Icon(
                              isNegative ? Icons.arrow_downward : Icons.arrow_upward,
                              color: isNegative ? Colors.red : Colors.green,
                            ),
                          ),
                          title: Text(movement['reason'] ?? 'Movement'),
                          subtitle: Text(
                            '${movement['type']}'.toUpperCase(),
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${isNegative ? '' : '+'}${movement['quantity']}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isNegative ? Colors.red : Colors.green,
                                ),
                              ),
                              Text(
                                DateTime.parse(movement['movementDate'])
                                    .toLocal()
                                    .toString()
                                    .split(' ')[0],
                                style: const TextStyle(fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAdjustmentDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAdjustmentDialog(BuildContext context) {
    final quantityController = TextEditingController();
    final reasonController = TextEditingController();
    String adjustmentType = 'production';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Adjust Inventory'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                value: adjustmentType,
                decoration: const InputDecoration(
                  labelText: 'Adjustment Type',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'production', child: Text('Production Addition')),
                  DropdownMenuItem(value: 'damage', child: Text('Damage Deduction')),
                  DropdownMenuItem(value: 'adjustment', child: Text('Manual Correction')),
                ],
                onChanged: (value) {
                  setState(() {
                    adjustmentType = value!;
                  });
                },
              ),
              const SizedBox(height: 16),
              TextField(
                controller: quantityController,
                decoration: const InputDecoration(
                  labelText: 'Quantity',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: reasonController,
                decoration: const InputDecoration(
                  labelText: 'Reason',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => _saveAdjustment(
                context,
                adjustmentType,
                quantityController.text,
                reasonController.text,
              ),
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  void _saveAdjustment(BuildContext context, String type, String quantity, String reason) async {
    if (quantity.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter quantity')),
      );
      return;
    }

    final provider = Provider.of<InventoryProvider>(context, listen: false);
    
    int adjustedQuantity = int.tryParse(quantity) ?? 0;
    String movementType = type;
    String movementReason = reason;

    if (type == 'damage') {
      adjustedQuantity = -adjustedQuantity.abs();
      movementType = 'damage';
      movementReason = movementReason.isEmpty ? 'Damaged stock deduction' : movementReason;
    } else if (type == 'production') {
      adjustedQuantity = adjustedQuantity.abs();
      movementType = 'production';
      movementReason = movementReason.isEmpty ? 'Production stock addition' : movementReason;
    } else {
      movementType = 'adjustment';
      movementReason = movementReason.isEmpty ? 'Manual stock adjustment' : movementReason;
    }

    final movement = {
      'type': movementType,
      'quantity': adjustedQuantity,
      'reason': movementReason,
    };

    try {
      await provider.addMovement(movement);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Inventory adjustment applied successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to apply adjustment: $e')),
        );
      }
    }
  }
}