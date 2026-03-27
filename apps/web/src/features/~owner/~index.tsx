import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Power, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { locationApi, type LocationResponse } from '@/api/location.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/owner/')({
  component: OwnerLanding,
});

export function OwnerLanding() {
  const navigate = useNavigate();
  const [ownerLocations, setOwnerLocations] = useState<LocationResponse[]>([]);
  const [locationStatus, setLocationStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingLocation, setTogglingLocation] = useState<string | null>(null);

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const locations = await locationApi.getOwnerLocations();
        setOwnerLocations(locations);

        // Initialize status map from fetched locations
        const statusMap = locations.reduce(
          (acc, loc) => ({
            ...acc,
            [loc.locationId]: Boolean(loc.isActive),
          }),
          {},
        );
        setLocationStatus(statusMap);
      } catch (err) {
        handleAxiosError(err, (message) => {
          setError(message);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleToggleLocationStatus = async (locationId: string) => {
    const currentStatus = locationStatus[locationId];
    const newStatus = !currentStatus;

    setTogglingLocation(locationId);
    try {
      // Call API to update location status
      await locationApi.updateLocationStatus(locationId, newStatus);

      // Update local state
      setLocationStatus((prev) => ({
        ...prev,
        [locationId]: newStatus,
      }));

      // Update locations list
      setOwnerLocations((prev) =>
        prev.map((loc) =>
          loc.locationId === locationId
            ? { ...loc, isActive: newStatus ? 1 : 0 }
            : loc,
        ),
      );
    } catch (err) {
      handleAxiosError(err, (message) => {
        setError(message);
        // Revert local state on error
        setLocationStatus((prev) => ({
          ...prev,
          [locationId]: currentStatus ?? false,
        }));
      });
    } finally {
      setTogglingLocation(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="container-custom flex-1 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Greeting Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Hello owner</h1>
            <p className="mt-2 text-gray-600">
              Manage your venues and locations
            </p>
          </div>

          {/* Create Location Button */}
          <div className="mb-8 flex gap-3">
            <button
              onClick={() => navigate({ to: '/owner/locations/create' })}
              className="rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-300"
            >
              Create New Location
            </button>
            <button
              onClick={() => navigate({ to: '/owner/orders' })}
              className="rounded-lg border border-primary px-6 py-3 font-bold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              View Orders
            </button>
          </div>

          {/* Locations List */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Your Locations ({ownerLocations.length})
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="spinner size-12 border-4 border-gray-200 border-t-primary" />
              </div>
            ) : ownerLocations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ownerLocations.map((location) => (
                  <div
                    key={location.locationId}
                    className={`overflow-hidden rounded-lg border transition-shadow hover:shadow-md ${
                      locationStatus[location.locationId]
                        ? 'border-gray-200 bg-white shadow-sm'
                        : 'border-gray-300 bg-gray-50 shadow-sm'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <img
                        src={location.thumbnailURL}
                        alt={location.name}
                        className={`size-full object-cover transition-transform duration-300 ${
                          locationStatus[location.locationId]
                            ? 'hover:scale-105'
                            : 'opacity-60'
                        }`}
                      />
                      {/* Status Badge */}
                      <div
                        className={`absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-semibold ${
                          locationStatus[location.locationId]
                            ? 'bg-white text-primary'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {locationStatus[location.locationId]
                          ? `⭐ ${location.avgRating}`
                          : '🔴 Inactive'}
                      </div>

                      {/* Inactive Overlay */}
                      {!locationStatus[location.locationId] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="flex flex-col items-center gap-2 text-white">
                            <AlertCircle className="size-8" />
                            <span className="text-sm font-semibold">
                              Not Available
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="mb-1 text-lg font-bold text-gray-900">
                        {location.name}
                      </h3>
                      <p className="mb-3 text-sm text-gray-500">
                        {location.city} • {location.ward}
                      </p>
                      <p
                        className={`mb-4 line-clamp-2 text-sm ${
                          locationStatus[location.locationId]
                            ? 'text-gray-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {location.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleToggleLocationStatus(location.locationId)
                          }
                          disabled={togglingLocation === location.locationId}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                            togglingLocation === location.locationId
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                          } ${
                            locationStatus[location.locationId]
                              ? 'border border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          <Power className="size-4" />
                          {togglingLocation === location.locationId
                            ? 'Updating...'
                            : locationStatus[location.locationId]
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>
                        <button
                          onClick={() =>
                            navigate({
                              to: `/owner/locations/${location.locationId}/edit`,
                            })
                          }
                          className="flex-1 rounded-md border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            navigate({
                              to: `/owner/locations/${location.locationId}`,
                            })
                          }
                          className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-300"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No locations yet
                </h3>
                <p className="mb-4 text-gray-600">
                  Create your first location to get started.
                </p>
                <button
                  onClick={() => navigate({ to: '/owner' })}
                  className="rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary-300"
                >
                  Create Location
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
