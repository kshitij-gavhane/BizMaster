import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  
  Future<List<dynamic>> getWorkers() async {
    final response = await http.get(Uri.parse('$baseUrl/workers'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load workers');
  }

  Future<Map<String, dynamic>> createWorker(Map<String, dynamic> worker) async {
    final response = await http.post(
      Uri.parse('$baseUrl/workers'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(worker),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to create worker');
  }

  Future<Map<String, dynamic>> updateWorker(String id, Map<String, dynamic> worker) async {
    final response = await http.put(
      Uri.parse('$baseUrl/workers/$id'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(worker),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to update worker');
  }

  Future<void> deleteWorker(String id) async {
    final response = await http.delete(Uri.parse('$baseUrl/workers/$id'));
    if (response.statusCode != 200) {
      throw Exception('Failed to delete worker');
    }
  }

  Future<List<dynamic>> getAttendance([String? date]) async {
    String url = '$baseUrl/attendance';
    if (date != null) {
      url += '?date=$date';
    }
    final response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load attendance');
  }

  Future<Map<String, dynamic>> createAttendance(Map<String, dynamic> attendance) async {
    final response = await http.post(
      Uri.parse('$baseUrl/attendance'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(attendance),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to create attendance');
  }

  Future<List<dynamic>> getCustomers() async {
    final response = await http.get(Uri.parse('$baseUrl/customers'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load customers');
  }

  Future<Map<String, dynamic>> createCustomer(Map<String, dynamic> customer) async {
    final response = await http.post(
      Uri.parse('$baseUrl/customers'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(customer),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to create customer');
  }

  Future<List<dynamic>> getSalesOrders() async {
    final response = await http.get(Uri.parse('$baseUrl/sales-orders'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load sales orders');
  }

  Future<Map<String, dynamic>> createSalesOrder(Map<String, dynamic> order) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sales-orders'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(order),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to create sales order');
  }

  Future<Map<String, dynamic>> updateSalesOrder(String id, Map<String, dynamic> order) async {
    final response = await http.put(
      Uri.parse('$baseUrl/sales-orders/$id'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(order),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to update sales order');
  }

  Future<Map<String, dynamic>> getInventory() async {
    final response = await http.get(Uri.parse('$baseUrl/inventory'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load inventory');
  }

  Future<List<dynamic>> getInventoryMovements() async {
    final response = await http.get(Uri.parse('$baseUrl/inventory/movements'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load inventory movements');
  }

  Future<Map<String, dynamic>> createInventoryMovement(Map<String, dynamic> movement) async {
    final response = await http.post(
      Uri.parse('$baseUrl/inventory/movements'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(movement),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to create inventory movement');
  }

  Future<List<dynamic>> getPayments() async {
    final response = await http.get(Uri.parse('$baseUrl/payments'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load payments');
  }

  Future<Map<String, dynamic>> createPayment(Map<String, dynamic> payment) async {
    final response = await http.post(
      Uri.parse('$baseUrl/payments'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(payment),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to create payment');
  }

  Future<List<dynamic>> calculateWeeklyPayments(String weekStart, String weekEnd) async {
    final response = await http.post(
      Uri.parse('$baseUrl/payments/calculate-weekly'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'weekStart': weekStart,
        'weekEnd': weekEnd,
      }),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to calculate weekly payments');
  }

  Future<Map<String, dynamic>> getDashboardMetrics() async {
    final response = await http.get(Uri.parse('$baseUrl/dashboard/metrics'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load dashboard metrics');
  }
}