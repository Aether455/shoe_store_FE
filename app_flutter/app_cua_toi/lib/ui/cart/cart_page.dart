import 'package:app_cua_toi/ui/checkout/checkout.dart';
import 'package:app_cua_toi/ui/auth/login_page.dart';
import 'package:app_cua_toi/ui/home/custom_app_bar.dart';
import 'package:app_cua_toi/ui/main/main_screen.dart'; // Để dùng mainScreenKey
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
  @override
  void initState() {
    super.initState();
    // Fetch data lần đầu nếu đã login
    if (AuthService.isLoggedIn) {
      CartService.fetchCart();
    }
  }

  // --- HÀM DIALOG XÁC NHẬN CHUNG ---
  Future<bool> _showDeleteConfirmDialog(String title, String content) async {
    return await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(title),
            content: Text(content),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text("Hủy", style: TextStyle(color: Colors.grey)),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                child: const Text("Xóa", style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ) ??
        false;
  }

  void _updateQuantity(
    int variantId,
    int currentQuantity,
    int newQuantity,
    int cartItemId,
  ) async {
    // Trường hợp giảm về 0 -> Hỏi xóa
    if (newQuantity <= 0) {
      bool confirm = await _showDeleteConfirmDialog(
        "Xóa sản phẩm",
        "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      );
      if (confirm) {
        _deleteItem(
          cartItemId,
          showConfirm: false,
        ); // Đã confirm rồi nên không hiện lại
      }
      return;
    }

    // Trường hợp tăng/giảm bình thường
    final response = await CartService.updateQuantity(variantId, newQuantity);
    if (response.code != 1000) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: Colors.red,
          ),
        );
    }
  }

  void _deleteItem(int cartItemId, {bool showConfirm = true}) async {
    if (showConfirm) {
      bool confirm = await _showDeleteConfirmDialog(
        "Xác nhận",
        "Bạn muốn xóa sản phẩm này?",
      );
      if (!confirm) return;
    }

    final response = await CartService.deleteCartItem(cartItemId);
    if (response.code == 1000) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Đã xóa sản phẩm")));
    } else {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: Colors.red,
          ),
        );
    }
  }

  void _clearAllCart() async {
    bool confirm = await _showDeleteConfirmDialog(
      "Xóa giỏ hàng",
      "Bạn có chắc chắn muốn xóa TẤT CẢ sản phẩm trong giỏ hàng?",
    );

    if (confirm) {
      final response = await CartService.clearCart();
      if (response.code == 1000) {
        if (mounted)
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Giỏ hàng đã được làm trống"),
              backgroundColor: Colors.green,
            ),
          );
      } else {
        if (mounted)
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response.message),
              backgroundColor: Colors.red,
            ),
          );
      }
    }
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
            backgroundColor: Colors.white,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.lock_outline, size: 80, color: Colors.grey),
                  const SizedBox(height: 20),
                  const Text(
                    "Vui lòng đăng nhập để xem giỏ hàng",
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context, rootNavigator: true)
                          .push(
                            MaterialPageRoute(
                              builder: (_) => const LoginPage(),
                            ),
                          )
                          .then((_) {
                            if (AuthService.isLoggedIn) CartService.fetchCart();
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

        // StreamBuilder lắng nghe dữ liệu giỏ hàng
        return StreamBuilder<CartResponse?>(
          stream: CartService.cartStream,
          initialData: CartService.currentCart,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting &&
                snapshot.data == null) {
              CartService.fetchCart(); // Gọi fetch nếu chưa có data
              return const Scaffold(
                backgroundColor: Colors.white,
                body: Center(
                  child: CircularProgressIndicator(color: Color(0xFFE30019)),
                ),
              );
            }

            final cart = snapshot.data;

            return Scaffold(
              backgroundColor: Colors.white,
              body: (cart == null || cart.cartItems.isEmpty)
                  ? _buildEmptyCart()
                  : _buildCartBody(cart),
            );
          },
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
              mainScreenKey.currentState?.onItemTapped(0); // Về trang chủ
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

  Widget _buildCartBody(CartResponse cart) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: isDesktop
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(flex: 2, child: _buildItemsList(cart)),
                const SizedBox(width: 30),
                Expanded(flex: 1, child: _buildSummary(cart)),
              ],
            )
          : Column(
              children: [
                _buildItemsList(cart),
                const SizedBox(height: 20),
                _buildSummary(cart),
              ],
            ),
    );
  }

  Widget _buildItemsList(CartResponse cart) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade200),
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Giỏ hàng (${cart.cartItems.length} sản phẩm)",
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              TextButton.icon(
                onPressed: _clearAllCart, // Gọi hàm xóa tất cả
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
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: cart.cartItems.length,
            separatorBuilder: (c, i) => const Divider(),
            itemBuilder: (context, index) {
              return _buildCartItem(cart.cartItems[index]);
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

              const SizedBox(height: 8),
              Row(
                children: [
                  // Nút Giảm
                  _quantityButton(
                    Icons.remove,
                    () => _updateQuantity(
                      item.productVariantId,
                      item.quantity,
                      item.quantity - 1,
                      item.id,
                    ),
                  ),

                  Container(
                    width: 30,
                    alignment: Alignment.center,
                    child: Text("${item.quantity}"),
                  ),

                  // Nút Tăng
                  _quantityButton(
                    Icons.add,
                    () => _updateQuantity(
                      item.productVariantId,
                      item.quantity,
                      item.quantity + 1,
                      item.id,
                    ),
                  ),

                  const Spacer(),
                  // Nút Xóa item
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

  Widget _buildSummary(CartResponse cart) {
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
                _formatCurrency(cart.totalAmount),
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
                _formatCurrency(cart.totalAmount),
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
                    builder: (_) =>
                        CheckoutPage(cartList: cart.cartItems, refresh: () {}),
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
