import 'package:app_cua_toi/home/checkout.dart';
import 'package:app_cua_toi/ui/auth/login_page.dart';
import 'package:app_cua_toi/ui/home/custom_app_bar.dart';
import 'package:app_cua_toi/ui/main/main_screen.dart';
import 'package:flutter/material.dart';
import '../../services/cart_service.dart';
import '../../services/auth_service.dart';
import '../../data/models/cart_model.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  CartResponse? _cart;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    AuthService.isLoggedInNotifier.addListener(_authListener);
    _authListener();
  }

  void _authListener() {
    if (AuthService.isLoggedIn) {
      _loadCart();
    } else {
      if (mounted) {
        setState(() {
          _cart = null;
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    AuthService.isLoggedInNotifier.removeListener(_authListener);
    super.dispose();
  }

  void _loadCart() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    final response = await CartService.getMyCart();
    if (mounted) {
      setState(() {
        if (response.code == 1000) {
          _cart = response.result;
        }
        _isLoading = false;
      });
    }
  }

  void _updateQuantity(int variantId, int quantity) async {
    if (quantity < 1) return;
    final response = await CartService.updateQuantity(variantId, quantity);

    if (response.code == 1000) {
      _loadCart();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.message), backgroundColor: Colors.red),
      );
    }
  }

  void _deleteItem(int cartItemId) async {
    final response = await CartService.deleteCartItem(cartItemId);
    if (response.code == 1000) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Đã xóa sản phẩm")));
      _loadCart();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.message), backgroundColor: Colors.red),
      );
    }
  }

  // --- THÊM MỚI: HÀM XỬ LÝ CLEAR CART ---
  void _clearAllCart() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Xác nhận"),
        content: const Text(
          "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Hủy", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context); // Đóng dialog
              setState(() => _isLoading = true);

              bool success = (await CartService.clearCart()).code == 1000;
              if (success) {
                // Refresh lại giỏ (lúc này sẽ rỗng)
                _loadCart();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Đã xóa toàn bộ giỏ hàng"),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } else {
                setState(() => _isLoading = false);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Lỗi khi xóa giỏ hàng"),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text(
              "Xóa tất cả",
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  String _formatCurrency(double price) {
    return "${price.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ";
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: AuthService.isLoggedInNotifier,
      builder: (context, isLoggedIn, child) {
        if (!isLoggedIn) {
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Vui lòng đăng nhập để xem giỏ hàng"),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context, rootNavigator: true)
                          .push(
                            MaterialPageRoute(
                              builder: (_) => const LoginPage(),
                            ),
                          )
                          .then((_) {
                            if (AuthService.isLoggedIn) _loadCart();
                          });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE30019),
                    ),
                    child: const Text(
                      "Đăng nhập",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // Nếu đã login mà chưa có data cart (và không đang load), thì gọi load
        if (_cart == null && !_isLoading) {
          // Delay nhẹ để tránh lỗi setState trong build
          Future.microtask(() => _loadCart());
        }

        return Scaffold(
          backgroundColor: Colors.white,
          body: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : (_cart == null || _cart!.cartItems.isEmpty)
              ? _buildEmptyCart()
              : _buildCartBody(),
        );
      },
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.remove_shopping_cart, size: 80, color: Colors.grey),
          const SizedBox(height: 20),
          const Text(
            "Giỏ hàng trống",
            style: TextStyle(fontSize: 18, color: Colors.grey),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              mainScreenKey.currentState?.onItemTapped(0);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE30019),
            ),
            child: const Text(
              "Tiếp tục mua sắm",
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartBody() {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: isDesktop
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(flex: 2, child: _buildItemsList()),
                const SizedBox(width: 30),
                Expanded(flex: 1, child: _buildSummary()),
              ],
            )
          : Column(
              children: [
                _buildItemsList(),
                const SizedBox(height: 20),
                _buildSummary(),
              ],
            ),
    );
  }

  // --- CẬP NHẬT: Thêm Header và Nút Xóa Tất Cả ---
  Widget _buildItemsList() {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade200),
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Header của List
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Giỏ hàng (${_cart!.cartItems.length} sản phẩm)",
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              TextButton.icon(
                onPressed: _clearAllCart,
                icon: const Icon(
                  Icons.delete_sweep,
                  color: Colors.red,
                  size: 20,
                ),
                label: const Text(
                  "Xóa tất cả",
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
          const Divider(),

          // Danh sách sản phẩm
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _cart!.cartItems.length,
            separatorBuilder: (c, i) => const Divider(),
            itemBuilder: (context, index) {
              final item = _cart!.cartItems[index];
              return _buildCartItem(item);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(CartItem item) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ảnh
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Image.network(
            item.productImageUrl,
            fit: BoxFit.cover,
            errorBuilder: (c, e, s) => const Icon(Icons.image),
          ),
        ),
        const SizedBox(width: 15),
        // Info
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.productName,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                item.variantName,
                style: TextStyle(color: Colors.grey[600], fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                _formatCurrency(item.price),
                style: const TextStyle(
                  color: Color(0xFFE30019),
                  fontWeight: FontWeight.bold,
                ),
              ),

              // Mobile controls
              const SizedBox(height: 8),
              Row(
                children: [
                  _quantityButton(
                    Icons.remove,
                    () => _updateQuantity(
                      item.productVariantId,
                      item.quantity - 1,
                    ),
                  ),
                  Container(
                    width: 30,
                    alignment: Alignment.center,
                    child: Text("${item.quantity}"),
                  ),
                  _quantityButton(
                    Icons.add,
                    () => _updateQuantity(
                      item.productVariantId,
                      item.quantity + 1,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red),
                    onPressed: () => _deleteItem(item.id),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _quantityButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Icon(icon, size: 16),
      ),
    );
  }

  Widget _buildSummary() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Cộng giỏ hàng",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Tạm tính:"),
              Text(
                _formatCurrency(_cart!.totalAmount),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const Divider(height: 30),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Tổng tiền:",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              Text(
                _formatCurrency(_cart!.totalAmount),
                style: const TextStyle(
                  fontSize: 18,
                  color: Color(0xFFE30019),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CheckoutPage(
                      cartList: _cart!.cartItems,
                      refresh: () {},
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE30019),
              ),
              child: const Text(
                "TIẾN HÀNH THANH TOÁN",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
