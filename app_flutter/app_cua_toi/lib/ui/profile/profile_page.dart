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
  @override
  void initState() {
    super.initState();
    // Gọi fetch 1 lần khi init, kết quả sẽ bắn vào Stream
    if (AuthService.isLoggedIn) {
      UserService.fetchCustomerProfile();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Lắng nghe trạng thái đăng nhập
    return ValueListenableBuilder<bool>(
      valueListenable: AuthService.isLoggedInNotifier,
      builder: (context, isLoggedIn, child) {
        // 1. Chưa đăng nhập
        if (!isLoggedIn) {
          return Scaffold(
            backgroundColor: const Color(0xFFF5F5F5),
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
                      Navigator.of(context, rootNavigator: true)
                          .push(
                            MaterialPageRoute(
                              builder: (_) => const LoginPage(),
                            ),
                          )
                          .then((_) {
                            if (AuthService.isLoggedIn)
                              UserService.fetchCustomerProfile();
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

        // 2. Đã đăng nhập -> Lắng nghe Stream Customer Info
        return StreamBuilder<CustomerInfo?>(
          stream: UserService.customerStream,
          initialData: UserService.currentInfo,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting &&
                snapshot.data == null) {
              return const Scaffold(
                body: Center(
                  child: CircularProgressIndicator(color: Color(0xFFE30019)),
                ),
              );
            }

            final customerInfo = snapshot.data;

            return Scaffold(
              backgroundColor: const Color(0xFFF5F5F5),
              body: SingleChildScrollView(
                child: Column(
                  children: [
                    _buildProfileHeader(customerInfo),
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
                            onTap: () {
                              if (customerInfo != null) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        UpdateCustomerPage(info: customerInfo),
                                  ),
                                );
                              }
                            },
                          ),
                          _buildMenuCard(
                            icon: Icons.location_on,
                            title: 'Sổ địa chỉ',
                            value: 'Quản lý giao hàng',
                            color: Colors.orange,
                            onTap: () {
                              if (customerInfo != null) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => AddressManagementScreen(
                                      customerId: customerInfo.id,
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
      },
    );
  }

  Widget _buildProfileHeader(CustomerInfo? info) {
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
            info?.fullName ?? AuthService.currentUser?.username ?? "User",
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            AuthService.currentUser?.email ?? "---",
            style: TextStyle(color: Colors.grey[600]),
          ),
          if (info?.phoneNumber != null)
            Text(
              info!.phoneNumber!,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
        ],
      ),
    );
  }

  Widget _buildStatsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const OrderListPage()),
              ),
              child: _buildStatCard(
                icon: Icons.shopping_bag_outlined,
                title: 'Đơn hàng',
                value: 'Xem',
                color: Colors.blue,
              ),
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: _buildStatCard(
              icon: Icons.favorite_border,
              title: 'Yêu thích',
              value: '0',
              color: Colors.red,
            ),
          ),
          const SizedBox(width: 15),
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
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Text(title, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
        ],
      ),
    );
  }

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
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(value, style: const TextStyle(fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: OutlinedButton.icon(
        onPressed: () async {
          // HIỂN THỊ HỘP THOẠI XÁC NHẬN
          bool confirm =
              await showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text("Đăng xuất"),
                  content: const Text("Bạn có chắc chắn muốn đăng xuất không?"),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text(
                        "Hủy",
                        style: TextStyle(color: Colors.grey),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context, true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                      ),
                      child: const Text(
                        "Đăng xuất",
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ) ??
              false;

          // NẾU ĐỒNG Ý -> GỌI LOGOUT
          if (confirm) {
            await AuthService.logout();
          }
        },
        icon: const Icon(Icons.logout, color: Colors.red),
        label: const Text(
          "Đăng xuất",
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
        ),
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Colors.red),
          backgroundColor: Colors.white,
        ),
      ),
    );
  }
}
