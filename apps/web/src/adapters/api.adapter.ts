// API Adapter Layer - Maps frontend types to backend DTOs

import type {
  SearchLocationsDto,
  CreateOrderDto,
  LocationSearchResultDto,
} from '@/generated/requests/types.gen';
import type { BookingFormData } from '@/types/venue.types';

/**
 * Maps frontend search filters to backend SearchLocationsDto
 * Combines date + time into full ISO 8601 datetime strings
 */
export function mapSearchFiltersToDto(
  filters: any,
  checkInDate?: Date | null,
): SearchLocationsDto {
  // Construct full datetime strings from date + time
  // Backend expects: '2025-12-08T09:00:00' format
  let startTimeISO: string | undefined;
  let endTimeISO: string | undefined;

  if (checkInDate && filters.startTime) {
    const date = new Date(checkInDate);
    const [hours, minutes] = filters.startTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    startTimeISO = date.toISOString().slice(0, 19); // '2025-12-08T09:00:00'
  }

  if (checkInDate && filters.endTime) {
    const date = new Date(checkInDate);
    const [hours, minutes] = filters.endTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    endTimeISO = date.toISOString().slice(0, 19); // '2025-12-08T17:00:00'
  }

  const dto: SearchLocationsDto = {
    city: filters.city || '',
    startTime: startTimeISO, // Full ISO datetime
    endTime: endTimeISO, // Full ISO datetime
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minAvgRating: filters.minAvgRating,
    theme: filters.theme,
    size: filters.size,
    amenityCategory: filters.amenityCategory,
    sort: filters.sort || 'PRICE_ASC',
  };

  return dto;
}

/**
 * Maps frontend booking form data to backend CreateOrderDto
 */
export function mapBookingToOrderDto(
  booking: BookingFormData,
  clientId: string,
): CreateOrderDto {
  const dto: CreateOrderDto = {
    clientId,
    locationId: booking.venue.location_id,
    venueName: booking.venue.name,
    startTime: booking.startHour.toISOString(),
    endTime: booking.endHour.toISOString(),
    amenityNames: booking.selectedAmenities.map((a) => a.amenity_name),
  };

  return dto;
}

/**
 * Maps capacity to size category for backend
 */
export function mapCapacityToSize(capacity: number): string | undefined {
  if (capacity <= 12) return 'Small';
  if (capacity <= 50) return 'Medium';
  if (capacity > 50) return 'Large';
  return undefined;
}

/**
 * Converts Date to time string (HH:mm format)
 */
export function dateToTimeString(date: Date): string {
  const result = date.toTimeString().slice(0, 5);
  return result;
}

/**
 * Converts time string to Date (today's date with specified time)
 */
export function timeStringToDate(timeStr: string): Date {
  const [h = 0, m = 0] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}
/**
 * Maps backend search result DTO to frontend VenueWithDetails
 */
export function mapSearchResultToVenue(
  dto: LocationSearchResultDto,
): import('@/types/venue.types').VenueWithDetails {
  return {
    location_id: dto.location_id,
    name: dto.venue_name,
    venueType_id: dto.venueType_id,
    floor: dto.floor,
    pricePerHour: parseFloat(dto.pricePerHour),
    isActive: true,
    createdAt: new Date(), // Mock
    updatedAt: new Date(), // Mock

    // Location details
    location: {
      location_id: dto.location_id,
      owner_id: '', // Not returned by search
      name: dto.location_name,
      addrNo: dto.addrNo,
      ward: dto.ward,
      city: dto.city,
      avgRating: parseFloat(dto.avgRating),
      phoneNo: dto.location_phone,
      mapURL: dto.mapURL,
      thumbnailURL: dto.thumbnailURL,
      isActive: true,
      createdAt: new Date(), // Mock
      updatedAt: new Date(), // Mock
    },

    // Venue Type details
    venueType: {
      venueType_id: dto.venueType_id,
      name: dto.theme_name,
      minCapacity: dto.minCapacity,
      maxCapacity: dto.maxCapacity,
      area: parseFloat(dto.area),
      createdAt: new Date(), // Mock
      updatedAt: new Date(), // Mock
    },

    // Map image_urls from API response
    images: dto.image_urls.map((url, index) => ({
      image_id: `${dto.location_id}-${index}`,
      location_id: dto.location_id,
      venueName: dto.venue_name,
      locationImgURL: url,
    })),
    amenities: [], // Search result doesn't return amenities list yet
    avgRating: parseFloat(dto.avgRating),
    reviewCount: 0,
    isFavorite: dto.is_favor === 1,
  };
}
