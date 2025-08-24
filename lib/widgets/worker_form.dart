import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/workers_provider.dart';
import '../models/worker.dart';

class WorkerForm extends StatefulWidget {
  final Worker? worker;

  const WorkerForm({super.key, this.worker});

  @override
  State<WorkerForm> createState() => _WorkerFormState();
}

class _WorkerFormState extends State<WorkerForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _dailyWageController = TextEditingController();
  final _pieceRateController = TextEditingController();
  
  String _type = 'rojdaar';
  DateTime _joinDate = DateTime.now();
  bool _isActive = true;

  @override
  void initState() {
    super.initState();
    if (widget.worker != null) {
      _nameController.text = widget.worker!.name;
      _phoneController.text = widget.worker!.phone ?? '';
      _addressController.text = widget.worker!.address ?? '';
      _dailyWageController.text = widget.worker!.dailyWage ?? '';
      _pieceRateController.text = widget.worker!.pieceRate ?? '';
      _type = widget.worker!.type;
      _joinDate = DateTime.parse(widget.worker!.joinDate);
      _isActive = widget.worker!.isActive;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.worker == null ? 'Add Worker' : 'Edit Worker',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Worker Name *',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter worker name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _type,
              decoration: const InputDecoration(
                labelText: 'Worker Type *',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'rojdaar', child: Text('Rojdaar (Daily Wage)')),
                DropdownMenuItem(value: 'karagir', child: Text('Karagir (Piece Rate)')),
              ],
              onChanged: (value) {
                setState(() {
                  _type = value!;
                });
              },
            ),
            const SizedBox(height: 16),
            if (_type == 'rojdaar')
              TextFormField(
                controller: _dailyWageController,
                decoration: const InputDecoration(
                  labelText: 'Daily Wage (₹) *',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (_type == 'rojdaar' && (value == null || value.isEmpty)) {
                    return 'Please enter daily wage';
                  }
                  return null;
                },
              ),
            if (_type == 'karagir')
              TextFormField(
                controller: _pieceRateController,
                decoration: const InputDecoration(
                  labelText: 'Piece Rate (₹ per brick) *',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (_type == 'karagir' && (value == null || value.isEmpty)) {
                    return 'Please enter piece rate';
                  }
                  return null;
                },
              ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'Address',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _saveWorker,
                    child: Text(widget.worker == null ? 'Add' : 'Update'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _saveWorker() async {
    if (_formKey.currentState!.validate()) {
      final provider = Provider.of<WorkersProvider>(context, listen: false);
      
      final worker = Worker(
        id: widget.worker?.id ?? '',
        name: _nameController.text,
        type: _type,
        dailyWage: _type == 'rojdaar' ? _dailyWageController.text : null,
        pieceRate: _type == 'karagir' ? _pieceRateController.text : null,
        phone: _phoneController.text.isEmpty ? null : _phoneController.text,
        address: _addressController.text.isEmpty ? null : _addressController.text,
        joinDate: _joinDate.toIso8601String().split('T')[0],
        isActive: _isActive,
        balance: widget.worker?.balance ?? '0',
      );

      try {
        if (widget.worker == null) {
          await provider.addWorker(worker);
        } else {
          await provider.updateWorker(widget.worker!.id, worker);
        }
        
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(widget.worker == null 
                  ? 'Worker added successfully' 
                  : 'Worker updated successfully'),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to save worker: $e')),
          );
        }
      }
    }
  }
}