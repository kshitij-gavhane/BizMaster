class Worker {
  final String id;
  final String name;
  final String type; // 'rojdaar' or 'karagir'
  final String? dailyWage;
  final String? pieceRate;
  final String? phone;
  final String? address;
  final String joinDate;
  final bool isActive;
  final String balance;

  Worker({
    required this.id,
    required this.name,
    required this.type,
    this.dailyWage,
    this.pieceRate,
    this.phone,
    this.address,
    required this.joinDate,
    required this.isActive,
    required this.balance,
  });

  factory Worker.fromJson(Map<String, dynamic> json) {
    return Worker(
      id: json['id'],
      name: json['name'],
      type: json['type'],
      dailyWage: json['dailyWage'],
      pieceRate: json['pieceRate'],
      phone: json['phone'],
      address: json['address'],
      joinDate: json['joinDate'],
      isActive: json['isActive'] ?? true,
      balance: json['balance'] ?? '0',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'dailyWage': dailyWage,
      'pieceRate': pieceRate,
      'phone': phone,
      'address': address,
      'joinDate': joinDate,
      'isActive': isActive,
    };
  }
}