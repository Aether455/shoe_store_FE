// import 'package:flutter/material.dart';
// import '../ui/product/product_detail_page.dart';
// import 'cart_item.dart';

// // ===== TRANG SẢN PHẨM NỔI BẬT (BÁN CHẠY) =====
// class BestSellerPage extends StatefulWidget {
//   final List<Product> favoriteList;
//   final List<CartItem> cartList;
//   final VoidCallback refresh;
//   final VoidCallback goToCart;

//   const BestSellerPage({
//     super.key,
//     required this.favoriteList,
//     required this.cartList,
//     required this.refresh,
//     required this.goToCart,
//   });

//   @override
//   State<BestSellerPage> createState() => _BestSellerPageState();
// }

// class _BestSellerPageState extends State<BestSellerPage> {
//   final Color primaryColor = const Color(0xFFE30019);
//   final Color darkTextColor = const Color(0xFF333333);
//   final Color lightGreyColor = const Color(0xFFF5F5F5);

//   // ===== CÁC BỘ LỌC =====
//   String selectedMainCategory = "Tất cả sản phẩm";
//   Set<String> selectedSubCategories = {};
//   Set<String> selectedBrands = {};
//   Set<String> selectedColors = {};
//   Set<int> selectedSizes = {};
//   RangeValues priceRange = const RangeValues(0, 10000000);

//   // Danh sách tùy chọn bộ lọc - ⭐ CẬP NHẬT CHO TRANG BÁN CHẠY
//   final List<String> mainCategories = [
//     "Tất cả sản phẩm",
//     "Sản phẩm mới (14)",
//     "Sản phẩm khuyến mãi (18)",
//   ];

//   final List<String> subCategories = [
//     "Giày Sneaker",
//     "Áo thể thao",
//     "Giày Sandal",
//   ];

//   final List<String> brands = ["My Shoes", "Crown UK"];

//   final List<Map<String, dynamic>> colors = [
//     {"name": "Đỏ", "color": Colors.red},
//     {"name": "Xanh dương", "color": Colors.blue},
//     {"name": "Xanh lá", "color": Colors.green},
//     {"name": "Đen", "color": Colors.black},
//     {"name": "Trắng", "color": Colors.white},
//     {"name": "Vàng", "color": Colors.yellow},
//     {"name": "Cam", "color": Colors.orange},
//     {"name": "Tím", "color": Colors.purple},
//     {"name": "Hồng", "color": Colors.pink},
//     {"name": "Xám", "color": Colors.grey},
//   ];

//   final List<int> sizes = [
//     22,
//     23,
//     24,
//     25,
//     26,
//     27,
//     28,
//     29,
//     30,
//     31,
//     32,
//     33,
//     34,
//     35,
//     36,
//     37,
//     38,
//     39,
//     40,
//     41,
//     42,
//     43,
//     44,
//   ];

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

//   @override
//   Widget build(BuildContext context) {
//     // ⭐ LỌC SẢN PHẨM - Hiển thị tất cả sản phẩm
//     List<Product> displayProducts = products;

//     return Scaffold(
//       backgroundColor: Colors.white,
//       appBar: _buildAppBar(),
//       body: Row(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//           // ===== SIDEBAR BỘ LỌC BÊN TRÁI =====
//           Container(
//             width: 250,
//             color: Colors.white,
//             child: SingleChildScrollView(
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   // DANH MỤC
//                   Container(
//                     padding: const EdgeInsets.all(16),
//                     child: Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         _buildFilterTitle("DANH MỤC"),
//                         const SizedBox(height: 12),
//                         _buildMainCategoryFilter(),
//                       ],
//                     ),
//                   ),

//                   Divider(thickness: 1, color: Colors.grey[200], height: 1),

//                   // BỘ LỌC
//                   Container(
//                     padding: const EdgeInsets.all(16),
//                     child: Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         _buildFilterTitle("BỘ LỌC"),
//                         const SizedBox(height: 12),

//                         // LOẠI
//                         _buildExpandableFilter(
//                           "LOẠI",
//                           _buildSubCategoryFilter(),
//                         ),
//                         const SizedBox(height: 16),

//                         // THƯƠNG HIỆU
//                         _buildExpandableFilter(
//                           "THƯƠNG HIỆU",
//                           _buildBrandFilter(),
//                         ),
//                         const SizedBox(height: 16),

//                         // GIÁ SẢN PHẨM
//                         _buildExpandableFilter(
//                           "GIÁ SẢN PHẨM",
//                           _buildPriceFilter(),
//                         ),
//                         const SizedBox(height: 16),

//                         // MÀU SẮC
//                         _buildExpandableFilter("MÀU SẮC", _buildColorFilter()),
//                         const SizedBox(height: 16),

//                         // KÍCH CỠ
//                         _buildExpandableFilter("KÍCH CỠ", _buildSizeFilter()),
//                       ],
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//           ),

//           // Đường kẻ dọc
//           Container(width: 1, color: Colors.grey[200]),

//           // ===== NỘI DUNG CHÍNH - LƯỚI SẢN PHẨM =====
//           Expanded(
//             child: SingleChildScrollView(
//               child: Padding(
//                 padding: const EdgeInsets.all(16.0),
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     // Breadcrumb
//                     Row(
//                       children: [
//                         Text(
//                           "Trang chủ",
//                           style: TextStyle(
//                             fontSize: 12,
//                             color: Colors.grey[600],
//                           ),
//                         ),
//                         Text(
//                           " / ",
//                           style: TextStyle(
//                             fontSize: 12,
//                             color: Colors.grey[600],
//                           ),
//                         ),
//                         Text(
//                           "Sản phẩm nổi bật",
//                           style: TextStyle(
//                             fontSize: 12,
//                             color: Colors.grey[600],
//                           ),
//                         ),
//                       ],
//                     ),
//                     const SizedBox(height: 16),

//                     // Header
//                     Row(
//                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                       children: [
//                         Column(
//                           crossAxisAlignment: CrossAxisAlignment.start,
//                           children: [
//                             Text(
//                               "SẢN PHẨM NỔI BẬT",
//                               style: TextStyle(
//                                 fontSize: 20,
//                                 fontWeight: FontWeight.bold,
//                                 color: darkTextColor,
//                               ),
//                             ),
//                             const SizedBox(height: 4),
//                             Text(
//                               "(Hiển thị 1 - ${displayProducts.length} / ${displayProducts.length} sản phẩm)",
//                               style: TextStyle(
//                                 fontSize: 12,
//                                 color: Colors.grey[600],
//                               ),
//                             ),
//                           ],
//                         ),
//                         Row(
//                           children: [
//                             const Text(
//                               "Sắp xếp theo: ",
//                               style: TextStyle(fontSize: 13),
//                             ),
//                             DropdownButton<String>(
//                               value: "Mặc định",
//                               items: const [
//                                 DropdownMenuItem(
//                                   value: "Mặc định",
//                                   child: Text(
//                                     "Mặc định",
//                                     style: TextStyle(fontSize: 13),
//                                   ),
//                                 ),
//                                 DropdownMenuItem(
//                                   value: "Giá cao xuống thấp",
//                                   child: Text(
//                                     "Giá cao xuống thấp",
//                                     style: TextStyle(fontSize: 13),
//                                   ),
//                                 ),
//                                 DropdownMenuItem(
//                                   value: "Giá thấp lên cao",
//                                   child: Text(
//                                     "Giá thấp lên cao",
//                                     style: TextStyle(fontSize: 13),
//                                   ),
//                                 ),
//                                 DropdownMenuItem(
//                                   value: "Mới nhất",
//                                   child: Text(
//                                     "Mới nhất",
//                                     style: TextStyle(fontSize: 13),
//                                   ),
//                                 ),
//                               ],
//                               onChanged: (value) {
//                                 // TODO: Thêm logic sắp xếp
//                               },
//                               underline: Container(),
//                               icon: const Icon(Icons.arrow_drop_down, size: 20),
//                             ),
//                           ],
//                         ),
//                       ],
//                     ),
//                     const SizedBox(height: 20),

//                     // ===== LƯỚI SẢN PHẨM =====
//                     displayProducts.isEmpty
//                         ? _buildEmptyState()
//                         : _buildProductGrid(displayProducts),
//                   ],
//                 ),
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   // ===== APP BAR =====
//   PreferredSizeWidget _buildAppBar() {
//     return AppBar(
//       backgroundColor: primaryColor,
//       elevation: 0,
//       centerTitle: true,
//       title: SingleChildScrollView(
//         scrollDirection: Axis.horizontal,
//         child: Row(
//           mainAxisSize: MainAxisSize.min,
//           children: ["HÀNG MỚI", "NAM", "NỮ", "BÁN CHẠY", "LIÊN HỆ"].map((
//             item,
//           ) {
//             return Padding(
//               padding: const EdgeInsets.symmetric(horizontal: 12.0),
//               child: Text(
//                 item,
//                 style: const TextStyle(
//                   color: Colors.white,
//                   fontWeight: FontWeight.bold,
//                   fontSize: 13,
//                 ),
//               ),
//             );
//           }).toList(),
//         ),
//       ),
//       actions: [
//         IconButton(
//           icon: const Icon(Icons.search, color: Colors.white),
//           onPressed: () {},
//         ),
//         Stack(
//           alignment: Alignment.center,
//           children: [
//             IconButton(
//               icon: const Icon(Icons.shopping_cart, color: Colors.white),
//               onPressed: widget.goToCart,
//             ),
//             if (widget.cartList.isNotEmpty)
//               Positioned(
//                 right: 8,
//                 top: 8,
//                 child: Container(
//                   padding: const EdgeInsets.all(2),
//                   decoration: const BoxDecoration(
//                     color: Colors.white,
//                     shape: BoxShape.circle,
//                   ),
//                   constraints: const BoxConstraints(
//                     minWidth: 14,
//                     minHeight: 14,
//                   ),
//                   child: Text(
//                     '${widget.cartList.length}',
//                     style: TextStyle(
//                       color: primaryColor,
//                       fontSize: 10,
//                       fontWeight: FontWeight.bold,
//                     ),
//                     textAlign: TextAlign.center,
//                   ),
//                 ),
//               ),
//           ],
//         ),
//         const SizedBox(width: 8),
//         Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: const [
//             Icon(Icons.person_outline, color: Colors.white),
//             Text(
//               "Tài khoản",
//               style: TextStyle(fontSize: 8, color: Colors.white),
//             ),
//           ],
//         ),
//         const SizedBox(width: 12),
//       ],
//     );
//   }

//   // ===== TIÊU ĐỀ BỘ LỌC =====
//   Widget _buildFilterTitle(String title) {
//     return Text(
//       title,
//       style: TextStyle(
//         fontSize: 13,
//         fontWeight: FontWeight.bold,
//         color: darkTextColor,
//       ),
//     );
//   }

//   // ===== BỘ LỌC CÓ THỂ MỞ RỘNG =====
//   Widget _buildExpandableFilter(String title, Widget content) {
//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         Row(
//           mainAxisAlignment: MainAxisAlignment.spaceBetween,
//           children: [
//             Text(
//               title,
//               style: const TextStyle(
//                 fontSize: 12,
//                 fontWeight: FontWeight.w600,
//                 color: Colors.black87,
//               ),
//             ),
//             Icon(Icons.keyboard_arrow_down, size: 18, color: Colors.grey[600]),
//           ],
//         ),
//         const SizedBox(height: 12),
//         content,
//       ],
//     );
//   }

//   // ===== BỘ LỌC DANH MỤC CHÍNH =====
//   Widget _buildMainCategoryFilter() {
//     return Column(
//       children: mainCategories.map((category) {
//         bool isSelected = selectedMainCategory == category;
//         return GestureDetector(
//           onTap: () {
//             setState(() {
//               selectedMainCategory = category;
//             });
//           },
//           child: Container(
//             margin: const EdgeInsets.only(bottom: 4),
//             padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 0),
//             child: Row(
//               mainAxisAlignment: MainAxisAlignment.spaceBetween,
//               children: [
//                 Expanded(
//                   child: Text(
//                     category,
//                     style: TextStyle(
//                       color: isSelected ? primaryColor : Colors.black87,
//                       fontWeight: isSelected
//                           ? FontWeight.w600
//                           : FontWeight.normal,
//                       fontSize: 12,
//                     ),
//                   ),
//                 ),
//                 if (isSelected)
//                   Icon(Icons.arrow_forward_ios, color: primaryColor, size: 12),
//               ],
//             ),
//           ),
//         );
//       }).toList(),
//     );
//   }

//   // ===== BỘ LỌC DANH MỤC CON =====
//   Widget _buildSubCategoryFilter() {
//     return Column(
//       children: subCategories.map((sub) {
//         bool isSelected = selectedSubCategories.contains(sub);
//         return CheckboxListTile(
//           dense: true,
//           contentPadding: EdgeInsets.zero,
//           visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
//           title: Text(sub, style: const TextStyle(fontSize: 12)),
//           value: isSelected,
//           activeColor: primaryColor,
//           controlAffinity: ListTileControlAffinity.leading,
//           onChanged: (bool? value) {
//             setState(() {
//               if (value == true) {
//                 selectedSubCategories.add(sub);
//               } else {
//                 selectedSubCategories.remove(sub);
//               }
//             });
//           },
//         );
//       }).toList(),
//     );
//   }

//   // ===== BỘ LỌC GIÁ =====
//   Widget _buildPriceFilter() {
//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         Row(
//           children: [
//             Expanded(
//               child: TextField(
//                 keyboardType: TextInputType.number,
//                 decoration: InputDecoration(
//                   hintText: "0",
//                   hintStyle: TextStyle(fontSize: 11, color: Colors.grey[400]),
//                   border: OutlineInputBorder(
//                     borderSide: BorderSide(color: Colors.grey.shade300),
//                   ),
//                   contentPadding: const EdgeInsets.symmetric(
//                     horizontal: 8,
//                     vertical: 8,
//                   ),
//                 ),
//                 style: const TextStyle(fontSize: 11),
//               ),
//             ),
//             const Padding(
//               padding: EdgeInsets.symmetric(horizontal: 8),
//               child: Text("-", style: TextStyle(fontSize: 14)),
//             ),
//             Expanded(
//               child: TextField(
//                 keyboardType: TextInputType.number,
//                 decoration: InputDecoration(
//                   hintText: "10000000",
//                   hintStyle: TextStyle(fontSize: 11, color: Colors.grey[400]),
//                   border: OutlineInputBorder(
//                     borderSide: BorderSide(color: Colors.grey.shade300),
//                   ),
//                   contentPadding: const EdgeInsets.symmetric(
//                     horizontal: 8,
//                     vertical: 8,
//                   ),
//                 ),
//                 style: const TextStyle(fontSize: 11),
//               ),
//             ),
//           ],
//         ),
//         const SizedBox(height: 8),
//         SizedBox(
//           width: double.infinity,
//           child: ElevatedButton(
//             onPressed: () {
//               // TODO: Áp dụng bộ lọc giá
//             },
//             style: ElevatedButton.styleFrom(
//               backgroundColor: primaryColor,
//               padding: const EdgeInsets.symmetric(vertical: 8),
//               shape: RoundedRectangleBorder(
//                 borderRadius: BorderRadius.circular(2),
//               ),
//             ),
//             child: const Text(
//               "ÁP DỤNG",
//               style: TextStyle(
//                 color: Colors.white,
//                 fontSize: 12,
//                 fontWeight: FontWeight.bold,
//               ),
//             ),
//           ),
//         ),
//       ],
//     );
//   }

//   // ===== BỘ LỌC THƯƠNG HIỆU =====
//   Widget _buildBrandFilter() {
//     return Column(
//       children: brands.map((brand) {
//         bool isSelected = selectedBrands.contains(brand);
//         return CheckboxListTile(
//           dense: true,
//           contentPadding: EdgeInsets.zero,
//           visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
//           title: Text(brand, style: const TextStyle(fontSize: 12)),
//           value: isSelected,
//           activeColor: primaryColor,
//           controlAffinity: ListTileControlAffinity.leading,
//           onChanged: (bool? value) {
//             setState(() {
//               if (value == true) {
//                 selectedBrands.add(brand);
//               } else {
//                 selectedBrands.remove(brand);
//               }
//             });
//           },
//         );
//       }).toList(),
//     );
//   }

//   // ===== BỘ LỌC MÀU SẮC =====
//   Widget _buildColorFilter() {
//     return Wrap(
//       spacing: 6,
//       runSpacing: 6,
//       children: colors.map((colorData) {
//         bool isSelected = selectedColors.contains(colorData["name"]);
//         return GestureDetector(
//           onTap: () {
//             setState(() {
//               if (isSelected) {
//                 selectedColors.remove(colorData["name"]);
//               } else {
//                 selectedColors.add(colorData["name"]);
//               }
//             });
//           },
//           child: Container(
//             width: 28,
//             height: 28,
//             decoration: BoxDecoration(
//               color: colorData["color"],
//               shape: BoxShape.circle,
//               border: Border.all(
//                 color: isSelected ? primaryColor : Colors.grey.shade400,
//                 width: isSelected ? 2.5 : 1,
//               ),
//             ),
//           ),
//         );
//       }).toList(),
//     );
//   }

//   // ===== BỘ LỌC KÍCH CỠ =====
//   Widget _buildSizeFilter() {
//     return Wrap(
//       spacing: 6,
//       runSpacing: 6,
//       children: sizes.map((size) {
//         bool isSelected = selectedSizes.contains(size);
//         return GestureDetector(
//           onTap: () {
//             setState(() {
//               if (isSelected) {
//                 selectedSizes.remove(size);
//               } else {
//                 selectedSizes.add(size);
//               }
//             });
//           },
//           child: Container(
//             width: 36,
//             height: 36,
//             decoration: BoxDecoration(
//               color: isSelected ? primaryColor : Colors.white,
//               border: Border.all(
//                 color: isSelected ? primaryColor : Colors.grey.shade300,
//               ),
//             ),
//             child: Center(
//               child: Text(
//                 size.toString(),
//                 style: TextStyle(
//                   color: isSelected ? Colors.white : Colors.black87,
//                   fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
//                   fontSize: 11,
//                 ),
//               ),
//             ),
//           ),
//         );
//       }).toList(),
//     );
//   }

//   // ===== LƯỚI SẢN PHẨM =====
//   Widget _buildProductGrid(List<Product> products) {
//     return GridView.builder(
//       shrinkWrap: true,
//       physics: const NeverScrollableScrollPhysics(),
//       gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
//         crossAxisCount: 5,
//         childAspectRatio: 0.68,
//         crossAxisSpacing: 12,
//         mainAxisSpacing: 16,
//       ),
//       itemCount: products.length,
//       itemBuilder: (context, index) {
//         final product = products[index];
//         return _buildProductCard(product);
//       },
//     );
//   }

//   // ===== CARD SẢN PHẨM =====
//   Widget _buildProductCard(Product product) {
//     final int oldPrice = (product.price * 1.2).toInt();
//     // ignore: unused_local_variable
//     bool isFavorite = widget.favoriteList.contains(product);

//     return GestureDetector(
//       onTap: () {
//         Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (context) => ProductDetailPage(
//               product: product,
//               cartList: widget.cartList,
//               favoriteList: widget.favoriteList,
//               refresh: widget.refresh,
//             ),
//           ),
//         );
//       },
//       child: Container(
//         decoration: BoxDecoration(
//           color: Colors.white,
//           border: Border.all(color: Colors.grey.shade200),
//         ),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             // Hình ảnh sản phẩm
//             Expanded(
//               child: Stack(
//                 children: [
//                   Container(
//                     width: double.infinity,
//                     color: lightGreyColor,
//                     child: Image.asset(
//                       product.image,
//                       fit: BoxFit.contain,
//                       errorBuilder: (context, error, stackTrace) =>
//                           const Center(
//                             child: Icon(Icons.image_not_supported, size: 40),
//                           ),
//                     ),
//                   ),
//                   // Badge giảm giá
//                   if (oldPrice > product.price)
//                     Positioned(
//                       top: 8,
//                       left: 8,
//                       child: Container(
//                         padding: const EdgeInsets.symmetric(
//                           horizontal: 6,
//                           vertical: 3,
//                         ),
//                         decoration: BoxDecoration(
//                           color: primaryColor,
//                           borderRadius: BorderRadius.circular(2),
//                         ),
//                         child: const Text(
//                           "-20%",
//                           style: TextStyle(
//                             color: Colors.white,
//                             fontSize: 10,
//                             fontWeight: FontWeight.bold,
//                           ),
//                         ),
//                       ),
//                     ),
//                 ],
//               ),
//             ),
//             // Thông tin sản phẩm
//             Padding(
//               padding: const EdgeInsets.all(8.0),
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(
//                     product.category,
//                     style: TextStyle(fontSize: 10, color: Colors.grey[600]),
//                   ),
//                   const SizedBox(height: 3),
//                   Text(
//                     product.name,
//                     maxLines: 1,
//                     overflow: TextOverflow.ellipsis,
//                     style: const TextStyle(
//                       fontSize: 12,
//                       fontWeight: FontWeight.w500,
//                       color: Colors.black87,
//                     ),
//                   ),
//                   const SizedBox(height: 6),
//                   Text(
//                     formatCurrency(product.price),
//                     style: TextStyle(
//                       fontSize: 13,
//                       fontWeight: FontWeight.bold,
//                       color: primaryColor,
//                     ),
//                   ),
//                   if (oldPrice > product.price) ...[
//                     const SizedBox(height: 2),
//                     Text(
//                       formatCurrency(oldPrice),
//                       style: TextStyle(
//                         fontSize: 11,
//                         color: Colors.grey[500],
//                         decoration: TextDecoration.lineThrough,
//                       ),
//                     ),
//                   ],
//                 ],
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   // ===== TRẠNG THÁI RỖNG =====
//   Widget _buildEmptyState() {
//     return Center(
//       child: Padding(
//         padding: const EdgeInsets.all(48.0),
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Icon(Icons.inbox_outlined, size: 80, color: Colors.grey.shade400),
//             const SizedBox(height: 16),
//             Text(
//               "Chưa có sản phẩm nào",
//               style: TextStyle(
//                 fontSize: 18,
//                 fontWeight: FontWeight.bold,
//                 color: darkTextColor,
//               ),
//             ),
//             const SizedBox(height: 8),
//             Text(
//               "Vui lòng thử lại sau hoặc điều chỉnh bộ lọc",
//               style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
