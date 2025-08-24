import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class PaymentsProvider with ChangeNotifier {
  final ApiService _apiService;
  List<dynamic> _payments = [];
  List<dynamic> _weeklyCalculations = [];
  bool _isLoading = false;
  String? _error;

  PaymentsProvider(this._apiService);

  List<dynamic> get payments => _payments;
  List<dynamic> get weeklyCalculations => _weeklyCalculations;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadPayments() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _payments = await _apiService.getPayments();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadWeeklyCalculations() async {
    try {
      final now = DateTime.now();
      final monday = now.subtract(Duration(days: (now.weekday - 1) % 7));
      final sunday = monday.add(const Duration(days: 6));
      
      final weekStart = DateFormat('yyyy-MM-dd').format(monday);
      final weekEnd = DateFormat('yyyy-MM-dd').format(sunday);
      
      _weeklyCalculations = await _apiService.calculateWeeklyPayments(weekStart, weekEnd);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> processPayment(Map<String, dynamic> payment) async {
    try {
      await _apiService.createPayment(payment);
      await loadPayments();
      await loadWeeklyCalculations();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  double getTotalPending() {
    return _weeklyCalculations.fold(0.0, (sum, calc) => 
      sum + double.parse(calc['grossAmount'].toString()));
  }

  double getTotalPaid() {
    return _payments.fold(0.0, (sum, payment) => 
      sum + double.parse(payment['paidAmount'].toString()));
  }

  DateTime getNextPaymentDate() {
    final now = DateTime.now();
    final daysUntilMonday = (DateTime.monday - now.weekday) % 7;
    return now.add(Duration(days: daysUntilMonday == 0 ? 7 : daysUntilMonday));
  }
}