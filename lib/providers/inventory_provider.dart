import 'package:flutter/material.dart';
import '../services/api_service.dart';

class InventoryProvider with ChangeNotifier {
  final ApiService _apiService;
  Map<String, dynamic>? _inventory;
  List<dynamic> _movements = [];
  bool _isLoading = false;
  String? _error;

  InventoryProvider(this._apiService);

  Map<String, dynamic>? get inventory => _inventory;
  List<dynamic> get movements => _movements;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get currentStock => _inventory?['currentStock'] ?? 0;
  int get khangerStock => _inventory?['khangerStock'] ?? 0;

  Future<void> loadInventory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _inventory = await _apiService.getInventory();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMovements() async {
    try {
      _movements = await _apiService.getInventoryMovements();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> addMovement(Map<String, dynamic> movement) async {
    try {
      await _apiService.createInventoryMovement(movement);
      await loadInventory();
      await loadMovements();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  int getWeeklySales() {
    final weekAgo = DateTime.now().subtract(const Duration(days: 7));
    return _movements
        .where((m) => 
          m['type'] == 'sale' && 
          DateTime.parse(m['movementDate']).isAfter(weekAgo))
        .fold(0, (sum, m) => sum + (m['quantity'] as int).abs());
  }

  double getBurnRate() {
    final weeklySales = getWeeklySales();
    return weeklySales / 7.0;
  }
}