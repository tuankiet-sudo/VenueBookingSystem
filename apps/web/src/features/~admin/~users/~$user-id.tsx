import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  CreditCard,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { adminUserApi, type User } from '@/api/admin-user.api';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/admin/users/$user-id')({
  component: UserDetailPage,
});

const USE_MOCK_DATA = true;

function UserDetailPage() {
  const { 'user-id': userId } = Route.useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockUser: User = {
          id: userId,
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNo: '0901234567',
          avatarURL: 'https://picsum.photos/seed/user1/200/200',
          DoB: '1990-05-15',
          isActive: true,
          isAdmin: false,
          createdAt: '2024-01-15T10:00:00',
          updatedAt: '2024-01-15T10:00:00',
          userType: 'client',
          membershipPoints: 1250,
        };
        setUser(mockUser);
      } else {
        const data = await adminUserApi.getUserDetail(userId);
        setUser(data);
      }
    } catch (err) {
      handleAxiosError(err, (message) => {
        setError(message);
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, userId]);

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setUser({ ...user, isActive: !user.isActive });
      } else {
        await adminUserApi.updateUserStatus(userId, !user.isActive);
        fetchUser();
      }
    } catch (err) {
      handleAxiosError(err, (message) => alert(message));
    }
  };

  const getUserTypeColor = (type?: string) => {
    switch (type) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="card max-w-md text-center">
            <p className="text-red-600">{error || 'User not found'}</p>
            <button
              onClick={() => navigate({ to: '/admin/users' })}
              className="btn-primary mt-4"
            >
              Back to Users
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

      <main className="flex-1 py-8">
        <div className="container-custom">
          <div className="flex gap-8">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="max-w-4xl flex-1">
              {/* Back Button */}
              <button
                onClick={() => navigate({ to: '/admin/users' })}
                className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="size-5" />
                Back to Users
              </button>

              {/* Page Header */}
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    User Details
                  </h1>
                  <p className="text-gray-600">View user information</p>
                </div>
                <button
                  onClick={handleToggleStatus}
                  className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                    user.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {user.isActive ? 'Deactivate User' : 'Activate User'}
                </button>
              </div>

              {/* User Info Card */}
              <div className="card mb-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {user.avatarURL ? (
                      <img
                        src={user.avatarURL}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="size-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-32 items-center justify-center rounded-full bg-gray-200">
                        <UserIcon className="size-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h2>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${getUserTypeColor(user.userType)}`}
                      >
                        {user.userType}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="size-5" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="size-5" />
                        <span>{user.phoneNo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="size-5" />
                        <span>
                          Born: {new Date(user.DoB).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="size-5" />
                        <span>
                          Joined:{' '}
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client-specific Info */}
              {user.userType === 'client' && (
                <div className="card mb-6">
                  <h3 className="mb-4 text-xl font-bold text-gray-900 border-b pb-4">
                    Membership Information
                  </h3>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col items-center justify-center">
                      <CreditCard className="size-10 text-gray-800" />
                    </div>
                    <div className="flex flex-col gap-1 w-full relative">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Membership Points</p>
                      <div className="flex items-center gap-4">
                        <p className="text-4xl font-bold text-[#0a192f] tracking-tight">
                          {user.membershipPoints?.toLocaleString() || 0}
                        </p>
                        {(() => {
                          const points = user.membershipPoints || 0;
                          let rank = { name: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-100' };
                          if (points >= 10000) rank = { name: 'Platinum', color: 'text-purple-600', bg: 'bg-purple-100' };
                          else if (points >= 5000) rank = { name: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100' };
                          else if (points >= 1000) rank = { name: 'Silver', color: 'text-gray-500', bg: 'bg-gray-100' };
                          
                          return (
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-white/50 ${rank.bg} ${rank.color}`}>
                              {rank.name}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Owner-specific Info */}
              {user.userType === 'owner' && user.bankInfo && (
                <div className="card mb-6">
                  <h3 className="mb-4 text-xl font-bold text-gray-900">
                    Bank Account Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-600">Bank Name</p>
                      <p className="font-semibold text-gray-900">
                        {user.bankInfo.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Name</p>
                      <p className="font-semibold text-gray-900">
                        {user.bankInfo.accountName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-mono font-semibold text-gray-900">
                        {user.bankInfo.accountNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bank ID</p>
                      <p className="font-mono font-semibold text-gray-900">
                        {user.bankInfo.bankId}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div className="card">
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  Account Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <span
                      className={`font-semibold ${user.isActive ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Admin Privileges</span>
                    <span
                      className={`font-semibold ${user.isAdmin ? 'text-purple-600' : 'text-gray-600'}`}
                    >
                      {user.isAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(user.updatedAt).toLocaleString('vi-VN')}
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
