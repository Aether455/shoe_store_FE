class Voucher {
  final String id;
  final String name;
  final String voucherCode;
  final String type; // PERCENTAGE, FIXED_AMOUNT
  final String status;
  final double discountValue;
  final double minApplicablePrice;
  final double maxDiscountAmount;
  final String startDate;
  final String endDate;

  Voucher({
    required this.id,
    required this.name,
    required this.voucherCode,
    required this.type,
    required this.status,
    required this.discountValue,
    required this.minApplicablePrice,
    required this.maxDiscountAmount,
    required this.startDate,
    required this.endDate,
  });

  factory Voucher.fromJson(Map<String, dynamic> json) {
    return Voucher(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      voucherCode: json['voucherCode'] ?? '',
      type: json['type'] ?? 'FIXED_AMOUNT',
      status: json['status'] ?? 'INACTIVE',
      discountValue: (json['discountValue'] ?? 0).toDouble(),
      minApplicablePrice: (json['minApplicablePrice'] ?? 0).toDouble(),
      maxDiscountAmount: (json['maxDiscountAmount'] ?? 0).toDouble(),
      startDate: json['startDate'] ?? '',
      endDate: json['endDate'] ?? '',
    );
  }
}
