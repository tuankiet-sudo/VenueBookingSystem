import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';

import { locationApi } from '@/api/location.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { fetchProvinces } from '@/data/provinces';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/owner/locations/create')({
  component: CreateLocationPage,
});

interface FormData {
  name: string;
  description: string;
  addrNo: string;
  ward: string;
  city: string;
  phoneNo: string;
  policy: string;
  mapURL: string;
  thumbnailURL: string;
}

interface FormErrors {
  [key: string]: string;
}

export function CreateLocationPage() {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<Array<{ name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    addrNo: '',
    ward: '',
    city: '',
    phoneNo: '',
    policy: '',
    mapURL: '',
    thumbnailURL: '',
  });

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(true);
      try {
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (err) {
        console.error('Failed to load provinces:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProvinces();
  }, []);

  // Validate phone number (digits only)
  const validatePhoneNo = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    return /^[0-9]+$/.test(phone);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }

    if (!formData.addrNo.trim()) {
      newErrors.addrNo = 'Address number is required';
    }

    if (!formData.ward.trim()) {
      newErrors.ward = 'Ward is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (formData.phoneNo && !validatePhoneNo(formData.phoneNo)) {
      newErrors.phoneNo = 'Phone number must contain only digits';
    }

    if (!formData.thumbnailURL.trim()) {
      newErrors.thumbnailURL = 'Thumbnail URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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

    setSubmitting(true);
    try {
      // Call the real API to create location
      await locationApi.createLocation({
        name: formData.name,
        description: formData.description || undefined,
        addrNo: formData.addrNo,
        ward: formData.ward,
        city: formData.city,
        policy: formData.policy || undefined,
        phoneNo: formData.phoneNo || undefined,
        mapURL: formData.mapURL,
        thumbnailURL: formData.thumbnailURL,
      });

      // Navigate back to owner dashboard on success
      navigate({ to: '/owner' });
    } catch (err) {
      handleAxiosError(err, (message) => {
        setErrors({ submit: message });
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="container-custom w-full flex-1 py-8 ">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate({ to: '/owner' })}
              className="mb-4 text-sm font-semibold text-primary hover:underline"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Location
            </h1>
            <p className="mt-2 text-gray-600">
              Add a new venue location to your portfolio
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
          >
            {errors.submit && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errors.submit}
              </div>
            )}

            {/* Location Name */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Location Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Grand Hotel Downtown"
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

            {/* Description */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your location..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Address Number */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Address Number *
              </label>
              <input
                type="text"
                name="addrNo"
                value={formData.addrNo}
                onChange={handleInputChange}
                placeholder="e.g., 123"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.addrNo
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.addrNo && (
                <p className="mt-1 text-sm text-red-600">{errors.addrNo}</p>
              )}
            </div>

            {/* Ward */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Ward *
              </label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                placeholder="e.g., My An Ward"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.ward
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.ward && (
                <p className="mt-1 text-sm text-red-600">{errors.ward}</p>
              )}
            </div>

            {/* City */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                City *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.city
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              >
                <option value="">
                  {loading ? 'Loading provinces...' : 'Select a city'}
                </option>
                {provinces.map((prov) => (
                  <option key={prov.name} value={prov.name}>
                    {prov.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                placeholder="e.g., 0123456789"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.phoneNo
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.phoneNo && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Digits only</p>
            </div>

            {/* Cancellation Policy */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Policy
              </label>
              <textarea
                name="policy"
                value={formData.policy}
                onChange={handleInputChange}
                placeholder="e.g., Free cancellation up to 24 hours before event"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Google Map URL */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Google Map URL
              </label>
              <input
                type="url"
                name="mapURL"
                value={formData.mapURL}
                onChange={handleInputChange}
                placeholder="https://maps.google.com/?q=..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Thumbnail URL */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Thumbnail Image URL *
              </label>
              <input
                type="url"
                name="thumbnailURL"
                value={formData.thumbnailURL}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/..."
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.thumbnailURL
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.thumbnailURL && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.thumbnailURL}
                </p>
              )}
              {formData.thumbnailURL && (
                <div className="mt-3 h-40 overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={formData.thumbnailURL}
                    alt="Preview"
                    className="size-full object-cover"
                    onError={() => console.error('Image failed to load')}
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: '/owner' })}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Location'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
