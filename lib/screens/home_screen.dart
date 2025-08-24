import 'package:flutter/material.dart';
import 'dashboard_screen.dart';
import 'workers_screen.dart';
import 'attendance_screen.dart';
import 'sales_screen.dart';
import 'customers_screen.dart';
import 'inventory_screen.dart';
import 'payments_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const WorkersScreen(),
    const AttendanceScreen(),
    const SalesScreen(),
    const CustomersScreen(),
    const InventoryScreen(),
    const PaymentsScreen(),
  ];

  final List<BottomNavigationBarItem> _navItems = [
    const BottomNavigationBarItem(
      icon: Icon(Icons.dashboard),
      label: 'Dashboard',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.people),
      label: 'Workers',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.calendar_today),
      label: 'Attendance',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.shopping_cart),
      label: 'Sales',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.person),
      label: 'Customers',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.inventory),
      label: 'Inventory',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.payment),
      label: 'Payments',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HIM Bricks'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: _currentIndex < 4
          ? BottomNavigationBar(
              type: BottomNavigationBarType.fixed,
              currentIndex: _currentIndex,
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              items: _navItems.take(4).toList(),
              selectedItemColor: Colors.blue,
              unselectedItemColor: Colors.grey,
            )
          : null,
      drawer: _currentIndex >= 4
          ? Drawer(
              child: ListView(
                children: [
                  const DrawerHeader(
                    decoration: BoxDecoration(color: Colors.blue),
                    child: Text(
                      'HIM Bricks',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  ...List.generate(_navItems.length, (index) {
                    return ListTile(
                      leading: _navItems[index].icon,
                      title: Text(_navItems[index].label!),
                      selected: _currentIndex == index,
                      onTap: () {
                        setState(() {
                          _currentIndex = index;
                        });
                        Navigator.pop(context);
                      },
                    );
                  }),
                ],
              ),
            )
          : null,
    );
  }
}