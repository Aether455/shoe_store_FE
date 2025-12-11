class LoginRequest {
  final String username;
  final String password;
  LoginRequest({required this.username, required this.password});
  Map<String, dynamic> toJson() => {'username': username, 'password': password};
}

class RegisterRequest {
  final String username;
  final String password;
  final String email;
  final String fullName;
  final String phoneNumber;

  RegisterRequest({
    required this.username,
    required this.password,
    required this.email,
    required this.fullName,
    required this.phoneNumber,
  });

  Map<String, dynamic> toJson() => {
    'username': username,
    'password': password,
    'email': email,
    'fullName': fullName,
    'phoneNumber': phoneNumber,
  };
}

class AuthResponse {
  final String token;
  final bool authenticated;
  AuthResponse({required this.token, required this.authenticated});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] ?? '',
      authenticated: json['authenticated'] ?? false,
    );
  }
}
