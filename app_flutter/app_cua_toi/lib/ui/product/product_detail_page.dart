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
  ProductDetail? _product;
  bool _isLoading = true;
  int _quantity = 1;

  // State quản lý việc chọn Variant
  // Map lưu: Key là tên thuộc tính (VD: Color), Value là giá trị đang chọn (VD: Red)
  // Tuy nhiên API hiện tại trả về List<ProductVariant>, mỗi variant có List<OptionValue>.
  // Để đơn giản hóa cho UI demo, ta sẽ hiển thị danh sách các Variant để user click chọn trực tiếp.
  int? _selectedVariantId;
  double _currentPrice = 0;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  void _fetchDetail() async {
    final response = await ProductService.getProductDetail(widget.productId);
    if (mounted) {
      setState(() {
        _isLoading = false;
        if (response.code == 1000) {
          _product = response.result;
        } else {
          // Hiển thị lỗi nếu không tải được (VD: Sản phẩm bị xóa)
          _product = null;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message),
              backgroundColor: Colors.red,
            ),
          );
        }
      });
    }
  }

  String _formatCurrency(double price) {
    return "${price.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ";
  }

  // Xử lý thêm vào giỏ
  void _addToCart() async {
    if (!AuthService.isLoggedIn) {
      _showMsg("Vui lòng đăng nhập để mua hàng", isError: true);
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
      return;
    }

    if (_selectedVariantId == null) {
      _showMsg("Vui lòng chọn phân loại sản phẩm", isError: true);
      return;
    }

    // Call API
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

    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_product == null) {
      return const Scaffold(
        body: Center(child: Text("Không tìm thấy sản phẩm")),
      );
    }

    return Scaffold(
      appBar: const CustomAppBar(showBackButton: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: isDesktop
            ? Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: _buildImage()),
                  const SizedBox(width: 40),
                  Expanded(child: _buildInfo()),
                ],
              )
            : Column(
                children: [
                  _buildImage(),
                  const SizedBox(height: 20),
                  _buildInfo(),
                ],
              ),
      ),
      bottomNavigationBar: isDesktop ? null : _buildBottomBar(),
    );
  }

  Widget _buildImage() {
    return Container(
      height: 400,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Image.network(
        _product!.mainImageUrl,
        fit: BoxFit.contain,
        errorBuilder: (c, e, s) =>
            const Icon(Icons.image_not_supported, size: 80, color: Colors.grey),
      ),
    );
  }

  Widget _buildInfo() {
    // Tính giá hiển thị
    String displayPrice = "Liên hệ";
    if (_selectedVariantId != null) {
      displayPrice = _formatCurrency(_currentPrice);
    } else if (_product!.variants.isNotEmpty) {
      final prices = _product!.variants.map((v) => v.price).toList()..sort();
      displayPrice =
          "${_formatCurrency(prices.first)} - ${_formatCurrency(prices.last)}";
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _product!.name,
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
          children: _product!.variants.map((variant) {
            bool isSelected = _selectedVariantId == variant.id;
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
          _product!.description,
          style: TextStyle(color: Colors.grey[700], height: 1.5),
        ),

        // Nút mua hàng cho Desktop
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
