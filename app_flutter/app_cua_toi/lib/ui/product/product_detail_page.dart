import 'package:app_cua_toi/data/models/product_model.dart';
import 'package:app_cua_toi/ui/home/custom_app_bar.dart';
import 'package:flutter/material.dart';
import '../../services/product_service.dart';
import '../../services/cart_service.dart';
import '../../services/auth_service.dart';
import '../auth/login_page.dart';

class ProductDetailPage extends StatefulWidget {
  final int productId;
  const ProductDetailPage({super.key, required this.productId});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  int _quantity = 1;
  int? _selectedVariantId;
  double _currentPrice = 0;

  @override
  void initState() {
    super.initState();
    // Gọi API để đẩy dữ liệu vào Stream
    ProductService.fetchProductDetail(widget.productId);
  }

  @override
  void dispose() {
    ProductService.clearDetail();
    super.dispose();
  }

  String _formatCurrency(double price) {
    return "${price.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ";
  }

  void _addToCart() async {
    if (!AuthService.isLoggedIn) {
      _showMsg("Vui lòng đăng nhập để mua hàng", isError: true);
      // Sử dụng rootNavigator để đè lên toàn bộ màn hình
      Navigator.of(
        context,
        rootNavigator: true,
      ).push(MaterialPageRoute(builder: (_) => const LoginPage()));
      return;
    }

    if (_selectedVariantId == null) {
      _showMsg("Vui lòng chọn phân loại sản phẩm", isError: true);
      return;
    }

    final response = await CartService.addToCart(
      widget.productId,
      _selectedVariantId!,
      _quantity,
    );

    if (response.code == 1000) {
      _showMsg("Thêm vào giỏ hàng thành công!");
    } else {
      _showMsg(response.message, isError: true);
    }
  }

  void _showMsg(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? Colors.red : Colors.green,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 800;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const CustomAppBar(showBackButton: true),
      body: StreamBuilder<ProductDetail?>(
        stream: ProductService.productDetailStream,
        builder: (context, snapshot) {
          // 1. Trạng thái Loading
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFFE30019)),
            );
          }

          // 2. Trạng thái Lỗi
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 60, color: Colors.red),
                  const SizedBox(height: 10),
                  Text("Lỗi: ${snapshot.error}"),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: () =>
                        ProductService.fetchProductDetail(widget.productId),
                    child: const Text("Thử lại"),
                  ),
                ],
              ),
            );
          }

          // 3. Trạng thái Không có dữ liệu
          if (!snapshot.hasData || snapshot.data == null) {
            return const Center(child: Text("Không tìm thấy sản phẩm"));
          }

          // 4. Có dữ liệu -> Render UI
          final product = snapshot.data!;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: isDesktop
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: _buildImage(product)),
                      const SizedBox(width: 40),
                      Expanded(child: _buildInfo(product)),
                    ],
                  )
                : Column(
                    children: [
                      _buildImage(product),
                      const SizedBox(height: 20),
                      _buildInfo(product),
                    ],
                  ),
          );
        },
      ),
      bottomNavigationBar: isDesktop ? null : _buildBottomBar(),
    );
  }

  Widget _buildImage(ProductDetail product) {
    return Container(
      height: 400,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Image.network(
        product.mainImageUrl,
        fit: BoxFit.contain,
        errorBuilder: (c, e, s) =>
            const Icon(Icons.image_not_supported, size: 80, color: Colors.grey),
      ),
    );
  }

  Widget _buildInfo(ProductDetail product) {
    // Logic hiển thị giá
    String displayPrice = "Liên hệ";
    if (_selectedVariantId != null) {
      displayPrice = _formatCurrency(_currentPrice);
    } else if (product.variants.isNotEmpty) {
      final prices = product.variants.map((v) => v.price).toList()..sort();
      displayPrice =
          "${_formatCurrency(prices.first)} - ${_formatCurrency(prices.last)}";
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          product.name,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        Text(
          displayPrice,
          style: const TextStyle(
            fontSize: 24,
            color: Color(0xFFE30019),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 20),

        const Text(
          "Chọn phân loại:",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: product.variants.map((variant) {
            bool isSelected = _selectedVariantId == variant.id;
            // Ghép tên các thuộc tính (VD: Màu Đỏ / Size XL)
            String label = variant.optionValues.map((o) => o.value).join(" / ");

            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedVariantId = variant.id;
                  _currentPrice = variant.price;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFFE30019).withOpacity(0.1)
                      : Colors.white,
                  border: Border.all(
                    color: isSelected ? const Color(0xFFE30019) : Colors.grey,
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  label,
                  style: TextStyle(
                    color: isSelected ? const Color(0xFFE30019) : Colors.black,
                    fontWeight: isSelected
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: 20),
        const Text("Số lượng:", style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.remove),
              onPressed: () =>
                  setState(() => _quantity = _quantity > 1 ? _quantity - 1 : 1),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                "$_quantity",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () => setState(() => _quantity++),
            ),
          ],
        ),

        const SizedBox(height: 20),
        const Text("Mô tả:", style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 5),
        Text(
          product.description,
          style: TextStyle(color: Colors.grey[700], height: 1.5),
        ),

        // Nút mua hàng cho Desktop (nằm bên phải)
        if (MediaQuery.of(context).size.width > 800) ...[
          const SizedBox(height: 40),
          SizedBox(
            height: 50,
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _addToCart,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE30019),
              ),
              child: const Text(
                "THÊM VÀO GIỎ HÀNG",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
      ),
      child: ElevatedButton(
        onPressed: _addToCart,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFE30019),
          minimumSize: const Size(double.infinity, 50),
        ),
        child: const Text(
          "THÊM VÀO GIỎ HÀNG",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
