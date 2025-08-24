import 'package:flutter/material.dart';
import '../models/worker.dart';
import '../services/api_service.dart';

class WorkersProvider with ChangeNotifier {
  final ApiService _apiService;
  List<Worker> _workers = [];
  bool _isLoading = false;
  String? _error;

  WorkersProvider(this._apiService);

  List<Worker> get workers => _workers;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadWorkers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _apiService.getWorkers();
      _workers = data.map((json) => Worker.fromJson(json)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addWorker(Worker worker) async {
    try {
      await _apiService.createWorker(worker.toJson());
      await loadWorkers(); // Refresh the list
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> updateWorker(String id, Worker worker) async {
    try {
      await _apiService.updateWorker(id, worker.toJson());
      await loadWorkers(); // Refresh the list
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> deleteWorker(String id) async {
    try {
      await _apiService.deleteWorker(id);
      await loadWorkers(); // Refresh the list
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  List<Worker> getWorkersByType(String type) {
    return _workers.where((worker) => worker.type == type).toList();
  }

  Worker? getWorkerById(String id) {
    try {
      return _workers.firstWhere((worker) => worker.id == id);
    } catch (e) {
      return null;
    }
  }
}