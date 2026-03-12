import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Calendar, MapPin, Clock, X } from 'lucide-react';
import { useState } from 'react';

import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { useOrdersServiceOrderControllerGetClientOrders } from '@/generated/queries';
import type { ClientOrderResponseDto } from '@/generated/requests/types.gen';

export const Route = createFileRoute('/my-orders')({
  beforeLoad: ({ context }) => {
    if (!context.authContext.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: MyOrdersPage,
});

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

function MyOrdersPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(
    undefined,
  );
  const [selectedOrder, setSelectedOrder] =
    useState<ClientOrderResponseDto | null>(null);

  // Fetch orders from API
  const { data: ordersData, isLoading } =
    useOrdersServiceOrderControllerGetClientOrders(
      { status: statusFilter },
      undefined,
      {
        refetchOnWindowFocus: false,
      },
    );

  const orders = (ordersData as ClientOrderResponseDto[]) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container-custom">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">View and manage your venue bookings</p>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setStatusFilter(undefined)}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  !statusFilter
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Orders
              </button>
              {(
                ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <EmptyState
              title="No orders found"
              description="You haven't made any bookings yet. Start exploring venues!"
              action={{
                label: 'Browse Venues',
                onClick: () =>
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
                  }),
              }}
            />
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="card transition-shadow hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 md:flex-row">
                    {/* Image */}
                    {order.thumbnailURL && (
                      <div className="h-48 w-full shrink-0 overflow-hidden rounded-lg md:h-auto md:w-64">
                        <img
                          src={order.thumbnailURL}
                          alt={order.venue_name}
                          className="size-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {order.venue_name}
                            </h3>
                            <p className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="size-4" />
                              {order.location_name}
                            </p>
                          </div>
                          <StatusBadge status={order.status as any} />
                        </div>

                        <div className="mb-4 space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <span>{formatDate(order.startHour)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            <span>
                              {formatTime(order.startHour)} -{' '}
                              {formatTime(order.endHour)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Price</p>
                          <p className="text-2xl font-bold text-primary">
                            {order.totalPrice.toLocaleString()}đ
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn-outline"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono text-sm">{selectedOrder.order_id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Venue</p>
                <p className="font-semibold">{selectedOrder.venue_name}</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.location_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold">
                  {formatDate(selectedOrder.startHour)}
                </p>
                <p className="text-sm">
                  {formatTime(selectedOrder.startHour)} -{' '}
                  {formatTime(selectedOrder.endHour)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <StatusBadge status={selectedOrder.status as any} size="lg" />
              </div>

              <div>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-3xl font-bold text-primary">
                  {selectedOrder.totalPrice.toLocaleString()}đ
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Points Earned</p>
                <p className="font-semibold">{selectedOrder.points} points</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p>{formatDate(selectedOrder.booking_created_at)}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-outline flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
