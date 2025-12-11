import 'package:app_cua_toi/ui/cart/cart_page.dart';
import 'package:app_cua_toi/ui/home/custom_app_bar.dart';
import 'package:app_cua_toi/ui/home/home_page.dart';
import 'package:app_cua_toi/ui/product/product_list_page.dart';
import 'package:app_cua_toi/ui/profile/profile_page.dart';
import 'package:flutter/material.dart';

final GlobalKey<MainScreenState> mainScreenKey = GlobalKey<MainScreenState>();

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => MainScreenState();
}

class MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  // Danh sách các trang. Lưu ý: Các trang này KHÔNG được có Scaffold/AppBar riêng.
  final List<Widget> _pages = [
    const HomePage(),
    const ProductListPage(title: "Sản phẩm"), // Tab danh mục
    const CartPage(),
    const ProfileScreen(),
  ];

  void onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // AppBar dùng chung, xử lý sự kiện click icon để chuyển tab
      appBar: CustomAppBar(
        showBackButton: false,
        onCartPressed: () => onItemTapped(2),
        onProfilePressed: () => onItemTapped(3),
      ),

      // Body giữ trạng thái hoặc render lại tùy chọn
      body: IndexedStack(index: _selectedIndex, children: _pages),

      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Trang chủ'),
          BottomNavigationBarItem(
            icon: Icon(Icons.category),
            label: 'Sản phẩm',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Giỏ hàng',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Tài khoản'),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: const Color(0xFFE30019),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType
            .fixed, // Để hiển thị đủ 4 item không bị effect shifting
        onTap: onItemTapped,
      ),
    );
  }
}
