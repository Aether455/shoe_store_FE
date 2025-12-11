import 'package:app_cua_toi/data/models/brand_model.dart';
import 'package:app_cua_toi/data/models/category_model.dart';

// DTO: SimpleProductResponseForCustomer (Dùng cho List & Home)
class SimpleProduct {
  final int id;
  final String name;
  final String mainImageUrl;
  final Category? category;
  final Brand? brand;

  SimpleProduct({
    required this.id,
    required this.name,
    required this.mainImageUrl,
    this.category,
    this.brand,
  });

  factory SimpleProduct.fromJson(Map<String, dynamic> json) {
    return SimpleProduct(
      id: json['id'],
      name: json['name'],
      mainImageUrl: json['mainImageUrl'] ?? '',
      category: json['category'] != null
          ? Category.fromJson(json['category'])
          : null,
      brand: json['brand'] != null ? Brand.fromJson(json['brand']) : null,
    );
  }
}

// DTO: ProductVariantResponseForCustomer
class ProductVariant {
  final int id;
  final String imageUrl;
  final double price;
  final int quantity;
  final List<OptionValue> optionValues;

  ProductVariant({
    required this.id,
    required this.imageUrl,
    required this.price,
    required this.quantity,
    required this.optionValues,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id'],
      imageUrl: json['productVariantImageUrl'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 0,
      optionValues: (json['optionValues'] as List? ?? [])
          .map((e) => OptionValue.fromJson(e))
          .toList(),
    );
  }
}

class OptionValue {
  final int id;
  final String value;
  OptionValue({required this.id, required this.value});
  factory OptionValue.fromJson(Map<String, dynamic> json) =>
      OptionValue(id: json['id'], value: json['value']);
}

// DTO: ProductResponseForCustomer (Detail)
class ProductDetail {
  final int id;
  final String name;
  final String description;
  final String mainImageUrl;
  final List<ProductVariant> variants;
  final Category? category;
  final Brand? brand;

  ProductDetail({
    required this.id,
    required this.name,
    required this.description,
    required this.mainImageUrl,
    required this.variants,
    this.category,
    this.brand,
  });

  factory ProductDetail.fromJson(Map<String, dynamic> json) {
    return ProductDetail(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
      mainImageUrl: json['mainImageUrl'] ?? '',
      variants: (json['productVariants'] as List? ?? [])
          .map((e) => ProductVariant.fromJson(e))
          .toList(),
      category: json['category'] != null
          ? Category.fromJson(json['category'])
          : null,
      brand: json['brand'] != null ? Brand.fromJson(json['brand']) : null,
    );
  }
}

// DTO: SimpleProductSearchResponse
class SearchProduct {
  final int id;
  final String name;
  final String description;
  final String mainImageUrl;
  final double? minPrice;
  final double? maxPrice;

  SearchProduct({
    required this.id,
    required this.name,
    required this.description,
    required this.mainImageUrl,
    this.minPrice,
    this.maxPrice,
  });

  factory SearchProduct.fromJson(Map<String, dynamic> json) {
    return SearchProduct(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
      mainImageUrl: json['mainImageUrl'] ?? '',
      minPrice: json['minPrice'],
      maxPrice: json['maxPrice'],
    );
  }
}
