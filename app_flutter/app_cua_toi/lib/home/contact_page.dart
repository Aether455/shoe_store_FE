import 'package:app_cua_toi/ui/cart/cart_page.dart';
import 'package:flutter/material.dart';

class ContactPage extends StatefulWidget {
  const ContactPage({super.key});

  @override
  State<ContactPage> createState() => _ContactPageState();
}

class _ContactPageState extends State<ContactPage> {
  final Color primaryColor = const Color(0xFFE30019);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(context),

      // SỬA LẠI BODY: Dùng Column để xếp Footer xuống dưới cùng
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ============================================
            // PHẦN 1: NỘI DUNG CHÍNH (MAP + FORM)
            // ============================================
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 30,
                  horizontal: 16,
                ),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1200),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      bool isMobile = constraints.maxWidth < 800;

                      return Flex(
                        direction: isMobile ? Axis.vertical : Axis.horizontal,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // CỘT TRÁI: BẢN ĐỒ
                          isMobile
                              ? _buildMapSection(height: 300)
                              : Flexible(
                                  flex: 3,
                                  child: _buildMapSection(height: 550),
                                ),

                          SizedBox(
                            width: isMobile ? 0 : 40,
                            height: isMobile ? 40 : 0,
                          ),

                          // CỘT PHẢI: THÔNG TIN & FORM
                          isMobile
                              ? _buildRightContent()
                              : Flexible(flex: 2, child: _buildRightContent()),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ),

            // ============================================
            // PHẦN 2: FOOTER (CHÂN TRANG)
            // ============================================
          ],
        ),
      ),
    );
  }

  // AppBar hiển thị Menu
  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: primaryColor,
      elevation: 0,
      centerTitle: true,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      title: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildMenuItem("HÀNG MỚI"),
            _buildMenuItem("NAM"),
            _buildMenuItem("NỮ"),
            _buildMenuItem("BÁN CHẠY"),
            _buildMenuItem("LIÊN HỆ", isSelected: true),
          ],
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.shopping_cart, color: Colors.white),
          onPressed: () {
            // Navigator.push(
            //   context,
            //   MaterialPageRoute(
            //     builder: (context) => CartPage(
            //       cartList: widget.cartList,
            //       favoriteList: const [], // ContactPage không có favoriteList nên để rỗng
            //       refresh: () {},
            //     ),
            //   ),
            // );
          },
        ),
        const SizedBox(width: 12),
      ],
    );
  }

  // Item Menu cho AppBar
  Widget _buildMenuItem(String title, {bool isSelected = false}) {
    return InkWell(
      onTap: () {
        if (title != "LIÊN HỆ") {
          Navigator.pop(context);
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.yellowAccent : Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  // Widget hiển thị Bản đồ
  Widget _buildMapSection({required double height}) {
    return Container(
      width: double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8), // Bo góc cho bản đồ đẹp hơn
      ),
      child: ClipRRect(
        // Cắt ảnh theo bo góc
        borderRadius: BorderRadius.circular(8),
        child: Image.asset(
          "assets/map.png",
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.broken_image, size: 50, color: Colors.grey),
                SizedBox(height: 8),
                Text(
                  "Kiểm tra lại file assets/map.png",
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Widget hiển thị nội dung bên phải (Thông tin + Form)
  Widget _buildRightContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoItem(
          Icons.location_on,
          "Lô 2, Công viên Phần mềm, Quang Trung, Phường Trung Mỹ Tây, TP.HCM",
        ),
        const SizedBox(height: 12),
        _buildInfoItem(Icons.phone, "(028) 389 11111"),
        const SizedBox(height: 12),
        _buildInfoItem(Icons.email, "khatutran123456@gmail.com"),

        const SizedBox(height: 30),

        Container(
          padding: const EdgeInsets.all(24), // Tăng padding trong form
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8), // Bo góc form
          ),
          child: Form(
            key: GlobalKey<FormState>(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Center(
                  child: Text(
                    "Liên hệ với chúng tôi",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 24),
                _buildTextField("Họ và Tên"),
                const SizedBox(height: 16),
                _buildTextField("Email"),
                const SizedBox(height: 16),
                _buildTextField("Nội dung", maxLines: 4),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50, // Nút cao hơn một chút
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ), // Bo góc nút nhẹ
                    ),
                    child: const Text(
                      "Gửi ngay",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 22, color: Colors.grey[700]),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: TextStyle(fontSize: 15, color: Colors.grey[800]),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(String hint, {int maxLines = 1}) {
    return TextFormField(
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey[500], fontSize: 14),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        isDense: true,
        border: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(4),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(4),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.blue),
          borderRadius: BorderRadius.circular(4),
        ),
      ),
    );
  }
}
