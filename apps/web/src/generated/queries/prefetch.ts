// generated with @7nohe/openapi-react-query-codegen@1.4.1

import { type QueryClient } from '@tanstack/react-query';
import {
  AmenitiesService,
  AppService,
  LocationsService,
  OrdersService,
  UsersService,
  VenuesService,
} from '../requests/services.gen';
import type { UpdateVenueDto } from '../requests/types.gen';
import * as Common from './common';
/**
 * @returns string
 * @throws ApiError
 */
export const prefetchUseAppServiceAppControllerGetHello = (
  queryClient: QueryClient,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseAppServiceAppControllerGetHelloKeyFn(),
    queryFn: () => AppService.appControllerGetHello(),
  });
/**
 * Get current user profile
 * @returns UserProfileDto User profile retrieved successfully
 * @throws ApiError
 */
export const prefetchUseUsersServiceUserControllerGetProfile = (
  queryClient: QueryClient,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseUsersServiceUserControllerGetProfileKeyFn(),
    queryFn: () => UsersService.userControllerGetProfile(),
  });
/**
 * @returns unknown
 * @throws ApiError
 */
export const prefetchUseVenuesServiceVenueControllerGetVenueTypes = (
  queryClient: QueryClient,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseVenuesServiceVenueControllerGetVenueTypesKeyFn(),
    queryFn: () => VenuesService.venueControllerGetVenueTypes(),
  });
/**
 * Preview venue details
 * @param data The data for the request.
 * @param data.locationId
 * @param data.name
 * @returns VenuePreviewResponseDto Venue preview retrieved successfully
 * @throws ApiError
 */
export const prefetchUseVenuesServiceVenueControllerPreviewVenue = (
  queryClient: QueryClient,
  {
    locationId,
    name,
  }: {
    locationId: string;
    name: string;
  },
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseVenuesServiceVenueControllerPreviewVenueKeyFn({
      locationId,
      name,
    }),
    queryFn: () =>
      VenuesService.venueControllerPreviewVenue({ locationId, name }),
  });
/**
 * Update venue details
 * @param data The data for the request.
 * @param data.locationId
 * @param data.name
 * @param data.requestBody
 * @returns unknown Venue updated successfully
 * @throws ApiError
 */
export const prefetchUseVenuesServiceVenueControllerUpdateVenue = (
  queryClient: QueryClient,
  {
    locationId,
    name,
    requestBody,
  }: {
    locationId: string;
    name: string;
    requestBody: UpdateVenueDto;
  },
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseVenuesServiceVenueControllerUpdateVenueKeyFn({
      locationId,
      name,
      requestBody,
    }),
    queryFn: () =>
      VenuesService.venueControllerUpdateVenue({
        locationId,
        name,
        requestBody,
      }),
  });
/**
 * Get all ratings for a location
 * @param data The data for the request.
 * @param data.locationId
 * @returns LocationRatingsDto Ratings retrieved successfully
 * @throws ApiError
 */
export const prefetchUseVenuesServiceVenueControllerGetLocationRatings = (
  queryClient: QueryClient,
  {
    locationId,
  }: {
    locationId: string;
  },
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseVenuesServiceVenueControllerGetLocationRatingsKeyFn({
      locationId,
    }),
    queryFn: () =>
      VenuesService.venueControllerGetLocationRatings({ locationId }),
  });
/**
 * Get all ratings by current user
 * @returns RateResponseDto User ratings retrieved successfully
 * @throws ApiError
 */
export const prefetchUseVenuesServiceVenueControllerGetClientRates = (
  queryClient: QueryClient,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseVenuesServiceVenueControllerGetClientRatesKeyFn(),
    queryFn: () => VenuesService.venueControllerGetClientRates(),
  });
/**
 * Get all favorited locations by current user
 * @returns FavorResponseDto User favorites retrieved successfully
 * @throws ApiError
 */
export const prefetchUseVenuesServiceVenueControllerGetClientFavors = (
  queryClient: QueryClient,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseVenuesServiceVenueControllerGetClientFavorsKeyFn(),
    queryFn: () => VenuesService.venueControllerGetClientFavors(),
  });
/**
 * Get all active locations (public)
 * @returns LocationListItemDto Locations retrieved successfully
 * @throws ApiError
 */
export const prefetchUseLocationsServiceLocationControllerGetAllLocations = (
  queryClient: QueryClient,
) =>
  queryClient.prefetchQuery({
    queryKey:
      Common.UseLocationsServiceLocationControllerGetAllLocationsKeyFn(),
    queryFn: () => LocationsService.locationControllerGetAllLocations(),
  });
/**
 * Get all locations owned by current user
 * @returns unknown Locations retrieved successfully
 * @throws ApiError
 */
export const prefetchUseLocationsServiceLocationControllerGetLocationsOfOwner =
  (queryClient: QueryClient) =>
    queryClient.prefetchQuery({
      queryKey:
        Common.UseLocationsServiceLocationControllerGetLocationsOfOwnerKeyFn(),
      queryFn: () => LocationsService.locationControllerGetLocationsOfOwner(),
    });
/**
 * Get complete location details by ID (public)
 * @param data The data for the request.
 * @param data.id
 * @returns LocationDetailsResponseDto Location details retrieved successfully
 * @throws ApiError
 */
export const prefetchUseLocationsServiceLocationControllerGetLocationDetails = (
  queryClient: QueryClient,
  {
    id,
  }: {
    id: string;
  },
) =>
  queryClient.prefetchQuery({
    queryKey:
      Common.UseLocationsServiceLocationControllerGetLocationDetailsKeyFn({
        id,
      }),
    queryFn: () =>
      LocationsService.locationControllerGetLocationDetails({ id }),
  });
/**
 * @param data The data for the request.
 * @param data.id
 * @returns unknown
 * @throws ApiError
 */
export const prefetchUseLocationsServiceLocationControllerPreviewLocation = (
  queryClient: QueryClient,
  {
    id,
  }: {
    id: string;
  },
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseLocationsServiceLocationControllerPreviewLocationKeyFn({
      id,
    }),
    queryFn: () => LocationsService.locationControllerPreviewLocation({ id }),
  });
/**
 * @param data The data for the request.
 * @param data.id
 * @returns unknown
 * @throws ApiError
 */
export const prefetchUseLocationsServiceLocationControllerGetVenuesAtLocation =
  (
    queryClient: QueryClient,
    {
      id,
    }: {
      id: string;
    },
  ) =>
    queryClient.prefetchQuery({
      queryKey:
        Common.UseLocationsServiceLocationControllerGetVenuesAtLocationKeyFn({
          id,
        }),
      queryFn: () =>
        LocationsService.locationControllerGetVenuesAtLocation({ id }),
    });
/**
 * Get amenities by location ID
 * @param data The data for the request.
 * @param data.locationId
 * @returns unknown Amenities retrieved successfully
 * @throws ApiError
 */
export const prefetchUseAmenitiesServiceAmenityControllerGetByLocation = (
  queryClient: QueryClient,
  {
    locationId,
  }: {
    locationId: string;
  },
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseAmenitiesServiceAmenityControllerGetByLocationKeyFn({
      locationId,
    }),
    queryFn: () =>
      AmenitiesService.amenityControllerGetByLocation({ locationId }),
  });
/**
 * Get amenity by location ID and name
 * @param data The data for the request.
 * @param data.locationId
 * @param data.name
 * @returns unknown Amenity retrieved successfully
 * @throws ApiError
 */
export const prefetchUseAmenitiesServiceAmenityControllerGetByLocationAndName =
  (
    queryClient: QueryClient,
    {
      locationId,
      name,
    }: {
      locationId: string;
      name: string;
    },
  ) =>
    queryClient.prefetchQuery({
      queryKey:
        Common.UseAmenitiesServiceAmenityControllerGetByLocationAndNameKeyFn({
          locationId,
          name,
        }),
      queryFn: () =>
        AmenitiesService.amenityControllerGetByLocationAndName({
          locationId,
          name,
        }),
    });
/**
 * @returns string
 * @throws ApiError
 */
export const prefetchUseOrdersServiceOrderControllerGetUncompletedOrders = (
  queryClient: QueryClient,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseOrdersServiceOrderControllerGetUncompletedOrdersKeyFn(),
    queryFn: () => OrdersService.orderControllerGetUncompletedOrders(),
  });
/**
 * Get available amenities and discounts for booking
 * @param data The data for the request.
 * @param data.locationId
 * @param data.venueName
 * @param data.startTime
 * @param data.endTime
 * @returns unknown Metadata retrieved successfully
 * @throws ApiError
 */
export const prefetchUseOrdersServiceOrderControllerGetDiscountsByVenue = (
  queryClient: QueryClient,
  {
    endTime,
    locationId,
    startTime,
    venueName,
  }: {
    endTime: string;
    locationId: string;
    startTime: string;
    venueName: string;
  },
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseOrdersServiceOrderControllerGetDiscountsByVenueKeyFn({
      endTime,
      locationId,
      startTime,
      venueName,
    }),
    queryFn: () =>
      OrdersService.orderControllerGetDiscountsByVenue({
        endTime,
        locationId,
        startTime,
        venueName,
      }),
  });
/**
 * @returns unknown
 * @throws ApiError
 */
export const prefetchUseOrdersServiceOrderControllerGetOrdersByLocation = (
  queryClient: QueryClient,
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseOrdersServiceOrderControllerGetOrdersByLocationKeyFn(),
    queryFn: () => OrdersService.orderControllerGetOrdersByLocation(),
  });
/**
 * Get orders for current client with optional status filter
 * @param data The data for the request.
 * @param data.status Filter by order status (optional)
 * @returns ClientOrderResponseDto Orders retrieved successfully
 * @throws ApiError
 */
export const prefetchUseOrdersServiceOrderControllerGetClientOrders = (
  queryClient: QueryClient,
  {
    status,
  }: {
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  } = {},
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseOrdersServiceOrderControllerGetClientOrdersKeyFn({
      status,
    }),
    queryFn: () => OrdersService.orderControllerGetClientOrders({ status }),
  });
/**
 * Get invoice creation data for an order
 * @param data The data for the request.
 * @param data.orderId
 * @returns InvoiceCreateDataResponseDto Invoice data retrieved successfully
 * @throws ApiError
 */
export const prefetchUseOrdersServiceOrderControllerGetInvoiceCreateData = (
  queryClient: QueryClient,
  {
    orderId,
  }: {
    orderId: string;
  },
) =>
  queryClient.prefetchQuery({
    queryKey: Common.UseOrdersServiceOrderControllerGetInvoiceCreateDataKeyFn({
      orderId,
    }),
    queryFn: () =>
      OrdersService.orderControllerGetInvoiceCreateData({ orderId }),
  });
