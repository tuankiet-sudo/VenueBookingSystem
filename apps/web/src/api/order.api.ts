import customAxios from '@/utils/custom-axios';

// Order DTOs
export interface Order {
  order_id: string;
  client_id: string;
  venue_loc_id: string;
  venueName: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  startHour: string;
  endHour: string;
  points: number;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
  // Extended fields
  locationName?: string;
  locationAddress?: string;
  venueImage?: string;
  amenities?: OrderAmenity[];
  discounts?: OrderDiscount[];
  // Client info
  clientFirstName?: string;
  clientLastName?: string;
  clientPhoneNo?: string;
  clientBankAccount?: string;
  // Payment info
  paidAt?: string;
  // Venue details
  venueFloor?: string;
}

export interface OrderAmenity {
  amenity_id: string;
  category: string;
  price: number;
}

export interface OrderDiscount {
  discount_id: string;
  name: string;
  percentage: number;
  discountAmount: number;
}

export interface OrderFilters {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
}

export interface OwnerOrderFilters {
  locationId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderDto {
  startHour?: string;
  endHour?: string;
}

export interface AmenityData {
  amenity_name: string;
  category: string;
  description: string;
  price: string; // "500000.00" comes as a string to preserve decimal precision
}

export interface DiscountData {
  discount_id: string;
  name: string;
  percentage: number;
  maxDiscountPrice: string | null;
  minPrice: string | null;
  expiredAt: string; // ISO Date string
}

export interface GetOrderMetadataResponse {
  discounts: DiscountData[];
  amenities: AmenityData[];
}

// Order API functions
export const orderApi = {
  /**
   * Get owner's orders
   */
  getOwnerOrders: async (filters?: OwnerOrderFilters): Promise<Order[]> => {
    const response = await customAxios.get<Order[]>('/order/owner', {
      params: filters
        ? {
            locationId: filters.locationId,
            orderStatus: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
          }
        : undefined,
    });
    return response.data;
  },

  /**
   * Get user's orders
   */
  getMyOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const response = await customAxios.get<Order[]>('/orders/me', {
      params: filters,
    });
    return response.data;
  },

  completePayment: async (orderId: string, invoiceId: string) => {
    await customAxios.patch('/payment/webhook', {
      orderId,
      invoiceId,
    });
  },

  cancelOrder: async (orderId: string, invoiceId: string) => {
    await customAxios.patch('/order/cancelled', {
      orderId,
      invoiceId,
    });
  },

  /**
   * Get order detail
   */
  getOrderDetail: async (orderId: string): Promise<Order> => {
    const response = await customAxios.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order
   */
  updateOrder: async (
    orderId: string,
    data: UpdateOrderDto,
  ): Promise<Order> => {
    const response = await customAxios.patch<Order>(`/orders/${orderId}`, data);
    return response.data;
  },

  getOrderMetadata: async (
    locationId: string,
    venueName: string,
    startTime: string,
    endTime: string,
  ): Promise<GetOrderMetadataResponse> => {
    const response = await customAxios.get<GetOrderMetadataResponse>(
      `/order/metadata?locationId=${locationId}&venueName=${venueName}&startTime=${startTime}&endTime=${endTime}`,
    );
    return response.data;
  },
};
