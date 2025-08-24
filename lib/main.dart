import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/workers_provider.dart';
import 'providers/attendance_provider.dart';
import 'providers/customers_provider.dart';
import 'providers/sales_provider.dart';
import 'providers/inventory_provider.dart';
import 'providers/payments_provider.dart';
import 'providers/dashboard_provider.dart';
import 'screens/home_screen.dart';
import 'services/api_service.dart';

void main() {
  runApp(const BrickERPApp());
}

class BrickERPApp extends StatelessWidget {
  const BrickERPApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => WorkersProvider(ApiService())),
        ChangeNotifierProvider(create: (_) => AttendanceProvider(ApiService())),
        ChangeNotifierProvider(create: (_) => CustomersProvider(ApiService())),
        ChangeNotifierProvider(create: (_) => SalesProvider(ApiService())),
        ChangeNotifierProvider(create: (_) => InventoryProvider(ApiService())),
        ChangeNotifierProvider(create: (_) => PaymentsProvider(ApiService())),
        ChangeNotifierProvider(create: (_) => DashboardProvider(ApiService())),
      ],
      child: MaterialApp(
        title: 'HIM Bricks',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
            elevation: 2,
          ),
          floatingActionButtonTheme: const FloatingActionButtonThemeData(
            backgroundColor: Colors.blue,
          ),
        ),
        home: const HomeScreen(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}