import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { locationApi } from '@/api/location.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute('/owner/locations/$location-id/edit')({
  component: EditLocationPage,
});

function EditLocationPage() {
  const navigate = useNavigate();
  const params = useParams({ from: '/owner/locations/$location-id/edit' });
  const locationId = params['location-id'];

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    ward: '',
    city: '',
    phone: '',
    policy: '',
    mapUrl: '',
    thumbnail: '',
  });
  const [initialFormData, setInitialFormData] = useState(formData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch location details on mount
  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await locationApi.getLocationDetailsById(locationId);
        const newFormData = {
          name: data.name || '',
          description: data.description || '',
          address: data.addrNo || '',
          ward: data.ward || '',
          city: data.city || '',
          phone: data.phoneNo || '',
          policy: data.policy || '',
          mapUrl: data.mapURL || '',
          thumbnail: data.thumbnailURL || '',
        };
        setFormData(newFormData);
        setInitialFormData(newFormData);
      } catch (err) {
        handleAxiosError(err, (message) => {
          setLoadError(message);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationDetails();
  }, [locationId]);

  // Track if form has changes
  useEffect(() => {
    const changed =
      JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasChanges(changed);
  }, [formData, initialFormData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Location name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[0-9()+\-\s]+$/.test(formData.phone))
      newErrors.phone = 'Phone may contain only digits and symbols ()+-';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await locationApi.updateLocation(locationId, {
        name: formData.name,
        description: formData.description,
        addrNo: formData.address,
        ward: formData.ward,
        city: formData.city,
        phoneNo: formData.phone,
        policy: formData.policy,
        mapURL: formData.mapUrl,
        thumbnailURL: formData.thumbnail,
      });
      navigate({ to: '/owner' });
    } catch (err) {
      handleAxiosError(err, (message) => {
        setErrors({ submit: message });
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="container-custom flex-1 py-8">
          <div className="mx-auto flex max-w-3xl items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
              <p className="text-gray-600">Loading location details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="container-custom flex-1 py-8">
          <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-12 text-center">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Error Loading Location
            </h3>
            <p className="mb-4 text-gray-600">{loadError}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate({ to: '/owner' })}
                className="rounded-lg bg-primary px-6 py-2 font-bold text-white"
              >
                Back to Dashboard
              </button>
            </div>
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
        <div className="mx-auto max-w-3xl">
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
              {formData.name || 'Location'}
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Edit Location</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Edit Location</h1>
          <p className="mt-2 text-gray-600">
            Update details for this location.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border border-gray-200 bg-white p-6"
          >
            {errors.submit && (
              <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
                {errors.submit}
              </div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Location Name *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Address *
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Ward
                </label>
                <input
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  City *
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Phone *
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Policy
              </label>
              <textarea
                name="policy"
                value={formData.policy}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Map URL
                </label>
                <input
                  name="mapUrl"
                  value={formData.mapUrl}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Thumbnail URL
                </label>
                <input
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: `/owner` })}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasChanges || submitting}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
