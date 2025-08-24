import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/attendance_provider.dart';
import '../providers/workers_provider.dart';
import '../models/attendance.dart';
import '../models/worker.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final Map<String, bool> _attendance = {};
  final Map<String, int> _bricksProduced = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<WorkersProvider>(context, listen: false).loadWorkers();
      Provider.of<AttendanceProvider>(context, listen: false).loadAttendance();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer2<WorkersProvider, AttendanceProvider>(
        builder: (context, workersProvider, attendanceProvider, child) {
          if (workersProvider.isLoading || attendanceProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final workers = workersProvider.workers;
          
          // Initialize attendance data
          for (final worker in workers) {
            final existingAttendance = attendanceProvider.getAttendanceForWorker(worker.id);
            _attendance[worker.id] = existingAttendance?.isPresent ?? false;
            _bricksProduced[worker.id] = existingAttendance?.bricksProduced ?? 0;
          }

          return Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.grey.shade100,
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Text('Date: '),
                        TextButton(
                          onPressed: () => _selectDate(context, attendanceProvider),
                          child: Text(
                            DateFormat('dd/MM/yyyy').format(
                              DateTime.parse(attendanceProvider.selectedDate),
                            ),
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: _buildSummaryCard(
                            'Present',
                            attendanceProvider.getPresentCount().toString(),
                            Colors.green,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildSummaryCard(
                            'Absent',
                            (workers.length - attendanceProvider.getPresentCount()).toString(),
                            Colors.red,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildSummaryCard(
                            'Bricks',
                            attendanceProvider.getTotalBricks().toString(),
                            Colors.orange,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: workers.isEmpty
                    ? const Center(child: Text('No workers found'))
                    : ListView.builder(
                        itemCount: workers.length,
                        itemBuilder: (context, index) {
                          final worker = workers[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 4),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      CircleAvatar(
                                        backgroundColor: Colors.blue,
                                        child: Text(
                                          worker.name[0].toUpperCase(),
                                          style: const TextStyle(color: Colors.white),
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              worker.name,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            Chip(
                                              label: Text(worker.type == 'rojdaar'
                                                  ? 'Rojdaar' : 'Karagir'),
                                              backgroundColor: worker.type == 'rojdaar'
                                                  ? Colors.blue.shade100
                                                  : Colors.green.shade100,
                                            ),
                                          ],
                                        ),
                                      ),
                                      Switch(
                                        value: _attendance[worker.id] ?? false,
                                        onChanged: (value) {
                                          setState(() {
                                            _attendance[worker.id] = value;
                                          });
                                        },
                                      ),
                                    ],
                                  ),
                                  if (_attendance[worker.id] == true && worker.type == 'karagir')
                                    Padding(
                                      padding: const EdgeInsets.only(top: 16),
                                      child: TextFormField(
                                        initialValue: _bricksProduced[worker.id]?.toString() ?? '0',
                                        decoration: const InputDecoration(
                                          labelText: 'Bricks Produced',
                                          border: OutlineInputBorder(),
                                        ),
                                        keyboardType: TextInputType.number,
                                        onChanged: (value) {
                                          _bricksProduced[worker.id] = int.tryParse(value) ?? 0;
                                        },
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _saveAttendance,
        child: const Icon(Icons.save),
      ),
    );
  }

  Widget _buildSummaryCard(String title, String value, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  void _selectDate(BuildContext context, AttendanceProvider provider) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.parse(provider.selectedDate),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
    );
    
    if (date != null) {
      provider.selectedDate = DateFormat('yyyy-MM-dd').format(date);
    }
  }

  void _saveAttendance() async {
    final workersProvider = Provider.of<WorkersProvider>(context, listen: false);
    final attendanceProvider = Provider.of<AttendanceProvider>(context, listen: false);
    
    final attendanceList = <Attendance>[];
    
    for (final worker in workersProvider.workers) {
      attendanceList.add(Attendance(
        id: '',
        workerId: worker.id,
        date: attendanceProvider.selectedDate,
        isPresent: _attendance[worker.id] ?? false,
        bricksProduced: _bricksProduced[worker.id] ?? 0,
        createdAt: DateTime.now(),
      ));
    }
    
    try {
      await attendanceProvider.markAttendance(attendanceList);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Attendance saved successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save attendance: $e')),
        );
      }
    }
  }
}