import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Users as UsersIcon, Search, Filter } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  adminUserApi,
  type User,
  type UserFilters,
} from '@/api/admin-user.api';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { EmptyState } from '@/components/empty-state';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/admin/users/')({
  component: UsersListPage,
});

const USE_MOCK_DATA = false;

function UsersListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockUsers: User[] = [
          {
            id: 'user1',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNo: '0901234567',
            DoB: '1990-05-15',
            isActive: true,
            isAdmin: false,
            createdAt: '2024-01-15T10:00:00',
            updatedAt: '2024-01-15T10:00:00',
            userType: 'client',
            membershipPoints: 1250,
          },
          {
            id: 'user2',
            email: 'jane.smith@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNo: '0909876543',
            DoB: '1985-08-20',
            isActive: true,
            isAdmin: false,
            createdAt: '2024-02-10T11:00:00',
            updatedAt: '2024-02-10T11:00:00',
            userType: 'owner',
          },
          {
            id: 'user3',
            email: 'admin@venuebook.com',
            firstName: 'Admin',
            lastName: 'User',
            phoneNo: '0905555555',
            DoB: '1980-01-01',
            isActive: true,
            isAdmin: true,
            createdAt: '2023-12-01T09:00:00',
            updatedAt: '2023-12-01T09:00:00',
            userType: 'admin',
          },
          {
            id: 'user4',
            email: 'inactive@example.com',
            firstName: 'Inactive',
            lastName: 'User',
            phoneNo: '0901111111',
            DoB: '1995-03-10',
            isActive: false,
            isAdmin: false,
            createdAt: '2024-03-01T10:00:00',
            updatedAt: '2024-03-15T10:00:00',
            userType: 'client',
            membershipPoints: 0,
          },
        ];

        // Apply filters
        let filtered = mockUsers;
        if (filters.userType) {
          filtered = filtered.filter((u) => u.userType === filters.userType);
        }
        if (filters.isActive !== undefined) {
          filtered = filtered.filter((u) => u.isActive === filters.isActive);
        }
        if (searchQuery) {
          filtered = filtered.filter(
            (u) =>
              u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              `${u.firstName} ${u.lastName}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
          );
        }
        setUsers(filtered);
      } else {
        const data = await adminUserApi.getAllUsers(filters);
        setUsers(data);
      }
    } catch (err) {
      handleAxiosError(err, (message) => setError(message));
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, filters]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setUsers(
          users.map((u) =>
            u.id === userId ? { ...u, isActive: !currentStatus } : u,
          ),
        );
      } else {
        await adminUserApi.updateUserStatus(userId, !currentStatus);
        fetchUsers();
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
                  User Management
                </h1>
                <p className="text-gray-600">View and manage all users</p>
              </div>

              {/* Filters */}
              <div className="card mb-6">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Search */}
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                      placeholder="Search by email or name..."
                      className="input-glass pl-10"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center gap-2">
                    <Filter className="size-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Type:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilters({})}
                        className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                          !filters.userType
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      {(['client', 'owner', 'admin'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilters({ userType: type })}
                          className={`rounded-lg px-3 py-1 text-sm font-medium capitalize transition-colors ${
                            filters.userType === type
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <button
                    onClick={() =>
                      setFilters({ ...filters, isActive: undefined })
                    }
                    className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                      filters.isActive === undefined
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, isActive: true })}
                    className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                      filters.isActive === true
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, isActive: false })}
                    className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                      filters.isActive === false
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Users Table */}
              {error ? (
                <div className="card bg-red-50 text-red-800">
                  <p>{error}</p>
                </div>
              ) : users.length === 0 ? (
                <EmptyState
                  icon={<UsersIcon className="size-16" />}
                  title="No users found"
                  description="No users match your current filters"
                />
              ) : (
                <div className="card overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="pb-3 text-sm font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-700">
                          Name
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-700">
                          Phone
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-700">
                          Type
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-700">
                          Created
                        </th>
                        <th className="pb-3 text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-4 text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="py-4 text-sm text-gray-900">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {user.phoneNo}
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getUserTypeColor(user.userType)}`}
                            >
                              {user.userType}
                            </span>
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                user.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString(
                              'vi-VN',
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  navigate({ to: `/admin/users/${user.id}` })
                                }
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleStatus(user.id, user.isActive)
                                }
                                className="text-sm text-orange hover:underline"
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
