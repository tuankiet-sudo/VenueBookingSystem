import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';

import { locationApi, type LocationResponse } from '@/api/location.api';
import { orderApi, type Order } from '@/api/order.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { formatCurrency } from '@/data/mock-data';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/owner/orders/')({
  component: OwnerOrdersPage,
});

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        badge: 'bg-yellow-100',
      };
    case 'CONFIRMED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' };
    case 'COMPLETED':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        badge: 'bg-green-100',
      };
    case 'CANCELLED':
      return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100' };
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return '⏳';
    case 'CONFIRMED':
      return '✓';
    case 'COMPLETED':
      return '✓✓';
    case 'CANCELLED':
      return '✕';
    default:
      return '○';
  }
};

export function OwnerOrdersPage() {
  // State management
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locData = await locationApi.getOwnerLocations();
        setLocations(locData);
      } catch (err) {
        handleAxiosError(err, (message) => {
          setError(message);
        });
      }
    };

    fetchLocations();
  }, []);

  // Fetch orders whenever filters change
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const orderData = await orderApi.getOwnerOrders({
          locationId: selectedLocationId || undefined,
          status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
          startDate: dateFrom || undefined,
          endDate: dateTo || undefined,
        });
        setOrders(orderData);
      } catch (err) {
        handleAxiosError(err, (message) => {
          setError(message);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [selectedLocationId, statusFilter, dateFrom, dateTo]);

  // Summary stats are calculated from real API data (no additional filtering needed)
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    return { total, pending, completed, cancelled, totalRevenue };
  }, [orders]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="container-custom flex-1 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="mt-2 text-gray-600">
              Manage all bookings and orders for your venues
            </p>
          </div>

          {/* Filters Section */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Filters
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Location Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option
                      key={location.locationId}
                      value={location.locationId}
                    >
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as OrderStatus | 'ALL')
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedLocationId ||
              statusFilter !== 'ALL' ||
              dateFrom ||
              dateTo) && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedLocationId('');
                    setStatusFilter('ALL');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-5">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-yellow-700">Pending</p>
              <p className="mt-1 text-2xl font-bold text-yellow-900">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-green-700">Completed</p>
              <p className="mt-1 text-2xl font-bold text-green-900">
                {stats.completed}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-red-700">Cancelled</p>
              <p className="mt-1 text-2xl font-bold text-red-900">
                {stats.cancelled}
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-blue-700">Gross Revenue</p>
              <p className="mt-1 text-xl font-bold text-blue-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-6 text-center">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : orders.length > 0 ? (
              <>
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
                  <p className="text-sm font-medium text-gray-700">
                    Showing {orders.length} orders
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Venue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Bank Account
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                          Payment Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusColor = getStatusColor(order.status);
                        return (
                          <tr
                            key={order.order_id}
                            className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 text-sm font-semibold text-primary">
                              {order.order_id}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {order.clientFirstName} {order.clientLastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.clientPhoneNo}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {order.venueName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.venueFloor}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <div>
                                <p>
                                  {new Date(order.startHour).toLocaleDateString(
                                    'vi-VN',
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.startHour).toLocaleTimeString(
                                    'vi-VN',
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    },
                                  )}{' '}
                                  -{' '}
                                  {new Date(order.endHour).toLocaleTimeString(
                                    'vi-VN',
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    },
                                  )}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(order.totalPrice)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusColor.badge} ${statusColor.text}`}
                              >
                                <span>{getStatusIcon(order.status)}</span>
                                <span>{order.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {(order.status === 'COMPLETED' ||
                                order.status === 'CONFIRMED') &&
                              order.clientBankAccount ? (
                                <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                                  {order.clientBankAccount}
                                </code>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {(order.status === 'COMPLETED' ||
                                order.status === 'CONFIRMED') &&
                              order.paidAt ? (
                                <div>
                                  <p>
                                    {new Date(order.paidAt).toLocaleDateString(
                                      'vi-VN',
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(order.paidAt).toLocaleTimeString(
                                      'vi-VN',
                                      {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      },
                                    )}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-600">
                  No orders found for the selected filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
