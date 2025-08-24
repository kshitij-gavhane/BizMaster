import 'package:flutter/material.dart';
import '../models/customer.dart';
import '../services/api_service.dart';

class CustomersProvider with ChangeNotifier {
  final ApiService _apiService;
  List<Customer> _customers = [];
  bool _isLoading = false;
  String? _error;

  CustomersProvider(this._apiService);

  List<Customer> get customers => _customers;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadCustomers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _apiService.getCustomers();
      _customers = data.map((json) => Customer.fromJson(json)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addCustomer(Customer customer) async {
    try {
      await _apiService.createCustomer(customer.toJson());
      await loadCustomers(); // Refresh the list
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Customer? getCustomerById(String id) {
    try {
      return _customers.firstWhere((customer) => customer.id == id);
    } catch (e) {
      return null;
    }
  }
}