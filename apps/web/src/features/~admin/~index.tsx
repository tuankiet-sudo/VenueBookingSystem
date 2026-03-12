import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  Users,
  MapPin,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminSidebar } from '@/components/admin-sidebar';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';

export const Route = createFileRoute('/admin/')({
  beforeLoad: ({ context }) => {
    if (!context.authContext.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: AdminDashboard,
});

const USE_MOCK_DATA = true;

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLocations: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStats({
          totalUsers: 1247,
          totalLocations: 89,
          totalOrders: 3456,
          totalRevenue: 125000000,
          activeUsers: 892,
          pendingOrders: 45,
        });
        setRecentActivities([
          {
            id: 1,
            type: 'user',
            message: 'New user registered: john.doe@example.com',
            time: '5 minutes ago',
          },
          {
            id: 2,
            type: 'order',
            message: 'New order placed: Grand Hall - 2,000,000đ',
            time: '15 minutes ago',
          },
          {
            id: 3,
            type: 'location',
            message: 'New location added: Luxury Event Space',
            time: '1 hour ago',
          },
          {
            id: 4,
            type: 'payment',
            message: 'Payment completed: Invoice #INV-001',
            time: '2 hours ago',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container-custom">
          <div className="flex gap-8">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Overview of system statistics and recent activities
                </p>
              </div>

              {/* Stats Grid */}
              <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Users */}
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalUsers.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-green-600">
                        <TrendingUp className="inline size-4" />{' '}
                        {stats.activeUsers} active
                      </p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-3">
                      <Users className="size-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Total Locations */}
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Locations</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalLocations}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Venues available
                      </p>
                    </div>
                    <div className="rounded-full bg-green-100 p-3">
                      <MapPin className="size-8 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalOrders.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-yellow-600">
                        <Clock className="inline size-4" />{' '}
                        {stats.pendingOrders} pending
                      </p>
                    </div>
                    <div className="rounded-full bg-purple-100 p-3">
                      <ShoppingCart className="size-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="card md:col-span-2 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-4xl font-bold text-primary">
                        {stats.totalRevenue.toLocaleString()}đ
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        All-time earnings
                      </p>
                    </div>
                    <div className="rounded-full bg-orange p-4">
                      <DollarSign className="size-10 text-orange" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="card">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Recent Activities
                </h2>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0"
                    >
                      <div
                        className={`mt-1 size-2 rounded-full ${
                          activity.type === 'user'
                            ? 'bg-blue-500'
                            : activity.type === 'order'
                              ? 'bg-purple-500'
                              : activity.type === 'location'
                                ? 'bg-green-500'
                                : 'bg-orange'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.message}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
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
