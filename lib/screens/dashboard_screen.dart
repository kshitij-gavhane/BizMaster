import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/metric_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DashboardProvider>(context, listen: false).loadMetrics();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<DashboardProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${provider.error}'),
                  ElevatedButton(
                    onPressed: () => provider.loadMetrics(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: provider.refresh,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Overview',
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
                        title: 'Total Workers',
                        value: provider.totalWorkers.toString(),
                        icon: Icons.people,
                        color: Colors.blue,
                      ),
                      MetricCard(
                        title: 'Today\'s Attendance',
                        value: '${provider.todayPresent}/${provider.todayTotal}',
                        subtitle: '${provider.attendanceRate.toStringAsFixed(1)}%',
                        icon: Icons.calendar_today,
                        color: Colors.green,
                      ),
                      MetricCard(
                        title: 'Weekly Production',
                        value: provider.weeklyProduction.toString(),
                        subtitle: 'bricks',
                        icon: Icons.factory,
                        color: Colors.orange,
                      ),
                      MetricCard(
                        title: 'Inventory Level',
                        value: provider.inventoryLevel.toString(),
                        subtitle: 'bricks',
                        icon: Icons.inventory,
                        color: Colors.purple,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Recent Orders',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  if (provider.recentOrders.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Center(
                          child: Text('No recent orders found'),
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: provider.recentOrders.length,
                      itemBuilder: (context, index) {
                        final order = provider.recentOrders[index];
                        return Card(
                          child: ListTile(
                            title: Text('Order ${order['orderNumber']}'),
                            subtitle: Text('${order['quantity']} bricks'),
                            trailing: Chip(
                              label: Text(order['status']),
                              backgroundColor: order['status'] == 'delivered'
                                  ? Colors.green.shade100
                                  : Colors.orange.shade100,
                            ),
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}