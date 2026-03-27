import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  MapPin,
  Users,
  Maximize2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { formatCurrency, getAmenitiesByLocation } from '@/data/mock-data';
import { mockVenues } from '@/data/mock-data';
import { useBookingStore } from '@/stores';
import type { VenueWithDetails, Amenity } from '@/types/venue.types';

export const Route = createFileRoute(
  '/locations/$location-id/venues/$venue-name',
)({
  component: VenueDetailPage,
});

function VenueDetailPage() {
  const { 'location-id': locationId, 'venue-name': venueName } =
    Route.useParams();
  const navigate = useNavigate();
  const setVenueId = useBookingStore((state) => state.setVenue);

  const [venue, setVenue] = useState<VenueWithDetails | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchVenueDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data - find venue by location_id and name
      await new Promise((resolve) => setTimeout(resolve, 500));
      const foundVenue = mockVenues.find(
        (v) =>
          v.location.location_id === locationId &&
          v.name === decodeURIComponent(venueName),
      );

      if (foundVenue) {
        setVenue(foundVenue);
        // Get amenities for this location
        const locationAmenities = getAmenitiesByLocation(
          foundVenue.location.location_id,
        );
        setAmenities(locationAmenities);
      }
    } catch (error) {
      console.error('Error fetching venue:', error);
    } finally {
      setIsLoading(false);
    }
  }, [locationId, venueName]);

  useEffect(() => {
    fetchVenueDetail();
  }, [fetchVenueDetail]);

  const handleBookNow = () => {
    if (!venue) return;

    // Save venue to store
    setVenueId(venue.location.location_id);

    // Navigate to checkout
    navigate({
      to: '/checkout/$location-id/$venue-id',
      params: {
        'location-id': venue.location.location_id,
        'venue-id': venue.name,
      },
    });
  };

  const nextImage = () => {
    if (!venue) return;
    setCurrentImageIndex((prev) =>
      prev === venue.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    if (!venue) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? venue.images.length - 1 : prev - 1,
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="spinner" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 size-16 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Venue Not Found
            </h2>
            <p className="mb-4 text-gray-600">Unable to load venue details</p>
            <button
              onClick={() =>
                navigate({
                  to: '/locations/$location-id',
                  params: { 'location-id': locationId },
                })
              }
              className="btn-primary"
            >
              Back to Location
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container-custom py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button
                onClick={() =>
                  navigate({
                    to: '/search',
                    search: {
                      location: '',
                      size: '',
                      checkIn: '',
                      checkOut: '',
                      startTime: '',
                      endTime: '',
                      capacity: '',
                      rooms: 1,
                    },
                  })
                }
                className="hover:text-primary"
              >
                Search
              </button>
              <span>/</span>
              <button
                onClick={() =>
                  navigate({
                    to: '/locations/$location-id',
                    params: { 'location-id': locationId },
                  })
                }
                className="hover:text-primary"
              >
                {venue.location.name}
              </button>
              <span>/</span>
              <span className="text-gray-900">{venue.name}</span>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <section className="card mb-8">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
                  {venue.images.length > 0 && (
                    <>
                      <img
                        src={venue.images[currentImageIndex]!.locationImgURL}
                        alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                        className="size-full object-cover"
                      />

                      {/* Navigation Arrows */}
                      {venue.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:scale-110 hover:bg-white"
                          >
                            <ChevronLeft className="size-6 text-gray-900" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:scale-110 hover:bg-white"
                          >
                            <ChevronRight className="size-6 text-gray-900" />
                          </button>

                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                            {currentImageIndex + 1} / {venue.images.length}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {venue.images.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {venue.images.map((image, index) => (
                      <button
                        key={image.image_id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-primary'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.locationImgURL}
                          alt={`Thumbnail ${index + 1}`}
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Venue Info */}
              <section className="card mb-8">
                <h1 className="mb-4 text-3xl font-bold text-gray-900">
                  {venue.name}
                </h1>

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Users className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Venue Type</div>
                      <div className="font-medium">{venue.venueType.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Maximize2 className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Area</div>
                      <div className="font-medium">
                        {venue.venueType.area}m²
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <MapPin className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Floor</div>
                      <div className="font-medium">{venue.floor}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Users className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Capacity</div>
                      <div className="font-medium">
                        {venue.venueType.minCapacity} -{' '}
                        {venue.venueType.maxCapacity} people
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {venue.venueType.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="mb-3 text-lg font-bold text-gray-900">
                      About This Venue
                    </h3>
                    <p className="text-gray-700">
                      {venue.venueType.description}
                    </p>
                  </div>
                )}
              </section>

              {/* Amenities */}
              {amenities.length > 0 && (
                <section className="card mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Available Amenities
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity.amenity_id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {amenity.category}
                          </div>
                          <div className="text-sm text-gray-500">
                            {amenity.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {formatCurrency(amenity.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Location Info */}
              <section className="card">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Location
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="mt-1 size-5 text-primary" />
                    <div>
                      <div className="font-medium">{venue.location.name}</div>
                      <div className="text-sm text-gray-500">
                        {venue.location.addrNo}, {venue.location.ward},{' '}
                        {venue.location.city}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <div className="card sticky top-4">
                <div className="mb-6">
                  <div className="mb-2 text-sm text-gray-500">Price</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {formatCurrency(venue.pricePerHour)}
                    </span>
                    <span className="text-gray-500">/ hour</span>
                  </div>
                </div>

                <div className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Calendar className="size-5 text-primary" />
                    <span>Flexible booking hours</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Clock className="size-5 text-primary" />
                    <span>6:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Users className="size-5 text-primary" />
                    <span>Up to {venue.venueType.maxCapacity} guests</span>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={!venue.isActive}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {venue.isActive ? 'Book Now' : 'Unavailable'}
                </button>

                {!venue.isActive && (
                  <p className="mt-2 text-center text-sm text-red-500">
                    This venue is currently unavailable
                  </p>
                )}

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <p className="text-center text-sm text-gray-500">
                    Need help? Contact us at
                  </p>
                  <p className="text-center font-medium text-primary">
                    {venue.location.phoneNo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
