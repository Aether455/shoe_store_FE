import 'package:app_cua_toi/ui/auth/login_page.dart';
import 'package:flutter/material.dart';
import '../../../services/auth_service.dart';
import '../../../data/models/auth_model.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({Key? key}) : super(key: key);

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _usernameController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_usernameController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập đầy đủ thông tin!'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final request = RegisterRequest(
      username: _usernameController.text,
      password: _passwordController.text,
      email: _emailController.text,
      fullName: _fullNameController.text,
      phoneNumber: _phoneController.text,
    );

    var response = await AuthService.register(request);

    setState(() => _isLoading = false);

    if (response.code == 1000) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đăng ký thành công! Vui lòng đăng nhập.'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginPage()),
      );
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.message), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 900) {
            // DESKTOP LAYOUT (2 Cột - Giữ nguyên vì không bị lỗi phím)
            return Row(
              children: [
                Expanded(child: _buildRegisterForm(context, isDesktop: true)),
                Expanded(child: _buildHelloPanel(context, isDesktop: true)),
              ],
            );
          } else {
            // MOBILE LAYOUT (Fix lỗi overflow)
            return SingleChildScrollView(
              // ClampingScrollPhysics giúp cuộn mượt mà hơn khi nội dung vừa đủ màn hình
              physics: const ClampingScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: IntrinsicHeight(
                  child: Column(
                    children: [
                      // Hello Panel: Không dùng Expanded nữa, dùng Container height tùy chỉnh
                      // Khi bàn phím hiện, phần này sẽ được cuộn lên trên
                      Container(
                        width: double.infinity,
                        // Chiều cao tối thiểu 200 hoặc 25% màn hình để đảm bảo đẹp
                        height: 250,
                        child: _buildHelloPanel(context, isDesktop: false),
                      ),

                      // Register Form: Chiếm phần còn lại
                      Expanded(
                        child: Container(
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(30),
                              topRight: Radius.circular(30),
                            ),
                          ),
                          // Thêm padding bottom để tránh sát mép dưới khi cuộn
                          padding: const EdgeInsets.only(bottom: 20),
                          child: _buildRegisterForm(context, isDesktop: false),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }
        },
      ),
    );
  }

  Widget _buildHelloPanel(BuildContext context, {required bool isDesktop}) {
    return Container(
      width: double.infinity,
      // Nếu desktop thì full height, mobile thì height do parent quyết định
      height: isDesktop ? double.infinity : null,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFF4081), Color.fromARGB(255, 255, 0, 85)],
        ),
      ),
      child: Center(
        child: SingleChildScrollView(
          // Thêm ScrollView cho nội dung bên trong Panel
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize:
                MainAxisSize.min, // Quan trọng: chỉ chiếm không gian cần thiết
            children: [
              const Text(
                'Hello, Friend!',
                style: TextStyle(
                  fontSize: 28, // Giảm font size một chút cho mobile
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              const Text(
                'Enter your personal details and start journey with us',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.white70,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),
              OutlinedButton(
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginPage()),
                  );
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white, width: 2),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 30,
                    vertical: 10,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                child: const Text(
                  'SIGN IN',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRegisterForm(BuildContext context, {required bool isDesktop}) {
    final padding = isDesktop
        ? const EdgeInsets.symmetric(horizontal: 60, vertical: 40)
        : const EdgeInsets.symmetric(horizontal: 30, vertical: 30);

    return Center(
      // Căn giữa form
      child: SingleChildScrollView(
        // Cho phép cuộn form riêng lẻ nếu cần
        padding: padding,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Create Account',
              style: TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildSocialIcon(Icons.facebook, const Color(0xFF3B5998)),
                const SizedBox(width: 15),
                _buildSocialIcon(Icons.mail, const Color(0xFFDB4437)),
                const SizedBox(width: 15),
                _buildSocialIcon(Icons.tag, const Color(0xFF0077B5)),
              ],
            ),
            const SizedBox(height: 15),

            Text(
              'or use your email for registration',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
            const SizedBox(height: 25),

            _buildTextField(
              controller: _usernameController,
              hintText: 'Username',
              icon: Icons.person_outline,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              controller: _fullNameController,
              hintText: 'Full Name',
              icon: Icons.badge_outlined,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              controller: _phoneController,
              hintText: 'Phone Number',
              icon: Icons.phone_android,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              controller: _emailController,
              hintText: 'Email',
              icon: Icons.email_outlined,
            ),
            const SizedBox(height: 12),
            _buildTextField(
              controller: _passwordController,
              hintText: 'Password',
              icon: Icons.lock_outline,
              isPassword: true,
            ),
            const SizedBox(height: 30),

            SizedBox(
              width: 200,
              height: 45,
              child: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFFFF4081),
                      Color.fromARGB(255, 241, 1, 81),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(25),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFF4081).withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'SIGN UP',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 1.2,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // (Giữ nguyên _buildSocialIcon và _buildTextField cũ)
  Widget _buildSocialIcon(IconData icon, Color color) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.grey[300]!, width: 1),
      ),
      child: Icon(icon, color: color, size: 20),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hintText,
    required IconData icon,
    bool isPassword = false,
  }) {
    return Container(
      height: 45,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword && _obscurePassword,
        style: const TextStyle(fontSize: 14),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: TextStyle(fontSize: 13, color: Colors.grey[400]),
          prefixIcon: Icon(icon, size: 18, color: Colors.grey[600]),
          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    size: 18,
                    color: Colors.grey[600],
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
          isDense: true,
        ),
      ),
    );
  }
}
