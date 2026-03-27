// generated with @7nohe/openapi-react-query-codegen@1.4.1

import type { UseQueryOptions } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
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
export const useAppServiceAppControllerGetHelloSuspense = <
  TData = Common.AppServiceAppControllerGetHelloDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseAppServiceAppControllerGetHelloKeyFn(queryKey),
    queryFn: () => AppService.appControllerGetHello() as TData,
    ...options,
  });
/**
 * Get current user profile
 * @returns UserProfileDto User profile retrieved successfully
 * @throws ApiError
 */
export const useUsersServiceUserControllerGetProfileSuspense = <
  TData = Common.UsersServiceUserControllerGetProfileDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseUsersServiceUserControllerGetProfileKeyFn(queryKey),
    queryFn: () => UsersService.userControllerGetProfile() as TData,
    ...options,
  });
/**
 * @returns unknown
 * @throws ApiError
 */
export const useVenuesServiceVenueControllerGetVenueTypesSuspense = <
  TData = Common.VenuesServiceVenueControllerGetVenueTypesDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey:
      Common.UseVenuesServiceVenueControllerGetVenueTypesKeyFn(queryKey),
    queryFn: () => VenuesService.venueControllerGetVenueTypes() as TData,
    ...options,
  });
/**
 * Preview venue details
 * @param data The data for the request.
 * @param data.locationId
 * @param data.name
 * @returns VenuePreviewResponseDto Venue preview retrieved successfully
 * @throws ApiError
 */
export const useVenuesServiceVenueControllerPreviewVenueSuspense = <
  TData = Common.VenuesServiceVenueControllerPreviewVenueDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  {
    locationId,
    name,
  }: {
    locationId: string;
    name: string;
  },
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseVenuesServiceVenueControllerPreviewVenueKeyFn(
      { locationId, name },
      queryKey,
    ),
    queryFn: () =>
      VenuesService.venueControllerPreviewVenue({ locationId, name }) as TData,
    ...options,
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
export const useVenuesServiceVenueControllerUpdateVenueSuspense = <
  TData = Common.VenuesServiceVenueControllerUpdateVenueDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  {
    locationId,
    name,
    requestBody,
  }: {
    locationId: string;
    name: string;
    requestBody: UpdateVenueDto;
  },
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseVenuesServiceVenueControllerUpdateVenueKeyFn(
      { locationId, name, requestBody },
      queryKey,
    ),
    queryFn: () =>
      VenuesService.venueControllerUpdateVenue({
        locationId,
        name,
        requestBody,
      }) as TData,
    ...options,
  });
/**
 * Get all ratings for a location
 * @param data The data for the request.
 * @param data.locationId
 * @returns LocationRatingsDto Ratings retrieved successfully
 * @throws ApiError
 */
export const useVenuesServiceVenueControllerGetLocationRatingsSuspense = <
  TData = Common.VenuesServiceVenueControllerGetLocationRatingsDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  {
    locationId,
  }: {
    locationId: string;
  },
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseVenuesServiceVenueControllerGetLocationRatingsKeyFn(
      { locationId },
      queryKey,
    ),
    queryFn: () =>
      VenuesService.venueControllerGetLocationRatings({ locationId }) as TData,
    ...options,
  });
/**
 * Get all ratings by current user
 * @returns RateResponseDto User ratings retrieved successfully
 * @throws ApiError
 */
export const useVenuesServiceVenueControllerGetClientRatesSuspense = <
  TData = Common.VenuesServiceVenueControllerGetClientRatesDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey:
      Common.UseVenuesServiceVenueControllerGetClientRatesKeyFn(queryKey),
    queryFn: () => VenuesService.venueControllerGetClientRates() as TData,
    ...options,
  });
/**
 * Get all favorited locations by current user
 * @returns FavorResponseDto User favorites retrieved successfully
 * @throws ApiError
 */
export const useVenuesServiceVenueControllerGetClientFavorsSuspense = <
  TData = Common.VenuesServiceVenueControllerGetClientFavorsDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey:
      Common.UseVenuesServiceVenueControllerGetClientFavorsKeyFn(queryKey),
    queryFn: () => VenuesService.venueControllerGetClientFavors() as TData,
    ...options,
  });
/**
 * Get all active locations (public)
 * @returns LocationListItemDto Locations retrieved successfully
 * @throws ApiError
 */
export const useLocationsServiceLocationControllerGetAllLocationsSuspense = <
  TData = Common.LocationsServiceLocationControllerGetAllLocationsDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey:
      Common.UseLocationsServiceLocationControllerGetAllLocationsKeyFn(
        queryKey,
      ),
    queryFn: () =>
      LocationsService.locationControllerGetAllLocations() as TData,
    ...options,
  });
/**
 * Get all locations owned by current user
 * @returns unknown Locations retrieved successfully
 * @throws ApiError
 */
export const useLocationsServiceLocationControllerGetLocationsOfOwnerSuspense =
  <
    TData = Common.LocationsServiceLocationControllerGetLocationsOfOwnerDefaultResponse,
    TError = unknown,
    TQueryKey extends Array<unknown> = unknown[],
  >(
    queryKey?: TQueryKey,
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
  ) =>
    useSuspenseQuery<TData, TError>({
      queryKey:
        Common.UseLocationsServiceLocationControllerGetLocationsOfOwnerKeyFn(
          queryKey,
        ),
      queryFn: () =>
        LocationsService.locationControllerGetLocationsOfOwner() as TData,
      ...options,
    });
/**
 * Get complete location details by ID (public)
 * @param data The data for the request.
 * @param data.id
 * @returns LocationDetailsResponseDto Location details retrieved successfully
 * @throws ApiError
 */
export const useLocationsServiceLocationControllerGetLocationDetailsSuspense = <
  TData = Common.LocationsServiceLocationControllerGetLocationDetailsDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  {
    id,
  }: {
    id: string;
  },
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey:
      Common.UseLocationsServiceLocationControllerGetLocationDetailsKeyFn(
        { id },
        queryKey,
      ),
    queryFn: () =>
      LocationsService.locationControllerGetLocationDetails({ id }) as TData,
    ...options,
  });
/**
 * @param data The data for the request.
 * @param data.id
 * @returns unknown
 * @throws ApiError
 */
export const useLocationsServiceLocationControllerPreviewLocationSuspense = <
  TData = Common.LocationsServiceLocationControllerPreviewLocationDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  {
    id,
  }: {
    id: string;
  },
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseLocationsServiceLocationControllerPreviewLocationKeyFn(
      { id },
      queryKey,
    ),
    queryFn: () =>
      LocationsService.locationControllerPreviewLocation({ id }) as TData,
    ...options,
  });
/**
 * @param data The data for the request.
 * @param data.id
 * @returns unknown
 * @throws ApiError
 */
export const useLocationsServiceLocationControllerGetVenuesAtLocationSuspense =
  <
    TData = Common.LocationsServiceLocationControllerGetVenuesAtLocationDefaultResponse,
    TError = unknown,
    TQueryKey extends Array<unknown> = unknown[],
  >(
    {
      id,
    }: {
      id: string;
    },
    queryKey?: TQueryKey,
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
  ) =>
    useSuspenseQuery<TData, TError>({
      queryKey:
        Common.UseLocationsServiceLocationControllerGetVenuesAtLocationKeyFn(
          { id },
          queryKey,
        ),
      queryFn: () =>
        LocationsService.locationControllerGetVenuesAtLocation({ id }) as TData,
      ...options,
    });
/**
 * Get amenities by location ID
 * @param data The data for the request.
 * @param data.locationId
 * @returns unknown Amenities retrieved successfully
 * @throws ApiError
 */
export const useAmenitiesServiceAmenityControllerGetByLocationSuspense = <
  TData = Common.AmenitiesServiceAmenityControllerGetByLocationDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  {
    locationId,
  }: {
    locationId: string;
  },
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseAmenitiesServiceAmenityControllerGetByLocationKeyFn(
      { locationId },
      queryKey,
    ),
    queryFn: () =>
      AmenitiesService.amenityControllerGetByLocation({ locationId }) as TData,
    ...options,
  });
/**
 * Get amenity by location ID and name
 * @param data The data for the request.
 * @param data.locationId
 * @param data.name
 * @returns unknown Amenity retrieved successfully
 * @throws ApiError
 */
export const useAmenitiesServiceAmenityControllerGetByLocationAndNameSuspense =
  <
    TData = Common.AmenitiesServiceAmenityControllerGetByLocationAndNameDefaultResponse,
    TError = unknown,
    TQueryKey extends Array<unknown> = unknown[],
  >(
    {
      locationId,
      name,
    }: {
      locationId: string;
      name: string;
    },
    queryKey?: TQueryKey,
    options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
  ) =>
    useSuspenseQuery<TData, TError>({
      queryKey:
        Common.UseAmenitiesServiceAmenityControllerGetByLocationAndNameKeyFn(
          { locationId, name },
          queryKey,
        ),
      queryFn: () =>
        AmenitiesService.amenityControllerGetByLocationAndName({
          locationId,
          name,
        }) as TData,
      ...options,
    });
/**
 * @returns string
 * @throws ApiError
 */
export const useOrdersServiceOrderControllerGetUncompletedOrdersSuspense = <
  TData = Common.OrdersServiceOrderControllerGetUncompletedOrdersDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey:
      Common.UseOrdersServiceOrderControllerGetUncompletedOrdersKeyFn(queryKey),
    queryFn: () => OrdersService.orderControllerGetUncompletedOrders() as TData,
    ...options,
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
export const useOrdersServiceOrderControllerGetDiscountsByVenueSuspense = <
  TData = Common.OrdersServiceOrderControllerGetDiscountsByVenueDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
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
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseOrdersServiceOrderControllerGetDiscountsByVenueKeyFn(
      { endTime, locationId, startTime, venueName },
      queryKey,
    ),
    queryFn: () =>
      OrdersService.orderControllerGetDiscountsByVenue({
        endTime,
        locationId,
        startTime,
        venueName,
      }) as TData,
    ...options,
  });
/**
 * @returns unknown
 * @throws ApiError
 */
export const useOrdersServiceOrderControllerGetOrdersByLocationSuspense = <
  TData = Common.OrdersServiceOrderControllerGetOrdersByLocationDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey:
      Common.UseOrdersServiceOrderControllerGetOrdersByLocationKeyFn(queryKey),
    queryFn: () => OrdersService.orderControllerGetOrdersByLocation() as TData,
    ...options,
  });
/**
 * Get orders for current client with optional status filter
 * @param data The data for the request.
 * @param data.status Filter by order status (optional)
 * @returns ClientOrderResponseDto Orders retrieved successfully
 * @throws ApiError
 */
export const useOrdersServiceOrderControllerGetClientOrdersSuspense = <
  TData = Common.OrdersServiceOrderControllerGetClientOrdersDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  {
    status,
  }: {
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  } = {},
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseOrdersServiceOrderControllerGetClientOrdersKeyFn(
      { status },
      queryKey,
    ),
    queryFn: () =>
      OrdersService.orderControllerGetClientOrders({ status }) as TData,
    ...options,
  });
/**
 * Get invoice creation data for an order
 * @param data The data for the request.
 * @param data.orderId
 * @returns InvoiceCreateDataResponseDto Invoice data retrieved successfully
 * @throws ApiError
 */
export const useOrdersServiceOrderControllerGetInvoiceCreateDataSuspense = <
  TData = Common.OrdersServiceOrderControllerGetInvoiceCreateDataDefaultResponse,
  TError = unknown,
  TQueryKey extends Array<unknown> = unknown[],
>(
  {
    orderId,
  }: {
    orderId: string;
  },
  queryKey?: TQueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) =>
  useSuspenseQuery<TData, TError>({
    queryKey: Common.UseOrdersServiceOrderControllerGetInvoiceCreateDataKeyFn(
      { orderId },
      queryKey,
    ),
    queryFn: () =>
      OrdersService.orderControllerGetInvoiceCreateData({ orderId }) as TData,
    ...options,
  });
