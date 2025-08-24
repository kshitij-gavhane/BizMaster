class Customer {
  final String id;
  final String name;
  final String? phone;
  final String? address;
  final String ratePerBrick;
  final int totalOrders;
  final String? lastOrderDate;
  final DateTime createdAt;

  Customer({
    required this.id,
    required this.name,
    this.phone,
    this.address,
    required this.ratePerBrick,
    required this.totalOrders,
    this.lastOrderDate,
    required this.createdAt,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      address: json['address'],
      ratePerBrick: json['ratePerBrick'],
      totalOrders: json['totalOrders'] ?? 0,
      lastOrderDate: json['lastOrderDate'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'address': address,
      'ratePerBrick': ratePerBrick,
    };
  }
}