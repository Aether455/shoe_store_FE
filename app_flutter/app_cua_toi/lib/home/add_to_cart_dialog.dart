// // ignore_for_file: unused_import

// import 'package:flutter/material.dart';
// import 'cart_item.dart';
// import '../ui/cart/cart_page.dart';
// import 'checkout.dart'; // ⭐ Import trang Thanh toán

// class AddToCartDialog extends StatelessWidget {
//   final Product product;
//   final int quantity;
//   final List<CartItem> cartList;
//   final VoidCallback goToCart;
//   final VoidCallback refresh; // ⭐ Thêm refresh

//   const AddToCartDialog({
//     super.key,
//     required this.product,
//     required this.quantity,
//     required this.cartList,
//     required this.goToCart,
//     required this.refresh, // ⭐ Thêm refresh
//   });

//   String formatCurrency(int price) {
//     String priceStr = price.toString();
//     String result = "";
//     int count = 0;
//     for (int i = priceStr.length - 1; i >= 0; i--) {
//       count++;
//       result = priceStr[i] + result;
//       if (count % 3 == 0 && i != 0) {
//         result = ".$result";
//       }
//     }
//     return "$resultđ";
//   }

//   int get totalPrice {
//     int total = 0;
//     for (var item in cartList) {
//       total += 99888;
//     }
//     return total;
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Dialog(
//       backgroundColor: Colors.white,
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
//       child: Container(
//         width: 800,
//         padding: const EdgeInsets.all(20),
//         child: SingleChildScrollView(
//           child: Column(
//             mainAxisSize: MainAxisSize.min,
//             children: [
//               Row(
//                 children: const [
//                   Icon(Icons.check, color: Colors.green),
//                   SizedBox(width: 8),
//                   Text(
//                     "Sản phẩm vừa được thêm vào giỏ hàng",
//                     style: TextStyle(
//                       fontSize: 16,
//                       color: Colors.green,
//                       fontWeight: FontWeight.bold,
//                     ),
//                   ),
//                   Spacer(),
//                   CloseButton(),
//                 ],
//               ),
//               const Divider(),
//               const SizedBox(height: 20),

//               LayoutBuilder(
//                 builder: (context, constraints) {
//                   bool isMobile = constraints.maxWidth < 600;

//                   Widget leftContent = Column(
//                     children: [
//                       Container(
//                         height: 150,
//                         width: 150,
//                         decoration: BoxDecoration(
//                           border: Border.all(color: Colors.grey.shade200),
//                         ),
//                         child: Image.asset(
//                           "product.image",
//                           fit: BoxFit.contain,
//                           errorBuilder: (context, error, stackTrace) =>
//                               const Center(
//                                 child: Icon(
//                                   Icons.image_not_supported,
//                                   size: 40,
//                                   color: Colors.grey,
//                                 ),
//                               ),
//                         ),
//                       ),
//                       const SizedBox(height: 10),
//                       Text(
//                         "product.name",
//                         style: const TextStyle(fontWeight: FontWeight.bold),
//                         textAlign: TextAlign.center,
//                       ),
//                       const SizedBox(height: 5),
//                       Text(
//                         formatCurrency(32856296),
//                         style: const TextStyle(fontWeight: FontWeight.bold),
//                       ),
//                       const SizedBox(height: 5),
//                       Text(
//                         "Số lượng: $quantity",
//                         style: const TextStyle(color: Colors.grey),
//                       ),
//                     ],
//                   );

//                   Widget rightContent = Column(
//                     children: [
//                       const Text(
//                         "GIỎ HÀNG",
//                         style: TextStyle(
//                           fontSize: 18,
//                           fontWeight: FontWeight.bold,
//                         ),
//                       ),
//                       const SizedBox(height: 20),
//                       const Text(
//                         "Tổng tiền trong giỏ",
//                         style: TextStyle(color: Colors.grey),
//                       ),
//                       const SizedBox(height: 5),
//                       Text(
//                         formatCurrency(totalPrice),
//                         style: const TextStyle(
//                           fontSize: 22,
//                           fontWeight: FontWeight.bold,
//                           color: Colors.red,
//                         ),
//                       ),
//                       const SizedBox(height: 20),

//                       // ⭐ Nút Thanh toán -> Chuyển trang Checkout
//                       SizedBox(
//                         width: double.infinity,
//                         height: 45,
//                         child: OutlinedButton(
//                           onPressed: () {
//                             Navigator.pop(context); // Đóng popup
//                             Navigator.push(
//                               context,
//                               MaterialPageRoute(
//                                 builder: (context) => CheckoutPage(
//                                   cartList: cartList,
//                                   refresh: refresh,
//                                 ),
//                               ),
//                             );
//                           },
//                           style: OutlinedButton.styleFrom(
//                             side: const BorderSide(color: Colors.grey),
//                           ),
//                           child: const Text(
//                             "Thanh toán",
//                             style: TextStyle(color: Colors.black),
//                           ),
//                         ),
//                       ),
//                       const SizedBox(height: 10),

//                       // Nút Tới giỏ hàng
//                       SizedBox(
//                         width: double.infinity,
//                         height: 45,
//                         child: OutlinedButton(
//                           onPressed: () {
//                             Navigator.pop(context);
//                             goToCart();
//                           },
//                           style: OutlinedButton.styleFrom(
//                             side: const BorderSide(color: Colors.grey),
//                           ),
//                           child: const Text(
//                             "Tới giỏ hàng",
//                             style: TextStyle(color: Colors.black),
//                           ),
//                         ),
//                       ),
//                     ],
//                   );

//                   if (isMobile) {
//                     return Column(
//                       children: [
//                         leftContent,
//                         const SizedBox(height: 30),
//                         rightContent,
//                       ],
//                     );
//                   } else {
//                     return Row(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         Expanded(child: leftContent),
//                         Container(
//                           width: 1,
//                           height: 200,
//                           color: Colors.grey.shade200,
//                           margin: const EdgeInsets.symmetric(horizontal: 20),
//                         ),
//                         Expanded(child: rightContent),
//                       ],
//                     );
//                   }
//                 },
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
