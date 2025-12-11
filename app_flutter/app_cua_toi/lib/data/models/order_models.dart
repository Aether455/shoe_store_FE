import 'package:flutter/material.dart';

// --- ENUM & HELPER ---
enum OrderStatus {
  PENDING,
  CONFIRMED,
  DELIVERING,
  DELIVERED,
  COMPLETED,
  CANCELLED,
}

Color getStatusColor(String status) {
  switch (status) {
    case 'PENDING':
      return Colors.orange;
    case 'CONFIRMED':
      return Colors.blue;
    case 'DELIVERING':
      return Colors.purple;
    case 'DELIVERED':
      return Colors.teal;
    case 'COMPLETED':
      return Colors.green;
    case 'CANCELLED':
      return Colors.red;
    default:
      return Colors.grey;
  }
}

// --- REQUEST MODELS (Create Order) ---
class OrderCreationRequest {
  final String phoneNumber;
  final String receiverName;
  final String shippingAddress;
  final String province;
  final String district;
  final String ward;
  final String? note;
  final String? voucherCode;
  final String paymentMethod; // CASH, BANK_TRANSFER
  final List<OrderItemRequest> orderItems;
  final double totalAmount;

  OrderCreationRequest({
    required this.phoneNumber,
    required this.receiverName,
    required this.shippingAddress,
    required this.province,
    required this.district,
    required this.ward,
    this.note,
    this.voucherCode,
    required this.paymentMethod,
    required this.orderItems,
    required this.totalAmount,
  });

  Map<String, dynamic> toJson() => {
    'phoneNumber': phoneNumber,
    'receiverName': receiverName,
    'shippingAddress': shippingAddress,
    'province': province,
    'district': district,
    'ward': ward,
    'note': note ?? '',
    'voucherCode': voucherCode,
    'payment': {'method': paymentMethod},
    'orderItems': orderItems.map((e) => e.toJson()).toList(),
    'totalAmount': totalAmount,
  };
}

class OrderItemRequest {
  final int productId;
  final int productVariantId;
  final int quantity;
  final double pricePerUnit;

  OrderItemRequest({
    required this.productId,
    required this.productVariantId,
    required this.quantity,
    required this.pricePerUnit,
  });

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'productVariantId': productVariantId,
    'quantity': quantity,
    'pricePerUnit': pricePerUnit,
  };
}

// --- RESPONSE MODELS (Get Data) ---

// 1. Simple Option Value
class SimpleOptionValue {
  final int id;
  final String value;

  SimpleOptionValue({required this.id, required this.value});

  factory SimpleOptionValue.fromJson(Map<String, dynamic> json) {
    return SimpleOptionValue(id: json['id'] ?? 0, value: json['value'] ?? '');
  }
}

// 2. Simple Product Variant
class SimpleProductVariant {
  final int id;
  final String sku;
  final String productVariantImageUrl;
  final double price;
  final List<SimpleOptionValue> optionValues;

  SimpleProductVariant({
    required this.id,
    required this.sku,
    required this.productVariantImageUrl,
    required this.price,
    required this.optionValues,
  });

  factory SimpleProductVariant.fromJson(Map<String, dynamic> json) {
    return SimpleProductVariant(
      id: json['id'] ?? 0,
      sku: json['sku'] ?? '',
      productVariantImageUrl: json['productVariantImageUrl'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      optionValues: (json['optionValues'] as List? ?? [])
          .map((e) => SimpleOptionValue.fromJson(e))
          .toList(),
    );
  }

  // Helper để hiển thị phân loại (VD: Màu Đen - Size XL)
  String get variantString => optionValues.map((e) => e.value).join(" / ");
}

// 3. Simple Product
class SimpleProductForUsing {
  final int id;
  final String name;
  final String mainImageUrl;
  // Có thể thêm Brand/Category nếu cần hiển thị

  SimpleProductForUsing({
    required this.id,
    required this.name,
    required this.mainImageUrl,
  });

  factory SimpleProductForUsing.fromJson(Map<String, dynamic> json) {
    return SimpleProductForUsing(
      id: json['id'] ?? 0,
      name: json['name'] ?? 'Unknown',
      mainImageUrl: json['mainImageUrl'] ?? '',
    );
  }
}

// 4. Order Item (Lồng Product & Variant)
class OrderItemResponse {
  final int id;
  final SimpleProductForUsing product;
  final SimpleProductVariant productVariant;
  final int quantity;
  final double pricePerUnit;
  final double totalPrice;

  OrderItemResponse({
    required this.id,
    required this.product,
    required this.productVariant,
    required this.quantity,
    required this.pricePerUnit,
    required this.totalPrice,
  });

  factory OrderItemResponse.fromJson(Map<String, dynamic> json) {
    return OrderItemResponse(
      id: json['id'] ?? 0,
      product: SimpleProductForUsing.fromJson(json['product'] ?? {}),
      productVariant: SimpleProductVariant.fromJson(
        json['productVariant'] ?? {},
      ),
      quantity: json['quantity'] ?? 0,
      pricePerUnit: (json['pricePerUnit'] ?? 0).toDouble(),
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
    );
  }
}

// 5. Payment Info
class PaymentResponse {
  final int id;
  final double amount;
  final String method;
  final String status;

  PaymentResponse({
    required this.id,
    required this.amount,
    required this.method,
    required this.status,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      id: json['id'] ?? 0,
      amount: (json['amount'] ?? 0).toDouble(),
      method: json['method'] ?? 'CASH',
      status: json['status'] ?? 'UNPAID',
    );
  }
}

// 6. Voucher Info
class VoucherResponse {
  final String id;
  final String voucherCode;
  final double discountValue;

  VoucherResponse({
    required this.id,
    required this.voucherCode,
    required this.discountValue,
  });

  factory VoucherResponse.fromJson(Map<String, dynamic> json) {
    return VoucherResponse(
      id: json['id'] ?? '',
      voucherCode: json['voucherCode'] ?? '',
      discountValue: (json['discountValue'] ?? 0).toDouble(),
    );
  }
}

// 7. Simple Order (Dùng cho danh sách - OrderListPage)
class SimpleOrderResponse {
  final int id;
  final String orderCode;
  final String phoneNumber;
  final String shippingAddress;
  final String province;
  final String district;
  final String ward;
  final String status;
  final String receiverName;
  final double finalAmount;
  final String createAt;

  SimpleOrderResponse({
    required this.id,
    required this.orderCode,
    required this.phoneNumber,
    required this.shippingAddress,
    required this.province,
    required this.district,
    required this.ward,
    required this.status,
    required this.receiverName,
    required this.finalAmount,
    required this.createAt,
  });

  factory SimpleOrderResponse.fromJson(Map<String, dynamic> json) {
    return SimpleOrderResponse(
      id: json['id'] ?? 0,
      orderCode: json['orderCode'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      shippingAddress: json['shippingAddress'] ?? '',
      province: json['province'] ?? '',
      district: json['district'] ?? '',
      ward: json['ward'] ?? '',
      status: json['status'] ?? 'PENDING',
      receiverName: json['receiverName'] ?? '',
      finalAmount: (json['finalAmount'] ?? 0).toDouble(),
      createAt: json['createAt'] ?? '',
    );
  }

  String get fullAddress => "$shippingAddress, $ward, $district, $province";
}

// 8. Order Detail (Dùng cho chi tiết - OrderDetailPage)
class OrderResponseForCustomer {
  final int id;
  final String orderCode;
  final String receiverName;
  final String shippingAddress;
  final String province;
  final String district;
  final String ward;
  final String phoneNumber;
  final String status;
  final String? note;
  final double reducedAmount;
  final double totalAmount;
  final double finalAmount;
  final VoucherResponse? voucher;
  final List<OrderItemResponse> orderItems;
  final PaymentResponse? payment;
  final String createAt;

  OrderResponseForCustomer({
    required this.id,
    required this.orderCode,
    required this.receiverName,
    required this.shippingAddress,
    required this.province,
    required this.district,
    required this.ward,
    required this.phoneNumber,
    required this.status,
    this.note,
    required this.reducedAmount,
    required this.totalAmount,
    required this.finalAmount,
    this.voucher,
    required this.orderItems,
    this.payment,
    required this.createAt,
  });

  factory OrderResponseForCustomer.fromJson(Map<String, dynamic> json) {
    return OrderResponseForCustomer(
      id: json['id'] ?? 0,
      orderCode: json['orderCode'] ?? '',
      receiverName: json['receiverName'] ?? '',
      shippingAddress: json['shippingAddress'] ?? '',
      province: json['province'] ?? '',
      district: json['district'] ?? '',
      ward: json['ward'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      status: json['status'] ?? 'PENDING',
      note: json['note'],
      reducedAmount: (json['reducedAmount'] ?? 0).toDouble(),
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      finalAmount: (json['finalAmount'] ?? 0).toDouble(),
      voucher: json['voucher'] != null
          ? VoucherResponse.fromJson(json['voucher'])
          : null,
      orderItems: (json['orderItems'] as List? ?? [])
          .map((e) => OrderItemResponse.fromJson(e))
          .toList(),
      payment: json['payment'] != null
          ? PaymentResponse.fromJson(json['payment'])
          : null,
      createAt: json['createAt'] ?? '',
    );
  }

  String get fullAddress => "$shippingAddress, $ward, $district, $province";
}
