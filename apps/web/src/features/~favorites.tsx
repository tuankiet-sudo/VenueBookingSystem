import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Heart, MapPin, Star } from 'lucide-react';
import { toast } from 'react-toastify';

import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { EmptyState } from '@/components/empty-state';
import {
  useVenuesServiceVenueControllerGetClientFavors,
  useLocationsServiceLocationControllerDeleteFavor,
} from '@/generated/queries/queries';
import { useAuthStore } from '@/stores';

export const Route = createFileRoute('/favorites')({
  beforeLoad: ({ context }) => {
    if (!context.authContext.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: FavoritesPage,
});

function FavoritesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Fetch user's favorites from API
  const {
    data: favoritesData,
    isLoading,
    refetch: refetchFavorites,
  } = useVenuesServiceVenueControllerGetClientFavors(undefined, {
    enabled: !!user,
  });

  // Delete favor mutation
  const deleteFavorMutation = useLocationsServiceLocationControllerDeleteFavor({
    onSuccess: () => {
      toast.success('Removed from favorites!');
      refetchFavorites();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove favorite');
    },
  });

  const handleRemoveFavorite = (locationId: string) => {
    if (!user) {
      toast.error('Please login to manage favorites');
      return;
    }

    if (window.confirm('Remove this location from favorites?')) {
      deleteFavorMutation.mutate({
        locationId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block size-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const favorites = favoritesData || [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container-custom">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              My Favorites
            </h1>
            <p className="text-gray-600">
              Locations you've saved for future bookings
            </p>
          </div>

          {/* Favorites List */}
          {favorites.length === 0 ? (
            <EmptyState
              icon={<Heart className="size-16" />}
              title="No favorites yet"
              description="Start adding locations to your favorites to see them here!"
              action={{
                label: 'Browse Locations',
                onClick: () =>
                  navigate({
                    to: '/search',
                    search: {
                      location: '',
                      checkIn: '',
                      checkOut: '',
                      startTime: '',
                      size: '',
                      endTime: '',
                      capacity: '',
                      rooms: 1,
                    },
                  }),
              }}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => (
                <div
                  key={favorite.locationId}
                  className="card group relative overflow-hidden transition-shadow hover:shadow-lg"
                >
                  {/* Remove Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.locationId);
                    }}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-md transition-all hover:scale-110"
                    disabled={deleteFavorMutation.isPending}
                  >
                    <Heart className="size-5 fill-red-500 text-red-500" />
                  </button>

                  {/* Image */}
                  <div
                    onClick={() =>
                      navigate({
                        to: '/locations/$location-id',
                        params: { 'location-id': favorite.locationId },                      })
                    }
                    className="relative -m-6 mb-4 h-48 cursor-pointer overflow-hidden rounded-t-xl"
                  >
                    <img
                      src={favorite.thumbnailURL}
                      alt={favorite.locationName}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      {Number(favorite.avgRating).toFixed(1)}
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    onClick={() =>
                      navigate({
                        to: '/locations/$location-id',
                        params: { 'location-id': favorite.locationId },                      })
                    }
                    className="cursor-pointer"
                  >
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      {favorite.locationName}
                    </h3>
                    <p className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="size-4" />
                      {favorite.city}
                    </p>
                    <button className="btn-primary w-full">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
