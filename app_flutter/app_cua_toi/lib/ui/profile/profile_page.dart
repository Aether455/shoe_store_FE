import 'package:app_cua_toi/ui/home/custom_app_bar.dart';
import 'package:app_cua_toi/ui/order/order_list_page.dart';
import 'package:app_cua_toi/ui/profile/customer_update_screen.dart';
import 'package:flutter/material.dart';
import '../../services/user_service.dart';
import '../../services/auth_service.dart';
import '../../data/models/user_model.dart';
import '../auth/login_page.dart';
import 'address_management_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  CustomerInfo? customerInfo;
  bool _isLoading = true;

  // Màu chủ đạo từ trang cũ (để tái sử dụng style)
  final Color primaryColor = const Color(0xFFE30019);

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    if (!AuthService.isLoggedIn) {
      setState(() => _isLoading = false);
      return;
    }

    // Gọi API lấy thông tin mới nhất
    final res = await UserService.getCustomerProfile();
    if (mounted) {
      setState(() {
        customerInfo = res.result;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // 1. Màn hình khi chưa đăng nhập
    return ValueListenableBuilder<bool>(
      valueListenable: AuthService.isLoggedInNotifier,
      builder: (context, isLoggedIn, child) {
        // 1. Nếu chưa đăng nhập -> Hiện giao diện yêu cầu login
        if (!isLoggedIn) {
          return Scaffold(
            backgroundColor: const Color(0xFFF5F5F5),
            // Không cần AppBar ở đây vì MainScreen đã có, hoặc để null
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.lock_outline, size: 80, color: Colors.grey[400]),
                  const SizedBox(height: 20),
                  const Text(
                    "Vui lòng đăng nhập để xem hồ sơ",
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      // Dùng rootNavigator để đè lên MainScreen
                      Navigator.of(context, rootNavigator: true)
                          .push(
                            MaterialPageRoute(
                              builder: (_) => const LoginPage(),
                            ),
                          )
                          .then((_) {
                            // Khi quay lại từ trang Login (đăng nhập thành công), load lại data
                            if (AuthService.isLoggedIn) _fetchUserData();
                          });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE30019),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 40,
                        vertical: 12,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    child: const Text(
                      "Đăng nhập ngay",
                      style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // 2. Đã đăng nhập -> Hiện Profile
        // Nếu vừa login xong mà chưa có data, gọi fetch
        if (customerInfo == null && !_isLoading) {
          _fetchUserData();
        }

        return Scaffold(
          backgroundColor: const Color(0xFFF5F5F5),
          body: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  child: Column(
                    children: [
                      _buildProfileHeader(),
                      _buildStatsSection(),
                      const SizedBox(height: 20),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          children: [
                            _buildMenuCard(
                              icon: Icons.edit,
                              title: 'Chỉnh sửa thông tin cá nhân',
                              value: 'Cập nhật tên, SĐT',
                              color: Colors.blue,
                              onTap: () async {
                                if (customerInfo != null) {
                                  await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => UpdateCustomerPage(
                                        info: customerInfo!,
                                      ),
                                    ),
                                  );
                                  _fetchUserData();
                                }
                              },
                            ),
                            _buildMenuCard(
                              icon: Icons.location_on,
                              title: 'Sổ địa chỉ',
                              value: 'Quản lý giao hàng',
                              color: Colors.orange,
                              onTap: () async {
                                if (customerInfo != null) {
                                  await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => AddressManagementScreen(
                                        customerId: customerInfo!.id,
                                      ),
                                    ),
                                  );
                                }
                              },
                            ),
                            _buildMenuCard(
                              icon: Icons.shopping_bag_outlined,
                              title: 'Lịch sử đơn hàng',
                              value: 'Xem chi tiết',
                              color: Colors.green,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const OrderListPage(),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: 10),
                            _buildLogoutButton(),
                          ],
                        ),
                      ),
                      const SizedBox(height: 50),
                    ],
                  ),
                ),
        );
      },
    );
  }

  // ==========================================
  // 1. HEADER PROFILE (GIAO DIỆN CŨ)
  // ==========================================
  Widget _buildProfileHeader() {
    return Container(
      color: Colors.white,
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
      margin: const EdgeInsets.only(bottom: 20),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey[200],
                  border: Border.all(color: Colors.grey.shade300, width: 4),
                ),
                child: const Icon(Icons.person, size: 65, color: Colors.grey),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Text(
            customerInfo?.fullName ??
                AuthService.currentUser?.username ??
                "User",
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            AuthService.currentUser?.email ?? "---",
            style: TextStyle(color: Colors.grey[600]),
          ),
          if (customerInfo?.phoneNumber != null)
            Text(
              customerInfo!.phoneNumber!,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
        ],
      ),
    );
  }

  // ==========================================
  // 2. PHẦN THỐNG KÊ (GIAO DIỆN CŨ)
  // ==========================================
  Widget _buildStatsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          // Nút Đơn hàng (Có chức năng)
          Expanded(
            child: InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => OrderListPage()),
                );
              },
              child: _buildStatCard(
                icon: Icons.shopping_bag_outlined,
                title: 'Đơn hàng',
                value: 'Xem', // Hoặc số lượng nếu có API đếm
                color: Colors.blue,
              ),
            ),
          ),
          const SizedBox(width: 15),
          // Nút Yêu thích (Placeholder - chưa có API)
          Expanded(
            child: _buildStatCard(
              icon: Icons.favorite_border,
              title: 'Yêu thích',
              value: '0',
              color: Colors.red,
            ),
          ),
          const SizedBox(width: 15),
          // Nút Điểm thưởng (Placeholder)
          Expanded(
            child: _buildStatCard(
              icon: Icons.card_giftcard,
              title: 'Điểm',
              value: '0',
              color: Colors.amber,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            title,
            style: TextStyle(fontSize: 11, color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 3. MENU LIST (STYLE GIỐNG INFO CARD CŨ)
  // ==========================================
  Widget _buildMenuCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(15),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(15),
          child: Padding(
            padding: const EdgeInsets.all(15),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        value,
                        style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right, color: Colors.grey[400]),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity,
      height: 55,
      child: OutlinedButton.icon(
        onPressed: () async {
          await AuthService.logout();
        },
        icon: const Icon(Icons.logout, color: Colors.red),
        label: const Text(
          "Đăng xuất",
          style: TextStyle(
            color: Colors.red,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Colors.red, width: 1.5),
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          elevation: 0,
        ),
      ),
    );
  }
}
