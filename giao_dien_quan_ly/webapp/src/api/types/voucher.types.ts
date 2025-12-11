import { SimpleUserResponse } from "./auth.types"; // Hoặc file chứa SimpleUserResponse

// Enum khớp với Backend
export enum VoucherType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT"
}

export enum VoucherStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  INACTIVE = "INACTIVE"
}

// Response từ Backend
export interface VoucherResponse {
  id: number;
  name: string;
  voucherCode: string;
  type: string; // PUBLIC / PRIVATE
  status: VoucherStatus;
  discountValue: number;
  discountType: VoucherType; // Lưu ý: Backend DTO response có thể thiếu field này hoặc đặt tên khác, nhưng trong request có. Tôi giả định Response cũng trả về để hiển thị.
  // *Check lại DTO Response của bạn*: Trong code Java bạn gửi, VoucherResponse không có field discountType, nhưng logic frontend cần nó. 
  // Nếu backend chưa trả về, bạn cần bảo backend thêm vào. Tạm thời tôi sẽ dùng logic suy luận hoặc giả định backend đã update.
  // Dựa vào Request có "type" (Enum VoucherType) -> nhưng VoucherResponse lại có field "type" (Enum Scope?) và "discountType" (Enum logic?).
  // Dựa vào code Java: VoucherRequest có "type" là VoucherType (PERCENTAGE/FIXED).
  // VoucherResponse có "type" (VoucherType).
  
  minApplicablePrice: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

// Request gửi lên Backend
export interface VoucherRequest {
  name: string;
  voucherCode: string;
  type: VoucherType; // PERCENTAGE / FIXED_AMOUNT
  status: VoucherStatus;
  discountValue: number;
  minApplicablePrice: number;
  maxDiscountAmount: number;
  startDate: string; // ISO String
  endDate: string;   // ISO String
}