class CartItem {
  final int id;
  final int productId;
  final String productName;
  final String sku;
  final double price;
  final int productVariantId;
  final String productImageUrl;
  final int quantity;
  final double totalPrice;
  final String variantName; // Tự tạo chuỗi từ optionValues (VD: Đen - XL)

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.sku,
    required this.price,
    required this.productVariantId,
    required this.productImageUrl,
    required this.quantity,
    required this.totalPrice,
    required this.variantName,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    // Xử lý options thành chuỗi hiển thị
    List<dynamic> options = json['optionValues'] ?? [];
    String variantStr = options.map((e) => e['value']).join(" / ");

    return CartItem(
      id: json['id'],
      productId: json['productId'],
      productName: json['productName'],
      sku: json['sku'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      productVariantId: json['productVariantId'],
      productImageUrl: json['productImageUrl'] ?? '',
      quantity: json['quantity'],
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
      variantName: variantStr.isEmpty ? 'Mặc định' : variantStr,
    );
  }
}

class CartResponse {
  final int id;
  final List<CartItem> cartItems;
  final double totalAmount;

  CartResponse({
    required this.id,
    required this.cartItems,
    required this.totalAmount,
  });

  factory CartResponse.fromJson(Map<String, dynamic> json) {
    return CartResponse(
      id: json['id'] ?? 0,
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      cartItems: (json['cartItems'] as List? ?? [])
          .map((e) => CartItem.fromJson(e))
          .toList(),
    );
  }
}
