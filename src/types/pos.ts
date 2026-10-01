export type TableStatus = 'available' | 'occupied' | 'reserved';

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled';

export type MenuItemCategory =
  | 'Mo:Mo'
  | 'Noodles'
  | 'Khaja & Snacks'
  | 'Light Snacks'
  | 'Nepali Khana'
  | 'Rice & Biryani'
  | 'Hard Drinks & Beer'
  | 'Cigarettes'
  | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuItemCategory;
  price: number;
  isAvailable: boolean;
  stockQuantity: number;
  lowStockThreshold?: number;
  description?: string;
  spicyLevel?: 0 | 1 | 2 | 3;
  isVeg?: boolean;
  image?: string;
}

export interface TableModel {
  tableNumber: number;
  seatingCapacity: number;
  status: TableStatus;
  currentOrderId?: string;
  activeGuests?: number;
  occupiedSince?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface OrderModel {
  orderId: string;
  tableNumber: number;
  itemsList: OrderItem[];
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountPercent?: number;
  discountAmount?: number;
  status: OrderStatus;
  timestamp: string;
  createdAtMs?: number;
  kitchenNote?: string;
  serverName?: string;
  paymentMethod?: 'Cash' | 'Fonepay (Mobile Banking)' | 'eSewa QR' | 'Khalti QR' | 'Card / POS';
  transactionRef?: string;
  isKotPrinted?: boolean;
  settledAt?: string;
}

export type RoomStatus = 'available' | 'occupied' | 'reserved';
export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Family Villa';

export interface RoomOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface RoomModel {
  id: string;
  roomNumber: string;
  roomType: RoomType;
  pricePerNight: number;
  status: RoomStatus;
  guestName?: string;
  phone?: string;
  idCardType?: string;
  idCardNumber?: string;
  idCardPhotoUrl?: string;
  checkInDate?: string;
  nights?: number;
  discountPercent?: number;
  imageUrl?: string;
  notes?: string;
  orderedItems?: RoomOrderItem[];
}

export interface ExtraChargeItem {
  id: string;
  title: string;
  amount: number;
}

export interface HotelCheckoutSummary {
  id: string;
  invoiceNumber: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  guestName: string;
  phone?: string;
  idCardType?: string;
  idCardNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  checkOutTime: string;
  nights: number;
  pricePerNight: number;
  roomRentGross: number;
  roomDiscountPercent: number;
  roomDiscountAmount: number;
  roomRentNet: number;
  foodOrders: RoomOrderItem[];
  foodOrdersTotal: number;
  extraCharges: ExtraChargeItem[];
  extraChargesTotal: number;
  subtotal: number;
  isVatEnabled: boolean;
  vatAmount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'eSewa' | 'Fonepay' | 'Card' | 'Credit / Khata';
  amountReceived: number;
  changeDue: number;
  transactionRef?: string;
  cashierName: string;
  notes?: string;
  settledAt: string;
}

export interface SupplierPurchaseModel {
  id: string;
  supplierName: string;
  category: string;
  itemsDescription: string;
  totalAmount: number;
  paidAmount: number;
  date: string;
  accountantName: string;
}

export interface ExpenseModel {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  recordedBy: string;
}

export interface DayCloseReport {
  reportId: string;
  date: string;
  openedAt: string;
  closedAt?: string;
  isClosed: boolean;
  totalOrdersCount: number;
  paidOrdersCount: number;
  grossSales: number;
  totalDiscounts: number;
  totalTaxVat: number;
  netSales: number;
  paymentBreakdown: {
    cash: number;
    fonepay: number;
    esewa: number;
    khalti: number;
    card: number;
  };
  settledBy: string;
}

export type SubscriptionPlanType = 'trial' | '1_year' | '3_years' | '5_years' | 'lifetime';

export interface SubscriptionPlan {
  id: SubscriptionPlanType;
  name: string;
  nameNepali: string;
  duration: string;
  priceNpr: number;
  discountText?: string;
  isPopular?: boolean;
  features: string[];
}

export interface SubscriptionInfo {
  planType: SubscriptionPlanType;
  planName: string;
  status: 'active' | 'expired';
  trialStartDate: string;
  trialDaysTotal: number;
  remainingTrialDays: number;
  expiryDate?: string;
  isLifetime: boolean;
  priceNpr?: number;
  licenseKey?: string;
  paymentMethod?: string;
  transactionRef?: string;
  paymentProofUrl?: string;
  activatedAt?: string;
}
