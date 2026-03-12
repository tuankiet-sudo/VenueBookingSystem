import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { Edit2, Trash2, ToggleRight, ToggleLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

import { amenityApi, type Amenity } from '@/api/amenity.api';
import {
  locationApi,
  type LocationDetailResponse,
  type VenueListResponse,
} from '@/api/location.api';
import { venueApi } from '@/api/venue.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { formatCurrency } from '@/data/mock-data';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/owner/locations/$location-id/')({
  component: LocationDetailPage,
});

export function LocationDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ from: '/owner/locations/$location-id/' });
  const locationId = params['location-id'];

  const [location, setLocation] = useState<LocationDetailResponse | null>(null);
  const [venues, setVenues] = useState<VenueListResponse[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingVenue, setTogglingVenue] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'venues' | 'amenities'>('venues');
  const [togglingAmenity, setTogglingAmenity] = useState<string | null>(null);
  const [deletingAmenity, setDeletingAmenity] = useState<string | null>(null);

  // Fetch location details, venues, and amenities
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [locData, venuesData, amenitiesData] = await Promise.all([
          locationApi.getLocationDetailsById(locationId),
          locationApi.getVenuesByLocation(locationId),
          amenityApi.getAmenitiesByLocation(locationId),
        ]);
        setLocation(locData);
        setVenues(venuesData);
        setAmenities(amenitiesData);
      } catch (err) {
        handleAxiosError(err, (message) => {
          setError(message);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locationId]);

  const handleToggleVenueStatus = async (
    venueName: string,
    currentIsActive: boolean,
  ) => {
    try {
      setTogglingVenue(venueName);
      setToggleError(null);
      await venueApi.updateVenueStatus(locationId, venueName, !currentIsActive);

      // Update local state
      setVenues((prev) =>
        prev.map((v) =>
          v.venueName === venueName
            ? { ...v, venueIsActive: !v.venueIsActive }
            : v,
        ),
      );
    } catch (err) {
      handleAxiosError(err, (message) => {
        setToggleError(message);
      });
    } finally {
      setTogglingVenue(null);
    }
  };

  const handleToggleAmenityStatus = async (amenity: Amenity) => {
    try {
      setTogglingAmenity(amenity.amenity_name);
      await amenityApi.toggleAmenityStatus(
        locationId,
        amenity.amenity_name,
        !amenity.isActive,
      );

      // Update local state
      setAmenities((prev) =>
        prev.map((a) =>
          a.amenity_name === amenity.amenity_name
            ? { ...a, isActive: !a.isActive }
            : a,
        ),
      );
    } catch (err) {
      handleAxiosError(err, (message) => {
        alert(message);
      });
    } finally {
      setTogglingAmenity(null);
    }
  };

  const handleDeleteAmenity = async (amenity: Amenity) => {
    if (!confirm(`Are you sure you want to delete "${amenity.description}"?`)) {
      return;
    }

    try {
      setDeletingAmenity(amenity.amenity_name);
      await amenityApi.deleteAmenity(locationId, amenity.amenity_name);

      // Remove from local state
      setAmenities((prev) =>
        prev.filter((a) => a.amenity_name !== amenity.amenity_name),
      );
    } catch (err) {
      handleAxiosError(err, (message) => {
        alert(message);
      });
    } finally {
      setDeletingAmenity(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="container-custom flex-1 py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
              <p className="text-gray-600">Loading location details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="container-custom flex-1 py-8">
          <div className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-12 text-center">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {error ? 'Error Loading Location' : 'Location not found'}
            </h3>
            <p className="mb-4 text-gray-600">
              {error || "The location you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate({ to: '/owner' })}
              className="rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="container-custom flex-1 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb & Back */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/owner' })}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold hover:bg-gray-200"
            >
              ← Back
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Locations</span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">{location.name}</span>
          </div>

          {/* Location Header Card */}
          <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-6 md:flex-row">
              {/* Location Image */}
              <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg md:h-56 md:w-72">
                <img
                  src={location.thumbnailURL}
                  alt={location.name}
                  className="size-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Location Info */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h1 className="mb-1 text-3xl font-bold text-gray-900">
                    {location.name}
                  </h1>
                  <p className="mb-3 text-sm text-gray-600">
                    {location.city} • {location.ward}
                  </p>
                  <p className="mb-4 text-gray-700">{location.description}</p>

                  <div className="mb-4 space-y-2 text-sm">
                    <p>
                      <span className="font-semibold text-gray-900">
                        Phone:
                      </span>{' '}
                      {location.phoneNo}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Policy:
                      </span>{' '}
                      {location.policy}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate({ to: `/owner/locations/${locationId}/edit` })
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    Edit Location
                  </button>
                  <button
                    onClick={() => navigate({ to: '/owner' })}
                    className="flex-1 rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('venues')}
              className={`border-b-2 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'venues'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Venues
            </button>
            <button
              onClick={() => setActiveTab('amenities')}
              className={`border-b-2 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'amenities'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Amenities
            </button>
          </div>

          {/* Venues Section */}
          {activeTab === 'venues' && (
            <div>
              {toggleError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">{toggleError}</p>
                </div>
              )}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Venues in this Location
                  </h2>
                  <p className="mt-1 text-gray-600">
                    {venues.length} venue{venues.length !== 1 ? 's' : ''}{' '}
                    available
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate({
                      to: `/owner/locations/${locationId}/venues/create`,
                    })
                  }
                  className="rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-300"
                >
                  Create New Venue
                </button>
              </div>

              {/* Venues List */}
              {venues.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {venues.map((venue, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Venue Image */}
                      <div className="relative h-40 overflow-hidden bg-gray-200">
                        <img
                          src={venue.venueImageURLs[0]}
                          alt={venue.venueName}
                          className="size-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>

                      {/* Venue Info */}
                      <div className="p-4">
                        <h3 className="mb-2 text-lg font-bold text-gray-900">
                          {venue.venueName}
                        </h3>

                        {/* Venue Type & Details */}
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                            {venue.venueTypeName}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {venue.venueFloor}
                          </span>
                          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                            {venue.venueCapacity} people
                          </span>
                        </div>

                        {/* Area & Status */}
                        <div className="mb-3 flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {venue.venueArea} m²
                          </span>
                          <span
                            className={`font-medium ${venue.venueIsActive ? 'text-green-600' : 'text-gray-500'}`}
                          >
                            {venue.venueIsActive ? '✓ Active' : '○ Inactive'}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mb-4 border-t border-gray-200 pt-3">
                          <p className="text-sm text-gray-600">
                            Price per hour
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(venue.venuePricePerHour)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleToggleVenueStatus(
                                venue.venueName,
                                venue.venueIsActive,
                              )
                            }
                            disabled={togglingVenue === venue.venueName}
                            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                              venue.venueIsActive
                                ? 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50'
                                : 'border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50'
                            }`}
                          >
                            {togglingVenue === venue.venueName
                              ? 'Updating...'
                              : venue.venueIsActive
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              console.log('hello');
                              navigate({
                                to: `/owner/locations/${locationId}/venues/${venue.venueName}/edit`,
                              });
                            }}
                            className="flex-1 rounded-md border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate({ to: '/owner' })}
                            className="flex-1 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No venues yet
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Create your first venue to get started.
                  </p>
                  <button
                    onClick={() =>
                      navigate({
                        to: `/owner/locations/${locationId}/venues/create`,
                      })
                    }
                    className="rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary-300"
                  >
                    Create Venue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Amenities Section */}
          {activeTab === 'amenities' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Amenities in this Location
                  </h2>
                  <p className="mt-1 text-gray-600">
                    {amenities.length} amenity
                    {amenities.length !== 1 ? 'ies' : ''} available
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate({
                      to: `/owner/locations/${locationId}/amenity/create`,
                    })
                  }
                  className="rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-300"
                >
                  Create New Amenity
                </button>
              </div>

              {/* Amenities List */}
              {amenities.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {amenities.map((amenity) => (
                    <div
                      key={amenity.amenity_name}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Amenity Info */}
                      <div className="p-4">
                        {/* Category Badge and Status */}
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {amenity.category}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              amenity.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {amenity.isActive ? '✓ Active' : '○ Inactive'}
                          </span>
                        </div>

                        {/* Amenity Name */}
                        <h3 className="mb-2 text-lg font-bold text-gray-900">
                          {amenity.amenity_name}
                        </h3>

                        {/* Price Section */}
                        <div className="mb-4 border-t border-gray-200 pt-3">
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(amenity.price)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleAmenityStatus(amenity)}
                            disabled={togglingAmenity === amenity.amenity_name}
                            className={`flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              amenity.isActive
                                ? 'border border-yellow-300 text-yellow-600 hover:bg-yellow-50'
                                : 'border border-green-300 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {togglingAmenity === amenity.amenity_name ? (
                              <>
                                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                <span>Updating...</span>
                              </>
                            ) : amenity.isActive ? (
                              <>
                                <ToggleRight className="size-4" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="size-4" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>

                          {/* Edit and Delete Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate({
                                  to: `/owner/locations/${locationId}/amenity/${amenity.amenity_name}/edit`,
                                })
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                            >
                              <Edit2 className="size-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAmenity(amenity)}
                              disabled={
                                deletingAmenity === amenity.amenity_name
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingAmenity === amenity.amenity_name ? (
                                <>
                                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="size-4" />
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No amenities yet
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Create your first amenity to get started.
                  </p>
                  <button
                    onClick={() =>
                      navigate({
                        to: `/owner/locations/${locationId}/amenity/create`,
                      })
                    }
                    className="rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary-300"
                  >
                    Create Amenity
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
