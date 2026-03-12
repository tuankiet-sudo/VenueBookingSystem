import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { amenityApi } from '@/api/amenity.api';
import { locationApi } from '@/api/location.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import handleAxiosError from '@/helpers/handle-axios-error';

const CATEGORIES = [
  { value: 'Projector', label: 'Projector' },
  { value: 'Catering', label: 'Catering' },
  { value: 'Audio Set', label: 'Audio Set' },
];

export const Route = createFileRoute(
  '/owner/locations/$location-id/amenity/create',
)({
  component: CreateAmenityPage,
});

interface FormData {
  name: string;
  category: string;
  description: string;
  price: string;
}

interface FormErrors {
  [key: string]: string;
}

function CreateAmenityPage() {
  const navigate = useNavigate();
  const params = useParams({
    from: '/owner/locations/$location-id/amenity/create',
  });
  const locationId = params['location-id'];

  const [location, setLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    description: '',
    price: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const locData = await locationApi.getLocationDetailsById(locationId);
        setLocation(locData);
      } catch (err) {
        handleAxiosError(err, (message) => {
          setError(message);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Amenity name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    const price = parseFloat(formData.price);
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price) || price < 0) {
      newErrors.price = 'Price must be a number greater than or equal to 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await amenityApi.createAmenity({
        locationId,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
      });

      setSuccessMessage('Amenity created successfully!');
      setTimeout(() => {
        navigate({
          to: `/owner/locations/${locationId}`,
        });
      }, 1500);
    } catch (err) {
      handleAxiosError(err, (message) => {
        setErrors({ submit: message });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="container-custom flex-1 py-8">
          <div className="mx-auto flex max-w-2xl items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
              <p className="text-gray-600">Loading location...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="container-custom flex-1 py-8">
          <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-12 text-center">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {error ? 'Error Loading Location' : 'Location not found'}
            </h3>
            <p className="mb-4 text-gray-600">
              {error || "The location you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate({ to: '/owner' })}
              className="rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="container-custom flex-1 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate({ to: '/owner' })}
              className="font-semibold text-primary hover:underline"
            >
              Dashboard
            </button>
            <span className="text-gray-400">/</span>
            <button
              onClick={() => navigate({ to: `/owner/locations/${locationId}` })}
              className="font-semibold text-primary hover:underline"
            >
              {location.name}
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Create Amenity</span>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate({ to: `/owner/locations/${locationId}` })}
              className="mb-4 text-sm font-semibold text-primary hover:underline"
            >
              ← Back to Location
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Amenity
            </h1>
            <p className="mt-2 text-gray-600">
              Add a new amenity to{' '}
              <span className="font-semibold">{location.name}</span>
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  {errors.submit}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
          >
            {/* Amenity Name */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Amenity Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Premium Projector"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.category
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this amenity (e.g., High-Lumen Laser Projector & 200 inch Screen)"
                rows={4}
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 characters
              </p>
            </div>

            {/* Price */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Price (VND) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 500000"
                step="1"
                min="0"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be greater than or equal to 0
              </p>
            </div>

            {/* Info Box */}
            <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">ℹ️ Create New Amenity</p>
              <p className="mt-2">
                Fill in all required fields to create a new amenity. The amenity
                will be created with an active status.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate({ to: `/owner/locations/${locationId}` })
                }
                className="flex-1 rounded-lg border border-gray-300 px-6 py-2 font-bold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Create Amenity</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
