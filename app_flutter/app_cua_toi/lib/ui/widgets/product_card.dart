import 'package:app_cua_toi/data/models/product_model.dart';
import 'package:flutter/material.dart';
import '../product/product_detail_page.dart';

class ProductCard extends StatelessWidget {
  final int id;
  final String name;
  final String imageUrl;
  final String? priceDisplay;

  const ProductCard({
    super.key,
    required this.id,
    required this.name,
    required this.imageUrl,
    this.priceDisplay,
  });

  // Constructor từ SimpleProduct
  factory ProductCard.fromSimple(SimpleProduct product) {
    return ProductCard(
      id: product.id,
      name: product.name,
      imageUrl: product.mainImageUrl,
      priceDisplay: "Xem chi tiết",
    );
  }

  // Constructor từ SearchProduct
  factory ProductCard.fromSearch(SearchProduct product) {
    String price = "Liên hệ";
    if (product.minPrice != null) {
      price = _formatCurrency(product.minPrice!);
      if (product.maxPrice != null && product.maxPrice != product.minPrice) {
        price += " - ${_formatCurrency(product.maxPrice!)}";
      }
    }
    return ProductCard(
      id: product.id,
      name: product.name,
      imageUrl: product.mainImageUrl,
      priceDisplay: price,
    );
  }

  static String _formatCurrency(double price) {
    return "${price.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ";
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailPage(productId: id),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12), // Bo góc mềm mại hơn
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06), // Đổ bóng rất nhẹ
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: Colors.grey.shade100),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- PHẦN ẢNH SẢN PHẨM ---
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(12),
                    ),
                    child: Container(
                      width: double.infinity,
                      color: const Color(0xFFF9F9F9), // Màu nền nhẹ cho ảnh
                      child: Image.network(
                        imageUrl,
                        fit: BoxFit.contain, // Hoặc cover tùy ý
                        errorBuilder: (c, e, s) => const Icon(
                          Icons.image_not_supported,
                          color: Colors.grey,
                          size: 40,
                        ),
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.grey,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                  // Có thể thêm tag "New" hoặc "Sale" ở đây nếu BE trả về
                ],
              ),
            ),

            // --- PHẦN THÔNG TIN ---
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tên sản phẩm
                  Text(
                    name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      height: 1.2,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Giá sản phẩm
                  Text(
                    priceDisplay ?? 'Liên hệ',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFE30019), // Màu đỏ chủ đạo
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
