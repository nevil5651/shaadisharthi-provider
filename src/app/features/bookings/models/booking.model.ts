export interface Booking {
  bookingId: number;
  customerName: string;
  serviceName: string;
  eventStartDate: string; // "2026-11-11 11:01:00.0"
  totalAmount: number;
  phone: string;
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
}