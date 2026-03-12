import { createFileRoute, redirect } from '@tanstack/react-router';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import type { Review } from '@/api/rate.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { EmptyState } from '@/components/empty-state';
import { RatingForm } from '@/components/rating-form';
import { ReviewCard } from '@/components/review-card';
import {
  useVenuesServiceVenueControllerGetClientRates,
  useVenuesServiceVenueControllerUpdateRate,
  useVenuesServiceVenueControllerDeleteRate,
} from '@/generated/queries/queries';
import { useAuthStore } from '@/stores';

export const Route = createFileRoute('/my-reviews')({
  beforeLoad: ({ context }) => {
    if (!context.authContext.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: MyReviewsPage,
});

function MyReviewsPage() {
  const user = useAuthStore((state) => state.user);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Fetch user's reviews from API
  const {
    data: apiReviews,
    isLoading,
    refetch: refetchReviews,
  } = useVenuesServiceVenueControllerGetClientRates(undefined, {
    enabled: !!user,
  });

  // Map API response to Review type
  const reviews: Review[] =
    apiReviews?.map((r) => ({
      client_id: r.clientId,
      location_id: r.locationId,
      locationName: r.locationName || 'Unknown Location',
      stars: r.stars,
      comment: r.comment || '',
      created_at: r.createdAt,
      updated_at: r.updatedAt || r.createdAt,
      clientName: r.clientName,
      avatarURL: r.avatarURL,
      city: r.city,
      thumbnailURL: r.thumbnailURL,
    })) || [];

  // Update rating mutation
  const updateRatingMutation = useVenuesServiceVenueControllerUpdateRate({
    onSuccess: () => {
      toast.success('Review updated successfully!');
      setEditingReview(null);
      refetchReviews();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update review');
    },
  });

  // Delete rating mutation
  const deleteRatingMutation = useVenuesServiceVenueControllerDeleteRate({
    onSuccess: () => {
      toast.success('Review deleted successfully!');
      refetchReviews();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete review');
    },
  });

  const handleEdit = (review: Review) => {
    setEditingReview(review);
  };

  const handleUpdate = async (rating: number, comment: string) => {
    if (!editingReview || !user) {
      toast.error('Please login to update review');
      return;
    }

    // Call real API
    updateRatingMutation.mutate({
      clientId: user.id,
      locationId: editingReview.location_id,
      requestBody: {
        stars: rating,
        comment,
      },
    });
  };

  const handleDelete = (review: Review) => {
    if (!user) {
      toast.error('Please login to delete review');
      return;
    }

    if (window.confirm('Are you sure you want to delete this review?')) {
      // Call real API
      deleteRatingMutation.mutate({
        clientId: user.id,
        locationId: review.location_id,
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
            <p className="text-gray-600">Loading your reviews...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container-custom max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              My Reviews
            </h1>
            <p className="text-gray-600">
              Manage your reviews and ratings for venues you've visited
            </p>
          </div>

          {reviews.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="size-16" />}
              title="No reviews yet"
              description="You haven't written any reviews yet. Book a venue and share your experience!"
              action={{
                label: 'Find Venues',
                onClick: () => (window.location.href = '/search'),
              }}
            />
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.location_id} className="relative">
                  {/* Location Info Badge */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                      {review.locationName}
                    </span>
                    {review.city && (
                      <span className="text-sm text-gray-500">
                        📍 {review.city}
                      </span>
                    )}
                  </div>

                  <ReviewCard
                    review={review}
                    isOwn={true}
                    onEdit={() => handleEdit(review)}
                    onDelete={() => handleDelete(review)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-scale-in w-full max-w-lg">
            <RatingForm
              initialRating={editingReview.stars}
              initialComment={editingReview.comment}
              onSubmit={handleUpdate}
              onCancel={() => setEditingReview(null)}
              submitLabel="Update Review"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
