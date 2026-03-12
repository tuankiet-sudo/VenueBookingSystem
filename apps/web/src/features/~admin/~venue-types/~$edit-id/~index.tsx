import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useFormik } from 'formik';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';

import {
  venueTypeApi,
  type VenueType,
  type UpdateVenueTypeDto,
} from '@/api/venue-type.api';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/admin/venue-types/$edit-id/')({
  component: EditVenueTypePage,
});

const USE_MOCK_DATA = true;

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  minCapacity: Yup.number()
    .required('Min capacity is required')
    .min(1, 'Must be at least 1'),
  maxCapacity: Yup.number()
    .required('Max capacity is required')
    .min(1, 'Must be at least 1')
    .test(
      'is-greater',
      'Max capacity must be greater than or equal to min capacity',
      function (value) {
        const { minCapacity } = this.parent;
        return !minCapacity || !value || value >= minCapacity;
      },
    ),
});

function EditVenueTypePage() {
  const { 'edit-id': venueTypeId } = Route.useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venueType, setVenueType] = useState<VenueType | null>(null);

  const fetchVenueType = useCallback(async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockVenueType: VenueType = {
          venueType_id: venueTypeId,
          name: 'Luxury',
          description: 'High-end venues with premium amenities and services.',
          minCapacity: 50,
          maxCapacity: 200,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        };
        setVenueType(mockVenueType);
      } else {
        const data = await venueTypeApi.getVenueTypeById(venueTypeId);
        setVenueType(data);
      }
    } catch (err) {
      handleAxiosError(err, (message) => {
        alert(message);
        navigate({ to: '/admin/venue-types' });
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, venueTypeId]);

  useEffect(() => {
    fetchVenueType();
  }, [fetchVenueType, venueTypeId]);
  const formik = useFormik<UpdateVenueTypeDto>({
    enableReinitialize: true,
    initialValues: {
      name: venueType?.name || '',
      description: venueType?.description || '',
      minCapacity: venueType?.minCapacity || 1,
      maxCapacity: venueType?.maxCapacity || 10,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          navigate({ to: '/admin/venue-types' });
        } else {
          await venueTypeApi.updateVenueType(venueTypeId, values);
          navigate({ to: '/admin/venue-types' });
        }
      } catch (err) {
        handleAxiosError(err, (message) => alert(message));
      } finally {
        setIsSubmitting(false);
      }
    },
  });

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
            <div className="max-w-3xl flex-1">
              {/* Back Button */}
              <button
                onClick={() => navigate({ to: '/admin/venue-types' })}
                className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="size-5" />
                Back to Venue Types
              </button>

              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  Edit Venue Type
                </h1>
                <p className="text-gray-600">
                  Update venue category information
                </p>
              </div>

              <form onSubmit={formik.handleSubmit} className="card">
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Venue Type Name *
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps('name')}
                      className="input"
                      placeholder="e.g., Luxury, Minimalist, Outdoor"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      {...formik.getFieldProps('description')}
                      className="input"
                      rows={4}
                      placeholder="Describe this venue type..."
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {formik.errors.description}
                        </p>
                      )}
                  </div>

                  {/* Capacity Range */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Minimum Capacity *
                      </label>
                      <input
                        type="number"
                        {...formik.getFieldProps('minCapacity')}
                        className="input"
                        min="1"
                      />
                      {formik.touched.minCapacity &&
                        formik.errors.minCapacity && (
                          <p className="mt-1 text-sm text-red-600">
                            {formik.errors.minCapacity}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Maximum Capacity *
                      </label>
                      <input
                        type="number"
                        {...formik.getFieldProps('maxCapacity')}
                        className="input-glass"
                        min="1"
                      />
                      {formik.touched.maxCapacity &&
                        formik.errors.maxCapacity && (
                          <p className="mt-1 text-sm text-red-600">
                            {formik.errors.maxCapacity}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Capacity Range Preview */}
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Capacity Range:</strong>{' '}
                      {formik.values.minCapacity} - {formik.values.maxCapacity}{' '}
                      people
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate({ to: '/admin/venue-types' })}
                    className="btn-outline flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
