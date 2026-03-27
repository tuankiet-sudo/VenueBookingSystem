import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { venueApi } from '@/api/venue.api';
import type { VenueType } from '@/api/venue.api';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/admin/venue-types/')({
  component: VenueTypesListPage,
});

function VenueTypesListPage() {
  const navigate = useNavigate();
  const [venueTypes, setVenueTypes] = useState<VenueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    venueTypeId: string;
    venueTypeName: string;
  }>({ isOpen: false, venueTypeId: '', venueTypeName: '' });

  useEffect(() => {
    fetchVenueTypes();
  }, []);

  const fetchVenueTypes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await venueApi.getAllVenueTypes();
      setVenueTypes(data);
    } catch (err) {
      handleAxiosError(err, (message) => setError(message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // await venueTypeApi.deleteVenueType(deleteDialog.venueTypeId);
      fetchVenueTypes();
      setDeleteDialog({ isOpen: false, venueTypeId: '', venueTypeName: '' });
    } catch (err) {
      handleAxiosError(err, (message) => alert(message));
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
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    Venue Types
                  </h1>
                  <p className="text-gray-600">
                    Manage venue categories and capacities
                  </p>
                </div>
                <button
                  onClick={() => navigate({ to: '/admin/venue-types/create' })}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="size-5" />
                  Create Venue Type
                </button>
              </div>

              {/* Venue Types List */}
              {error ? (
                <div className="card bg-red-50 text-red-800">
                  <p>{error}</p>
                </div>
              ) : venueTypes.length === 0 ? (
                <EmptyState
                  title="No venue types found"
                  description="Create your first venue type to get started"
                  action={{
                    label: 'Create Venue Type',
                    onClick: () =>
                      navigate({ to: '/admin/venue-types/create' }),
                  }}
                />
              ) : (
                <div className="grid gap-6">
                  {venueTypes.map((type) => (
                    <div key={type.venue_type_id} className="card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-bold text-gray-900">
                            {type.name}
                          </h3>
                          <p className="mb-4 text-gray-600">
                            {type.description}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="size-4" />
                            <span>
                              Capacity: {type.min_capacity} -{' '}
                              {type.max_capacity} people
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate({
                                to: `/admin/venue-types/${type.venue_type_id}/edit`,
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
                                venueTypeId: type.venue_type_id,
                                venueTypeName: type.name,
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
        title="Delete Venue Type"
        message={`Are you sure you want to delete "${deleteDialog.venueTypeName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() =>
          setDeleteDialog({ isOpen: false, venueTypeId: '', venueTypeName: '' })
        }
      />

      <Footer />
    </div>
  );
}
