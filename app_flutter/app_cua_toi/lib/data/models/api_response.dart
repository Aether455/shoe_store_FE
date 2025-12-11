class ApiResponse<T> {
  int code;
  String message;
  T? result;

  ApiResponse({this.code = 1000, this.message = "Success!", this.result});

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse(
      code: json['code'] ?? 1000,
      message: json['message'] ?? '',
      result: json['result'] != null && fromJsonT != null
          ? fromJsonT(json['result'])
          : null,
    );
  }
}
