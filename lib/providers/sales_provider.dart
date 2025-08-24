import 'package:flutter/material.dart';
import '../models/sales_order.dart';
import '../services/api_service.dart';

class SalesProvider with ChangeNotifier {
  final ApiService _apiService;
  List<SalesOrder> _orders = [];
  bool _isLoading = false;
  String? _error;

  SalesProvider(this._apiService);

  List<SalesOrder> get orders => _orders;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _apiService.getSalesOrders();
      _orders = data.map((json) => SalesOrder.fromJson(json)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addOrder(SalesOrder order) async {
    try {
      await _apiService.createSalesOrder(order.toJson());
      await loadOrders(); // Refresh the list
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> markAsDelivered(String id) async {
    try {
      await _apiService.updateSalesOrder(id, {
        'status': 'delivered',
        'deliveryDate': DateTime.now().toIso8601String().split('T')[0],
      });
      await loadOrders(); // Refresh the list
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  List<SalesOrder> getOrdersByStatus(String status) {
    if (status == 'all') return _orders;
    return _orders.where((order) => order.status == status).toList();
  }

  int getTotalQuantityByStatus(String status) {
    return getOrdersByStatus(status)
        .fold(0, (sum, order) => sum + order.quantity);
  }
}