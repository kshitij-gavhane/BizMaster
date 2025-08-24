import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardProvider with ChangeNotifier {
  final ApiService _apiService;
  Map<String, dynamic>? _metrics;
  bool _isLoading = false;
  String? _error;

  DashboardProvider(this._apiService);

  Map<String, dynamic>? get metrics => _metrics;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get totalWorkers => _metrics?['totalWorkers'] ?? 0;
  int get todayPresent => _metrics?['todayAttendance']?['present'] ?? 0;
  int get todayTotal => _metrics?['todayAttendance']?['total'] ?? 0;
  int get weeklyProduction => _metrics?['weeklyProduction'] ?? 0;
  int get inventoryLevel => _metrics?['inventoryLevel'] ?? 0;
  List<dynamic> get recentOrders => _metrics?['recentOrders'] ?? [];

  double get attendanceRate {
    if (todayTotal == 0) return 0.0;
    return (todayPresent / todayTotal) * 100;
  }

  Future<void> loadMetrics() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _metrics = await _apiService.getDashboardMetrics();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await loadMetrics();
  }
}