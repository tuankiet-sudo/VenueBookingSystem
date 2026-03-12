import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { discountApi, type Discount } from '@/api/discount.api';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/admin/discounts/')({
  component: DiscountsListPage,
});

const USE_MOCK_DATA = false;

function DiscountsListPage() {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    discountId: string;
    discountName: string;
  }>({ isOpen: false, discountId: '', discountName: '' });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockDiscounts: Discount[] = [
          {
            discount_id: 'disc1',
            name: 'Summer Sale 2024',
            percentage: 20,
            maxDiscountPrice: 500000,
            minPrice: 1000000,
            membershipTier: 'GOLD',
            startedAt: '2024-06-01T00:00:00',
            expiredAt: '2024-08-31T23:59:59',
            createdAt: '2024-05-15T10:00:00',
            isActive: true,
          },
          {
            discount_id: 'disc2',
            name: 'New Year Special',
            percentage: 30,
            maxDiscountPrice: 1000000,
            membershipTier: 'PLATINUM',
            startedAt: '2024-12-20T00:00:00',
            expiredAt: '2025-01-10T23:59:59',
            createdAt: '2024-12-01T10:00:00',
            isActive: false,
          },
          {
            discount_id: 'disc3',
            name: 'Weekend Discount',
            percentage: 15,
            minPrice: 500000,
            startedAt: '2024-01-01T00:00:00',
            expiredAt: '2024-12-31T23:59:59',
            createdAt: '2023-12-15T10:00:00',
            isActive: true,
          },
        ];
        setDiscounts(mockDiscounts);
      } else {
        const res = await discountApi.getAllDiscounts();
        setDiscounts(res);
      }
    } catch (err) {
      handleAxiosError(err, (message) => setError(message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setDiscounts(
          discounts.filter((d) => d.discount_id !== deleteDialog.discountId),
        );
      } else {
        await discountApi.deleteDiscount(deleteDialog.discountId);
        fetchDiscounts();
      }
      setDeleteDialog({ isOpen: false, discountId: '', discountName: '' });
    } catch (err) {
      handleAxiosError(err, (message) => alert(message));
    }
  };

  const isExpired = (expiredAt: string) => {
    return new Date(expiredAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex-1 items-center justify-center">
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
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    Discount Management
                  </h1>
                  <p className="text-gray-600">
                    Create and manage discount codes
                  </p>
                </div>
                <button
                  onClick={() => navigate({ to: '/admin/discounts/create' })}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="size-5" />
                  Create Discount
                </button>
              </div>

              {/* Discounts List */}
              {error ? (
                <div className="card bg-red-50 text-red-800">
                  <p>{error}</p>
                </div>
              ) : discounts.length === 0 ? (
                <EmptyState
                  title="No discounts found"
                  description="Create your first discount to get started"
                  action={{
                    label: 'Create Discount',
                    onClick: () => navigate({ to: '/admin/discounts/create' }),
                  }}
                />
              ) : (
                <div className="grid gap-6">
                  {discounts.map((discount) => (
                    <div key={discount.discount_id} className="card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">
                              {discount.name}
                            </h3>
                            {isExpired(discount.expiredAt) ? (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                                Expired
                              </span>
                            ) : (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                                Active
                              </span>
                            )}
                          </div>

                          <div className="mb-4 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                            <div>
                              <span className="font-semibold">Discount:</span>{' '}
                              {discount.percentage}%
                            </div>
                            <div>
                              <span className="font-semibold">
                                Max Discount:
                              </span>{' '}
                              {discount.maxDiscountPrice
                                ? discount.maxDiscountPrice.toLocaleString()
                                : 'ALL'}
                              đ
                            </div>
                            <div>
                              <span className="font-semibold">Min Price:</span>{' '}
                              {discount.minPrice
                                ? `${discount.minPrice.toLocaleString()} đ`
                                : 'ALL'}
                            </div>
                            <div>
                              <span className="font-semibold">Membership:</span>{' '}
                              {discount.membershipTier || 'ALL'}
                            </div>
                            <div>
                              <span className="font-semibold">
                                Apply to venue type:
                              </span>{' '}
                              {discount.venueTypeName || 'ALL'}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="size-4" />
                              {new Date(discount.startedAt).toLocaleDateString(
                                'vi-VN',
                              )}
                            </div>
                            <span>→</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="size-4" />
                              {new Date(discount.expiredAt).toLocaleDateString(
                                'vi-VN',
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate({
                                to: `/admin/discounts/${discount.discount_id}/edit`,
                              })
                            }
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit2 className="size-5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                discountId: discount.discount_id,
                                discountName: discount.name,
                              })
                            }
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Discount"
        message={`Are you sure you want to delete "${deleteDialog.discountName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() =>
          setDeleteDialog({ isOpen: false, discountId: '', discountName: '' })
        }
      />

      <Footer />
    </div>
  );
}
