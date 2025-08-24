class Attendance {
  final String id;
  final String workerId;
  final String date;
  final bool isPresent;
  final int bricksProduced;
  final String? notes;
  final DateTime createdAt;

  Attendance({
    required this.id,
    required this.workerId,
    required this.date,
    required this.isPresent,
    required this.bricksProduced,
    this.notes,
    required this.createdAt,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['id'],
      workerId: json['workerId'],
      date: json['date'],
      isPresent: json['isPresent'],
      bricksProduced: json['bricksProduced'] ?? 0,
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'workerId': workerId,
      'date': date,
      'isPresent': isPresent,
      'bricksProduced': bricksProduced,
      'notes': notes,
    };
  }
}