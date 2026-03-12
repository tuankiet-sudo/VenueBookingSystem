import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useFormik } from 'formik';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';

import {
  discountApi,
  type Discount,
  type UpdateDiscountDto,
} from '@/api/discount.api';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/admin/discounts/$edit-id/')({
  component: EditDiscountPage,
});

const USE_MOCK_DATA = true;

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  percentage: Yup.number()
    .required('Percentage is required')
    .min(0, 'Must be at least 0')
    .max(100, 'Must be at most 100'),
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

function EditDiscountPage() {
  const { 'edit-id': discountId } = Route.useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);

  const fetchDiscount = useCallback(async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockDiscount: Discount = {
          discount_id: discountId,
          name: 'Summer Sale 2024',
          percentage: 20,
          maxDiscountPrice: 500000,
          minPrice: 1000000,
          membershipTier: 'GOLD',
          startedAt: '2024-06-01T00:00:00',
          expiredAt: '2024-08-31T23:59:59',
          createdAt: '2024-05-15T10:00:00',
        };
        setDiscount(mockDiscount);
      } else {
        const data = await discountApi.getDiscountById(discountId);
        setDiscount(data);
      }
    } catch (err) {
      handleAxiosError(err, (message) => {
        alert(message);
        navigate({ to: '/admin/discounts' });
      });
    } finally {
      setIsLoading(false);
    }
  }, [discountId, navigate]);

  useEffect(() => {
    fetchDiscount();
  }, [discountId, fetchDiscount]);

  const formik = useFormik<UpdateDiscountDto>({
    enableReinitialize: true,
    initialValues: {
      name: discount?.name || '',
      percentage: discount?.percentage || 10,
      maxDiscountPrice: discount?.maxDiscountPrice,
      minPrice: discount?.minPrice,
      venueTypeId: discount?.venueTypeId,
      membershipTier: discount?.membershipTier || undefined,
      startedAt: discount?.startedAt ? discount.startedAt.slice(0, 16) : '',
      expiredAt: discount?.expiredAt ? discount.expiredAt.slice(0, 16) : '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          navigate({ to: '/admin/discounts' });
        } else {
          await discountApi.updateDiscount(discountId, values);
          navigate({ to: '/admin/discounts' });
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
                onClick={() => navigate({ to: '/admin/discounts' })}
                className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="size-5" />
                Back to Discounts
              </button>

              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  Edit Discount
                </h1>
                <p className="text-gray-600">Update discount information</p>
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

                  {/* Date Range */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Start Date *
                      </label>
                      <input
                        type="datetime-local"
                        {...formik.getFieldProps('startedAt')}
                        className="input-glass"
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
                        className="input-glass"
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
