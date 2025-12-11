import 'package:app_cua_toi/ui/main/main_screen.dart';
import 'package:flutter/material.dart';

// Import các file trang
import 'ui/home/home_page.dart';
import 'ui/cart/cart_page.dart';
import 'ui/profile/profile_page.dart';
import 'ui/auth/login_page.dart';
import 'ui/auth/register_page.dart';
// Import Service & Network
import 'data/network/api_client.dart';
import 'services/auth_service.dart';

// Khai báo biến toàn cục ở đây
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  // Đảm bảo binding được khởi tạo trước khi gọi code khác
  WidgetsFlutterBinding.ensureInitialized();

  // Truyền navigatorKey vào ApiClient
  ApiClient.init(navigatorKey: navigatorKey);

  // Kiểm tra đăng nhập (nếu có)
  await AuthService.checkLoginStatus();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey, // Gắn key vào MaterialApp
      debugShowCheckedModeBanner: false,
      home: MainScreen(key: mainScreenKey), // Dùng MainScreen làm trang chủ
      routes: {
        '/login': (_) => const LoginPage(),
        '/register': (_) => const RegisterPage(),
      },
    );
  }
}
