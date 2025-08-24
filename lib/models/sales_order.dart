class SalesOrder {
  final String id;
  final String orderNumber;
  final String customerId;
  final int quantity;
  final String ratePerBrick;
  final String totalAmount;
  final String vehicleType;
  final String vehicleNumber;
  final String driverName;
  final String status;
  final String orderDate;
  final String? deliveryDate;
  final String? notes;
  final DateTime createdAt;

  SalesOrder({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    required this.quantity,
    required this.ratePerBrick,
    required this.totalAmount,
    required this.vehicleType,
    required this.vehicleNumber,
    required this.driverName,
    required this.status,
    required this.orderDate,
    this.deliveryDate,
    this.notes,
    required this.createdAt,
  });

  factory SalesOrder.fromJson(Map<String, dynamic> json) {
    return SalesOrder(
      id: json['id'],
      orderNumber: json['orderNumber'],
      customerId: json['customerId'],
      quantity: json['quantity'],
      ratePerBrick: json['ratePerBrick'],
      totalAmount: json['totalAmount'],
      vehicleType: json['vehicleType'],
      vehicleNumber: json['vehicleNumber'],
      driverName: json['driverName'],
      status: json['status'],
      orderDate: json['orderDate'],
      deliveryDate: json['deliveryDate'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'customerId': customerId,
      'quantity': quantity,
      'ratePerBrick': ratePerBrick,
      'vehicleType': vehicleType,
      'vehicleNumber': vehicleNumber,
      'driverName': driverName,
      'orderDate': orderDate,
      'notes': notes,
    };
  }
}