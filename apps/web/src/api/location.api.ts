import customAxios from '@/utils/custom-axios';

// Location DTOs
export interface Location {
  location_id: string;
  owner_id: string;
  name: string;
  description: string;
  addrNo: string;
  ward: string;
  city: string;
  avgRating: number;
  policy: string;
  phoneNo: string;
  mapURL: string;
  thumbnailURL: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationResponse {
  location_id: string;
  name: string;
  addrNo: string;
  description: string;
  ward: string;
  city: string;
  avgRating: string;
  thumbnailURL: string;
  isActive: number;
}

export interface CreateLocationDto {
  name: string;
  description?: string;
  addrNo: string;
  ward: string;
  city: string;
  policy?: string;
  phoneNo?: string;
  mapURL: string;
  thumbnailURL: string;
}

export interface UpdateLocationStatusDto {
  isActive: boolean;
}

export interface UpdateLocationDto {
  name?: string;
  description?: string;
  addrNo?: string;
  ward?: string;
  city?: string;
  policy?: string;
  phoneNo?: string;
  mapURL?: string;
  thumbnailURL?: string;
  isActive?: boolean;
}

export interface LocationDetailResponse {
  name: string;
  description?: string;
  addrNo: string;
  ward: string;
  city: string;
  avgRating: string;
  policy?: string;
  phoneNo: string;
  mapURL: string;
  thumbnailURL: string;
}

export interface LocationDetail extends Location {
  venues: Venue[];
  reviews: Review[];
  isFavorite: boolean;
}

export interface Venue {
  location_id: string;
  name: string;
  venueType_id: string;
  venueTypeName?: string;
  floor: string;
  area: number;
  pricePerHour: number;
  isActive: boolean;
  images: VenueImage[];
}

export interface VenueListResponse {
  venueName: string;
  venueFloor: string;
  venueArea: number;
  venuePricePerHour: number;
  venueIsActive: boolean;
  venueTypeName: string;
  venueCapacity: number;
  venueImageURLs: string[];
}

export interface VenueImage {
  image_id: string;
  location_id: string;
  venueName: string;
  locationImgURL: string;
}

export interface Review {
  client_id: string;
  clientName: string;
  clientAvatar?: string;
  location_id: string;
  stars: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  city?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  venueType?: string;
  minCapacity?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
}

// Location API functions
export const locationApi = {
  /**
   * Get list of locations belonging to the owner
   */
  getOwnerLocations: async (): Promise<LocationResponse[]> => {
    const response =
      await customAxios.get<LocationResponse[]>('/location/owner');
    return response.data;
  },

  /**
   * Create a new location
   */
  createLocation: async (data: CreateLocationDto): Promise<Location> => {
    const response = await customAxios.post<Location>('/location', data);
    return response.data;
  },

  /**
   * Update location active status
   */
  updateLocationStatus: async (
    locationId: string,
    isActive: boolean,
  ): Promise<Location> => {
    const response = await customAxios.patch<Location>(
      `/location/${locationId}`,
      {
        isActive,
      },
    );
    return response.data;
  },

  /**
   * Get location details by ID
   */
  getLocationDetailsById: async (
    locationId: string,
  ): Promise<LocationDetailResponse> => {
    const response = await customAxios.get<LocationDetailResponse>(
      `/location/${locationId}/details`,
    );
    return response.data;
  },

  favorLocation: async (locationId: string): Promise<void> => {
    await customAxios.post(`/location/${locationId}/favors`);
  },

  unfavorLocation: async (locationId: string): Promise<void> => {
    await customAxios.delete(`/location/${locationId}/favors`);
  },

  /**
   * Update location details
   */
  updateLocation: async (
    locationId: string,
    data: UpdateLocationDto,
  ): Promise<Location> => {
    const response = await customAxios.patch<Location>(
      `/location/${locationId}`,
      data,
    );
    return response.data;
  },

  /**
   * Get location detail by ID
   */
  getLocationDetail: async (locationId: string): Promise<LocationDetail> => {
    const response = await customAxios.get<LocationDetail>(
      `/locations/${locationId}`,
    );
    return response.data;
  },

  /**
   * Search locations with filters
   */
  searchLocations: async (filters: SearchFilters): Promise<Location[]> => {
    const response = await customAxios.get<Location[]>('/locations/search', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get all locations (for browse)
   */
  getAllLocations: async (): Promise<Location[]> => {
    const response = await customAxios.get<Location[]>('/locations');
    return response.data;
  },

  /**
   * Get location reviews
   */
  getLocationReviews: async (locationId: string): Promise<Review[]> => {
    const response = await customAxios.get<Review[]>(
      `/locations/${locationId}/reviews`,
    );
    return response.data;
  },

  /**
   * Get venues in a location
   */
  getVenuesByLocation: async (
    locationId: string,
  ): Promise<VenueListResponse[]> => {
    const response = await customAxios.get<VenueListResponse[]>(
      `/location/${locationId}/venues`,
    );
    return response.data;
  },
};
