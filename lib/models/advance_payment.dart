class AdvancePayment {
  final String id;
  final String workerId;
  final String amount;
  final String? reason;
  final String? notes;
  final DateTime paymentDate;

  AdvancePayment({
    required this.id,
    required this.workerId,
    required this.amount,
    this.reason,
    this.notes,
    required this.paymentDate,
  });

  factory AdvancePayment.fromJson(Map<String, dynamic> json) {
    return AdvancePayment(
      id: json['id'],
      workerId: json['workerId'],
      amount: json['amount'],
      reason: json['reason'],
      notes: json['notes'],
      paymentDate: DateTime.parse(json['paymentDate']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'workerId': workerId,
      'amount': amount,
      'reason': reason,
      'notes': notes,
    };
  }
}