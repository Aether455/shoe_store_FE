import 'package:flutter/material.dart';
import '../../services/cart_service.dart';
import '../../services/auth_service.dart';
import '../auth/login_page.dart';
import '../product/product_search_delegate.dart';
import '../profile/profile_page.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  // Callback để MainScreen xử lý chuyển tab (chỉ dùng khi ở MainScreen)
  final VoidCallback? onCartPressed;
  final VoidCallback? onProfilePressed;

  // Flag để hiện nút back cho các trang con
  final bool showBackButton;

  const CustomAppBar({
    super.key,
    this.onCartPressed,
    this.onProfilePressed,
    this.showBackButton = false, // Mặc định false cho MainScreen
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: const Color(0xFFE30019),
      elevation: 0,
      automaticallyImplyLeading: false,
      // Logic hiển thị nút Back
      leading: showBackButton
          ? IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            )
          : null,
      title: Row(
        children: [
          const Text(
            "SHOE STORE",
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const Spacer(),

          // Nút Search
          IconButton(
            icon: const Icon(Icons.search, color: Colors.white),
            onPressed: () {
              showSearch(context: context, delegate: ProductSearchDelegate());
            },
          ),

          // Nút Cart
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart, color: Colors.white),
                onPressed:
                    onCartPressed, // Nếu null (trang con) thì không làm gì hoặc navigate
              ),
              ValueListenableBuilder<int>(
                valueListenable: CartService.cartCountNotifier,
                builder: (context, count, child) {
                  if (count == 0) return const SizedBox();
                  return Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 14,
                        minHeight: 14,
                      ),
                      child: Text(
                        '$count',
                        style: const TextStyle(
                          color: Color(0xFFE30019),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),

          const SizedBox(width: 8),

          // Icon User
          ValueListenableBuilder<bool>(
            valueListenable: AuthService.isLoggedInNotifier,
            builder: (context, isLoggedIn, child) {
              return GestureDetector(
                onTap: () {
                  if (onProfilePressed != null) {
                    onProfilePressed!();
                  } else {
                    // Nếu đang ở trang con, muốn về profile thì có thể push
                    if (isLoggedIn) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ProfileScreen(),
                        ),
                      );
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginPage()),
                      );
                    }
                  }
                },
                child: Icon(
                  isLoggedIn ? Icons.person : Icons.login,
                  color: Colors.white,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
