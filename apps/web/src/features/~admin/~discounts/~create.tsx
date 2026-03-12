import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useFormik } from 'formik';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as Yup from 'yup';

import { discountApi, type CreateDiscountDto } from '@/api/discount.api';
import { venueApi, VenueType } from '@/api/venue.api';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/admin/discounts/create')({
  component: CreateDiscountPage,
});

const USE_MOCK_DATA = false;

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  percentage: Yup.number()
    .required('Percentage is required')
    .min(0, 'Must be at least 0')
    .max(100, 'Must be at most 100'),
  membershipTier: Yup.string().nullable(),
  maxDiscountPrice: Yup.number().min(0, 'Must be positive').nullable(),
  minPrice: Yup.number().min(0, 'Must be positive').nullable(),
  startedAt: Yup.string().required('Start date is required'),
  expiredAt: Yup.string()
    .required('End date is required')
    .test(
      'is-after-start',
      'End date must be after start date',
      function (value) {
        const { startedAt } = this.parent;
        return !startedAt || !value || new Date(value) > new Date(startedAt);
      },
    ),
});

function CreateDiscountPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venueTypes, setVenueTypes] = useState<VenueType[]>([]);
  const [isLoadingVenueTypes, setIsLoadingVenueTypes] = useState(true);

  // Fetch venue types on mount
  useEffect(() => {
    const fetchVenueTypes = async () => {
      try {
        const types = await venueApi.getAllVenueTypes();
        setVenueTypes(types);
      } catch (error) {
        console.error('Failed to fetch venue types:', error);
      } finally {
        setIsLoadingVenueTypes(false);
      }
    };

    fetchVenueTypes();
  }, []);

  const formik = useFormik<CreateDiscountDto>({
    initialValues: {
      name: '',
      percentage: 10,
      maxDiscountPrice: undefined,
      minPrice: undefined,
      venueTypeId: undefined,
      membershipTier: undefined,
      startedAt: '',
      expiredAt: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          navigate({ to: '/admin/discounts' });
        } else {
          await discountApi.createDiscount(values);
          navigate({ to: '/admin/discounts' });
        }
      } catch (err) {
        handleAxiosError(err, (message) => alert(message));
      } finally {
        setIsSubmitting(false);
      }
    },
  });

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
                onClick={() => navigate({ to: '/admin/discounts' })}
                className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="size-5" />
                Back to Discounts
              </button>

              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  Create Discount
                </h1>
                <p className="text-gray-600">Add a new discount code</p>
              </div>

              <form onSubmit={formik.handleSubmit} className="card">
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Discount Name *
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps('name')}
                      className="input"
                      placeholder="e.g., Summer Sale 2024"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Percentage */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Discount Percentage (%) *
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps('percentage')}
                      className="input"
                      min="0"
                      max="100"
                    />
                    {formik.touched.percentage && formik.errors.percentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.percentage}
                      </p>
                    )}
                  </div>

                  {/* Max Discount Price */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Max Discount Amount (đ)
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps('maxDiscountPrice')}
                      className="input"
                      placeholder="Optional"
                    />
                    {formik.touched.maxDiscountPrice &&
                      formik.errors.maxDiscountPrice && (
                        <p className="mt-1 text-sm text-red-600">
                          {formik.errors.maxDiscountPrice}
                        </p>
                      )}
                  </div>

                  {/* Min Price */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Minimum Order Price (đ)
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps('minPrice')}
                      className="input"
                      placeholder="Optional"
                    />
                    {formik.touched.minPrice && formik.errors.minPrice && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.minPrice}
                      </p>
                    )}
                  </div>

                  {/* Membership Tier */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Membership Tier
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => (
                        <label key={tier} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formik.values.membershipTier?.includes(
                              tier,
                            )}
                            onChange={(e) => {
                              // const current =
                              //   formik.values.membershipTier || undefined;
                              if (e.target.checked) {
                                formik.setFieldValue('membershipTier', tier);
                              } else {
                                formik.setFieldValue(
                                  'membershipTier',
                                  undefined,
                                );
                              }
                            }}
                            className="size-4"
                          />
                          <span className="text-sm">{tier}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Venue Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Apply to Venue Type
                    </label>
                    {isLoadingVenueTypes ? (
                      <p className="text-sm text-gray-500">
                        Loading venue types...
                      </p>
                    ) : (
                      <select
                        value={formik.values.venueTypeId || ''}
                        onChange={(e) => {
                          formik.setFieldValue(
                            'venueTypeId',
                            e.target.value || undefined,
                          );
                        }}
                        className="input"
                      >
                        <option value="">-- All Venue Types --</option>
                        {venueTypes.map((type) => (
                          <option
                            key={type.venue_type_id}
                            value={type.venue_type_id}
                          >
                            {type.name} (Capacity: {type.min_capacity}-
                            {type.max_capacity})
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Select a venue type or leave empty to apply to all types
                    </p>
                  </div>

                  {/* Date Range */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Start Date *
                      </label>
                      <input
                        type="datetime-local"
                        {...formik.getFieldProps('startedAt')}
                        className="input"
                      />
                      {formik.touched.startedAt && formik.errors.startedAt && (
                        <p className="mt-1 text-sm text-red-600">
                          {formik.errors.startedAt}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        End Date *
                      </label>
                      <input
                        type="datetime-local"
                        {...formik.getFieldProps('expiredAt')}
                        className="input"
                      />
                      {formik.touched.expiredAt && formik.errors.expiredAt && (
                        <p className="mt-1 text-sm text-red-600">
                          {formik.errors.expiredAt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate({ to: '/admin/discounts' })}
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
                    {isSubmitting ? 'Creating...' : 'Create Discount'}
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
