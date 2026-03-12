import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  MapPin,
  Phone,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { type LocationDetail } from '@/api/location.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { FavoriteButton } from '@/components/favorite-button';
import { RatingDisplay } from '@/components/rating-display';
import { RatingForm } from '@/components/rating-form';
import { ReviewCard } from '@/components/review-card';
import {
  useVenuesServiceVenueControllerGetLocationRatings,
  useVenuesServiceVenueControllerCreateRate,
  useVenuesServiceVenueControllerUpdateRate,
  useVenuesServiceVenueControllerDeleteRate,
  useLocationsServiceLocationControllerGetLocationDetails,
  useVenuesServiceVenueControllerGetClientFavors,
} from '@/generated/queries/queries';
import handleAxiosError from '@/helpers/handle-axios-error';
import { useAuthStore } from '@/stores/auth.store';

export const Route = createFileRoute('/locations/$location-id')({
  component: LocationDetailPage,
});

// Mock data flag
const USE_MOCK_DATA = false;

function LocationDetailPage() {
  const { 'location-id': locationId } = Route.useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Get user's favorites to check status
  const { data: clientFavors } = useVenuesServiceVenueControllerGetClientFavors(
    undefined,
    {
      enabled: !!user,
    },
  );

  const isFavorited =
    clientFavors?.some((f) => f.locationId === locationId) ??
    location?.isFavorite ??
    false;
  const [editingReview, setEditingReview] = useState<{
    rating: number;
    comment: string;
  } | null>(null);

  // Fetch location details
  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
  } = useLocationsServiceLocationControllerGetLocationDetails(
    { id: locationId },
    undefined,
    {
      enabled: !!locationId && !USE_MOCK_DATA,
    },
  );

  // Fetch location ratings
  const { data: ratingsData, refetch: refetchRatings } =
    useVenuesServiceVenueControllerGetLocationRatings(
      { locationId },
      undefined,
      {
        enabled: !!locationId && !USE_MOCK_DATA,
      },
    );

  // Create rating mutation
  const createRatingMutation = useVenuesServiceVenueControllerCreateRate({
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      refetchRatings();
      refetchLocation();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit review');
    },
  });

  // Update rating mutation
  const updateRatingMutation = useVenuesServiceVenueControllerUpdateRate({
    onSuccess: () => {
      toast.success('Review updated successfully!');
      setEditingReview(null);
      refetchRatings();
      refetchLocation();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update review');
    },
  });

  // Delete rating mutation
  const deleteRatingMutation = useVenuesServiceVenueControllerDeleteRate({
    onSuccess: () => {
      toast.success('Review deleted successfully!');
      refetchRatings();
      refetchLocation();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete review');
    },
  });

  // Check if user has already reviewed
  const userReview = USE_MOCK_DATA
    ? null
    : ratingsData?.ratings?.find((r: any) => r.clientId === user?.id);

  // Process location data from API or mock
  useEffect(() => {
    const loadLocationData = async () => {
      if (USE_MOCK_DATA) {
        setIsLoading(true);
        try {
          // Mock data
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Import mockVenues and mockLocations
          const { mockVenues, mockLocations } = await import(
            '@/data/mock-data'
          );

          // Find location
          const foundLocation = mockLocations.find(
            (loc) => loc.location_id === locationId,
          );

          if (!foundLocation) {
            setError('Location not found');
            setIsLoading(false);
            return;
          }

          // Get venues for this location
          const locationVenues = mockVenues.filter(
            (v) => v.location.location_id === locationId,
          );

          // Convert to LocationDetail format
          const mockLocation: LocationDetail = {
            location_id: foundLocation.location_id,
            owner_id: foundLocation.owner_id,
            name: foundLocation.name,
            description: foundLocation.description || '',
            addrNo: foundLocation.addrNo,
            ward: foundLocation.ward,
            city: foundLocation.city,
            avgRating: foundLocation.avgRating,
            policy: foundLocation.policy || '',
            phoneNo: foundLocation.phoneNo || '',
            mapURL: foundLocation.mapURL,
            thumbnailURL: foundLocation.thumbnailURL,
            isActive: foundLocation.isActive,
            createdAt: foundLocation.createdAt.toISOString(),
            updatedAt: foundLocation.updatedAt.toISOString(),
            venues: locationVenues.map((v) => ({
              location_id: v.location.location_id,
              name: v.name,
              venueType_id: v.venueType.venueType_id,
              venueTypeName: v.venueType.name,
              floor: v.floor,
              area: v.venueType.area,
              pricePerHour: v.pricePerHour,
              isActive: v.isActive,
              images: v.images,
            })),
            reviews: [
              {
                client_id: 'client1',
                clientName: 'John Doe',
                location_id: locationId,
                stars: 5,
                comment:
                  'Amazing venue! The staff was professional and the space exceeded our expectations.',
                created_at: '2024-11-15T10:00:00',
                updated_at: '2024-11-15T10:00:00',
              },
              {
                client_id: 'client2',
                clientName: 'Jane Smith',
                location_id: locationId,
                stars: 4,
                comment:
                  'Great location and facilities. Would definitely book again for future events.',
                created_at: '2024-11-10T14:30:00',
                updated_at: '2024-11-10T14:30:00',
              },
            ],
            isFavorite: false,
          };
          setLocation(mockLocation);
          setIsLoading(false);
        } catch (err) {
          handleAxiosError(err, (message) => {
            setError(message);
          });
          setIsLoading(false);
        }
      } else {
        // Use API data
        if (locationLoading) {
          setIsLoading(true);
          return;
        }

        if (locationError) {
          setError('Failed to load location details');
          setIsLoading(false);
          return;
        }

        if (locationData) {
          // Map API response to LocationDetail format
          const apiLocation: LocationDetail = {
            location_id: locationData.location.location_id,
            owner_id: locationData.location.owner_id,
            name: locationData.location.location_name,
            description: locationData.location.description || '',
            addrNo: locationData.location.addrNo,
            ward: locationData.location.ward,
            city: locationData.location.city,
            avgRating: parseFloat(locationData.statistics.avg_rating as any),
            policy: locationData.location.policy || '',
            phoneNo: locationData.location.phoneNo || '',
            mapURL: locationData.location.mapURL || '',
            thumbnailURL: locationData.location.thumbnailURL || '',
            isActive: locationData.location.isActive,
            createdAt: new Date().toISOString(), // TODO: Add timestamps to DTO
            updatedAt: new Date().toISOString(),
            venues: locationData.venues.map((v: any) => ({
              location_id: locationData.location.location_id,
              name: v.venue_name,
              venueType_id: v.venueType_id,
              venueTypeName: v.theme_name,
              floor: v.floor,
              area: v.area,
              pricePerHour: v.pricePerHour,
              isActive: v.isActive,
              images: locationData.images.map((img: any, idx: number) => ({
                image_id: `${locationData.location.location_id}-img-${idx}`,
                location_id: locationData.location.location_id,
                venueName: img.venueName,
                locationImgURL: img.locationImgURL,
              })),
            })),
            reviews: locationData.reviews.map((r: any) => ({
              client_id: r.client_id,
              clientName: `${r.firstName} ${r.lastName}`,
              location_id: locationData.location.location_id,
              stars: r.stars,
              comment: r.comment || '',
              created_at: r.created_at,
              updated_at: r.updated_at || r.created_at,
            })),
            isFavorite: locationData.location.is_favorited,
          };
          setLocation(apiLocation);
          setIsLoading(false);
        }
      }
    };

    loadLocationData();
  }, [locationId, locationData, locationLoading, locationError]);

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log('Mock review submitted:', { rating, comment });
      setShowReviewForm(false);
    } else {
      createRatingMutation.mutate({
        requestBody: {
          clientId: user.id,
          locationId,
          stars: rating,
          comment,
        },
      });
    }
  };

  const handleUpdateReview = async (rating: number, comment: string) => {
    if (!user) {
      toast.error('Please login to update review');
      return;
    }

    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log('Mock review updated:', { rating, comment });
      setEditingReview(null);
    } else {
      updateRatingMutation.mutate({
        clientId: user.id,
        locationId,
        requestBody: {
          stars: rating,
          comment,
        },
      });
    }
  };

  const handleDeleteReview = () => {
    if (!user) {
      toast.error('Please login to delete review');
      return;
    }

    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    if (USE_MOCK_DATA) {
      console.log('Mock review deleted');
    } else {
      deleteRatingMutation.mutate({
        clientId: user.id,
        locationId,
      });
    }
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

  if (error || !location) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 size-16 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Location Not Found
            </h2>
            <p className="mb-4 text-gray-600">
              {error || 'Unable to load location details'}
            </p>
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
              className="btn-primary"
            >
              Back to Search
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
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden bg-gray-900">
          <img
            src={location.thumbnailURL}
            alt={location.name}
            className="size-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Favorite Button */}
          <div className="absolute right-6 top-6">
            <FavoriteButton
              locationId={location.location_id}
              initialIsFavorite={isFavorited}
              size="lg"
            />
          </div>

          {/* Title Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-8">
            <div className="container-custom">
              <h1 className="mb-2 text-4xl font-bold text-white">
                {location.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5" />
                  <span>
                    {location.addrNo}, {location.ward}, {location.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-5" />
                  <span>{location.phoneNo}</span>
                </div>
                <RatingDisplay rating={location.avgRating} size="lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Description */}
              <section className="card mb-8">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  About This Location
                </h2>
                <p className="text-gray-700">{location.description}</p>
              </section>

              {/* Policy */}
              {location.policy && (
                <section className="card mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Policies
                  </h2>
                  <p className="text-gray-700">{location.policy}</p>
                </section>
              )}

              {/* Venues */}
              <section className="card mb-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Available Venues ({location.venues.length})
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {location.venues.map((venue) => (
                    <div
                      key={venue.name}
                      className="overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-lg"
                    >
                      {/* Venue Image */}
                      {venue.images[0] && (
                        <div className="relative h-48 overflow-hidden bg-gray-200">
                          <img
                            src={venue.images[0].locationImgURL}
                            alt={venue.name}
                            className="size-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {!venue.isActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
                                Unavailable
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Venue Info */}
                      <div className="p-4">
                        <h3 className="mb-2 text-lg font-bold text-gray-900">
                          {venue.name}
                        </h3>
                        <div className="mb-4 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="size-4" />
                            <span>{venue.venueTypeName} Venue</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <span>Floor: {venue.floor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Area: {venue.area}m²</span>
                          </div>
                        </div>

                        {/* Price and View Details Button */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                          <div>
                            <div className="flex items-center gap-1 text-primary">
                              <DollarSign className="size-5" />
                              <span className="text-2xl font-bold">
                                {venue.pricePerHour.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              per hour
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              // Create unique venue ID from location_id and venue name
                              const venueId = `${locationId}-${venue.name.replace(/\s+/g, '-')}`;
                              console.log('Navigating to venue:', venue.name);
                              console.log('Location ID:', locationId);
                              console.log('Generated venue ID:', venueId);
                              navigate({
                                to: '/venues/$id',
                                params: { id: venueId },
                              });
                            }}
                            disabled={!venue.isActive}
                            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reviews Section */}
              <section className="card">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Reviews ({location.reviews.length})
                  </h2>
                  {!userReview && !showReviewForm && !editingReview && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="btn-primary"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Review Form (New Review) */}
                {showReviewForm && (
                  <div className="mb-6">
                    <RatingForm
                      onSubmit={handleSubmitReview}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}

                {/* Edit Review Form */}
                {editingReview && (
                  <div className="mb-6">
                    <RatingForm
                      onSubmit={handleUpdateReview}
                      onCancel={() => setEditingReview(null)}
                      initialRating={editingReview.rating}
                      initialComment={editingReview.comment}
                      submitLabel="Update Review"
                    />
                  </div>
                )}

                {/* Reviews List */}
                {location.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {location.reviews.map((review) => {
                      const isOwnReview = user?.id === review.client_id;
                      return (
                        <ReviewCard
                          key={`${review.client_id}-${review.created_at}`}
                          review={review}
                          isOwn={isOwnReview}
                          onEdit={
                            isOwnReview && !editingReview
                              ? () =>
                                  setEditingReview({
                                    rating: review.stars,
                                    comment: review.comment || '',
                                  })
                              : undefined
                          }
                          onDelete={
                            isOwnReview && !editingReview
                              ? handleDeleteReview
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 p-8 text-center">
                    <p className="text-gray-600">
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Map */}
              <div className="card mb-6">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Location
                </h3>
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-200">
                  <iframe
                    src={location.mapURL}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location Map"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  {location.addrNo}, {location.ward}, {location.city}
                </p>
              </div>

              {/* Contact */}
              <div className="card">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="size-5 text-primary" />
                    <a
                      href={`tel:${location.phoneNo}`}
                      className="hover:text-primary"
                    >
                      {location.phoneNo}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="size-5 text-primary" />
                    <span className="text-sm">
                      {location.addrNo}, {location.ward}, {location.city}
                    </span>
                  </div>
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
