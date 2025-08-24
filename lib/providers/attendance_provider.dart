import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/attendance.dart';
import '../services/api_service.dart';

class AttendanceProvider with ChangeNotifier {
  final ApiService _apiService;
  List<Attendance> _attendance = [];
  bool _isLoading = false;
  String? _error;
  String _selectedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());

  AttendanceProvider(this._apiService);

  List<Attendance> get attendance => _attendance;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get selectedDate => _selectedDate;

  set selectedDate(String date) {
    _selectedDate = date;
    loadAttendance();
  }

  Future<void> loadAttendance([String? date]) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _apiService.getAttendance(date ?? _selectedDate);
      _attendance = data.map((json) => Attendance.fromJson(json)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAttendance(List<Attendance> attendanceList) async {
    try {
      for (final attendance in attendanceList) {
        await _apiService.createAttendance(attendance.toJson());
      }
      await loadAttendance(); // Refresh the list
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  int getPresentCount() {
    return _attendance.where((a) => a.isPresent).length;
  }

  int getTotalBricks() {
    return _attendance
        .where((a) => a.isPresent)
        .fold(0, (sum, a) => sum + a.bricksProduced);
  }

  Attendance? getAttendanceForWorker(String workerId) {
    try {
      return _attendance.firstWhere((a) => a.workerId == workerId);
    } catch (e) {
      return null;
    }
  }
}