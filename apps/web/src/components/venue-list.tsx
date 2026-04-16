import { useNavigate } from '@tanstack/react-router';
import { useMemo, memo, useState } from 'react';

import { useVenuesServiceVenueControllerGetClientFavors } from '@/generated/queries';
import { useAuthStore } from '@/stores';

import { formatCurrency } from '../data/mock-data';

import { FavoriteButton } from './favorite-button';
import type { VenueWithDetails, Venue, Location } from '@/types/venue.types';
interface VenueListProps {
  venues: VenueWithDetails[];
  onVenueClick?: (venueId: string, locationId: string) => void;
  location: string;
}

interface LocationGroup {
  location: Location;
  venues: VenueWithDetails[];
}

export function VenueList({ venues, onVenueClick, location }: VenueListProps) {
  console.log('[VenueList] Component rendering, venues count:', venues.length);
  // Group venues by location
  const venuesByLocation = useMemo(() => {
    return venues.reduce(
      (acc, venue) => {
        const locId = venue.location.location_id;
        if (!acc[locId]) {
          acc[locId] = { location: venue.location, venues: [] };
        }
        acc[locId]!.venues.push(venue);
        return acc;
      },
      {} as Record<string, LocationGroup>,
    );
  }, [venues]);

  const locationGroups = useMemo(() => {
    return Object.values(venuesByLocation);
  }, [venuesByLocation]);

  return (
    <div className="space-y-4">
      {/* Sort Bar */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          {location}: {locationGroups.length} properties found
        </h2>
      </div>

      {/* Black Friday Banner */}
      {/* <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-blue-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-2xl font-bold">Save up to 40% on stays</h3>
            <p className="max-w-lg text-white/80">
              Book now with free cancellation and no hidden fees, and stay till
              Dec 31, 2026.
            </p>
            <button className="btn-primary mt-4 border-0 bg-blue-600 hover:bg-blue-500">
              See available deals
            </button>
          </div>
          <div className="hidden md:block">
            <span className="block -rotate-6 bg-gradient-to-r from-yellow-400 to-orange bg-clip-text text-5xl font-black text-transparent">
              BLACK
              <br />
              FRIDAY
            </span>
          </div>
        </div> */}
      {/* Decorative circles */}
      {/* <div className="absolute right-0 top-0 size-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-48 -translate-x-1/4 translate-y-1/3 rounded-full bg-blue-500/20 blur-2xl" />
      </div> */}

      {/* Location Cards */}
      <div className={'space-y-6'}>
        {locationGroups.map((group) => (
          <LocationCard
            key={group.location.location_id}
            location={group.location}
            venues={group.venues}
            onVenueClick={onVenueClick}
          />
        ))}
      </div>
    </div>
  );
}

interface LocationCardProps {
  location: Location;
  venues: VenueWithDetails[];
  onVenueClick?: (venueId: string, locationId: string) => void;
}

const LocationCard = memo(function LocationCard({
  location,
  venues,
  onVenueClick,
}: LocationCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Get user's favorites to check status
  const { data: clientFavors } = useVenuesServiceVenueControllerGetClientFavors(
    undefined,
    {
      enabled: !!user,
    },
  );

  const isFavorited =
    clientFavors?.some((f) => f.locationId === location.location_id) ??
    venues[0]?.isFavorite ??
    false;

  const minPrice = Math.min(...venues.map((v) => v.pricePerHour));

  const handleVenueClick = (venue: Venue) => {
    console.log('Location ID:', location.location_id);
    if (onVenueClick) {
      onVenueClick(venue.name, location.location_id);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Location Header / Main Card */}
      <div className={`flex flex-col gap-4 p-4 md:flex-row`}>
        {/* Image */}
        <div
          className={`relative h-48 w-full shrink-0 overflow-hidden rounded-lg md:h-56 md:w-72`}
        >
          <img
            src={location.thumbnailURL}
            alt={location.name}
            className="size-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute right-2 top-2 z-10">
            <FavoriteButton
              locationId={location.location_id}
              initialIsFavorite={isFavorited}
            />
          </div>
          <button className="absolute right-2 top-2 rounded-full bg-white/80 p-2 text-gray-500 transition-colors hover:bg-white hover:text-red-500">
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3
                onClick={() =>
                  navigate({
                    to: '/locations/$location-id',
                    params: { 'location-id': location.location_id },                  })
                }
                className="mb-1 cursor-pointer text-2xl font-bold text-primary hover:underline"
              >
                {location.name}
              </h3>
              <div className="mb-2 flex items-center gap-2 text-sm text-primary">
                <span className="cursor-pointer underline">
                  {location.city}
                </span>
                <span className="text-gray-400">•</span>
                <span className="cursor-pointer text-blue-600 hover:underline">
                  Show on map
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{location.ward}</span>
              </div>
              <p className={`mb-4 line-clamp-2 text-sm text-gray-600`}>
                {location.description}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Wonderful
                  </div>
                  <div className="text-sm text-gray-500">250 reviews</div>
                </div>
                <div className="flex size-8 items-center justify-center rounded-t-lg rounded-br-lg bg-primary text-sm font-bold text-white">
                  {location.avgRating}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-4">
            <div>
              <div className="mb-1 text-sm font-bold text-green-600">
                {venues.length} room types available
              </div>
              <div className="text-xs text-gray-500">
                Starts from{' '}
                <span className="font-bold text-gray-900">
                  {formatCurrency(minPrice)}
                </span>
                /hour
              </div>
            </div>
            <button
              onClick={() => setIsExpanded((s) => !s)}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-bold text-white transition-colors hover:bg-primary-300 whitespace-nowrap"
              >
                {isExpanded ? 'Hide availability' : 'See Availability'}
                <svg
                  className={`size-4 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Inline venues expansion */}
      {isExpanded ? (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4">
            {venues.map((venue) => (
              <div
                key={`${venue?.location?.location_id}-${venue.name}`}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-primary/50 md:flex-row"
              >
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md md:w-48">
                  <img
                    src={venue?.images?.[0]?.locationImgURL ?? '/venue.png'}
                    alt={venue.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {venue.name}
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {venue?.venueType?.name}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        Capacity: {venue?.venueType?.maxCapacity}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {venue.floor}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(venue.pricePerHour)}
                      </div>
                      <div className="text-xs text-gray-500">per hour</div>
                    </div>
                    <button
                      onClick={() => handleVenueClick(venue)}
                      className="rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      Order now!
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});
