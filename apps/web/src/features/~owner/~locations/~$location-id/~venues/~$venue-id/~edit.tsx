import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { venueApi, type VenueType, type VenueDetailsResponse } from '@/api/venue.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { formatCurrency } from '@/data/mock-data';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute(
  '/owner/locations/$location-id/venues/$venue-id/edit',
)({
  component: EditVenuePage,
});

interface FormData {
  name: string;
  typeId: string;
  floor: string;
  area: string;
  pricePerHour: string;
}

interface FormErrors {
  [key: string]: string;
}

export function EditVenuePage() {
  const navigate = useNavigate();
  const params = useParams({
    from: '/owner/locations/$location-id/venues/$venue-id/edit',
  });
  const locationId = params['location-id'];
  const venueName = params['venue-id']; // This is the venue name

  const [venue, setVenue] = useState<VenueDetailsResponse | null>(null);
  const [venueTypes, setVenueTypes] = useState<VenueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    typeId: '',
    floor: '',
    area: '',
    pricePerHour: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch venue details and types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [venueData, typesData] = await Promise.all([
          venueApi.getVenueDetails(locationId, venueName),
          venueApi.getAllVenueTypes(),
        ]);

        setVenue(venueData);
        setVenueTypes(typesData);

        // Populate form with venue data
        setFormData({
          name: venueData.venue_name,
          typeId: venueData.venueType_id || '',
          floor: venueData.floor,
          area: venueData.area,
          pricePerHour: venueData.pricePerHour,
        });
      } catch (err) {
        handleAxiosError(err, (message) => {
          setError(message);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locationId, venueName]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    }

    if (!formData.typeId.trim()) {
      newErrors.typeId = 'Venue type is required';
    }

    if (!formData.floor.trim()) {
      newErrors.floor = 'Floor is required';
    }

    const area = parseFloat(formData.area);
    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    } else if (isNaN(area) || area <= 0) {
      newErrors.area = 'Area must be a number greater than 0';
    }

    const price = parseFloat(formData.pricePerHour);
    if (!formData.pricePerHour.trim()) {
      newErrors.pricePerHour = 'Price per hour is required';
    } else if (isNaN(price) || price <= 0) {
      newErrors.pricePerHour = 'Price per hour must be a number greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
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
      const updateData = {
        name: formData.name !== venue?.venue_name ? formData.name : undefined,
        typeId:
          formData.typeId !== venue?.theme_name ? formData.typeId : undefined,
        floor: formData.floor !== venue?.floor ? formData.floor : undefined,
        area:
          parseFloat(formData.area) !== parseFloat(venue?.area || '0')
            ? parseFloat(formData.area)
            : undefined,
        pricePerHour:
          parseFloat(formData.pricePerHour) !==
          parseFloat(venue?.pricePerHour || '0')
            ? parseFloat(formData.pricePerHour)
            : undefined,
      };

      // Remove undefined fields
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined),
      );

      await venueApi.updateVenue(locationId, venueName, cleanData as any);

      // Navigate back to location detail page
      navigate({ to: `/owner/locations/${locationId}` });
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
          <div className="mx-auto flex max-w-2xl items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
              <p className="text-gray-600">Loading venue details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="container-custom flex-1 py-8">
          <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-12 text-center">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {error ? 'Error Loading Venue' : 'Venue not found'}
            </h3>
            <p className="mb-4 text-gray-600">
              {error || "The venue you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate({ to: `/owner/locations/${locationId}` })}
              className="rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary-300"
            >
              Back to Location
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedVenueType = venueTypes.find(
    (t) => t.venue_type_id === formData.typeId,
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="container-custom flex-1 py-8">
        <div className="mx-auto max-w-4xl">
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
              Location
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Edit Venue</span>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate({ to: `/owner/locations/${locationId}` })}
              className="mb-4 text-sm font-semibold text-primary hover:underline"
            >
              ← Back to Location
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Venue</h1>
            <p className="mt-2 text-gray-600">
              Update details for{' '}
              <span className="font-semibold">{venue.venue_name}</span>
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

            {/* Venue Name */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Venue Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Ocean View Room"
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

            {/* Venue Type */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Venue Type *
              </label>
              <select
                name="typeId"
                value={formData.typeId}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.typeId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              >
                <option value="">Select a venue type</option>
                {venueTypes.map((type) => (
                  <option key={type.venue_type_id} value={type.venue_type_id}>
                    {type.name} (Capacity: {type.min_capacity}-
                    {type.max_capacity})
                  </option>
                ))}
              </select>
              {errors.typeId && (
                <p className="mt-1 text-sm text-red-600">{errors.typeId}</p>
              )}
            </div>

            {/* Selected Venue Type Info */}
            {selectedVenueType && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                <p className="font-semibold text-blue-900">
                  {selectedVenueType.name}
                </p>
                <p className="mt-1 text-blue-700">
                  {selectedVenueType.description}
                </p>
                <p className="mt-2 text-xs text-blue-600">
                  Capacity: {selectedVenueType.min_capacity} -{' '}
                  {selectedVenueType.max_capacity} pax
                </p>
              </div>
            )}

            {/* Floor */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Floor *
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                placeholder="e.g., 5th Floor, Ground Floor"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.floor
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.floor && (
                <p className="mt-1 text-sm text-red-600">{errors.floor}</p>
              )}
            </div>

            {/* Area */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Area (m²) *
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="e.g., 120.5"
                step="0.1"
                min="0"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.area
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.area && (
                <p className="mt-1 text-sm text-red-600">{errors.area}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be greater than 0
              </p>
            </div>

            {/* Price Per Hour */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Price Per Hour (VND) *
              </label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleInputChange}
                placeholder="e.g., 2500000"
                step="1"
                min="0"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.pricePerHour
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.pricePerHour && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.pricePerHour}
                </p>
              )}
              {formData.pricePerHour && !errors.pricePerHour && (
                <p className="mt-2 text-sm font-semibold text-green-600">
                  Display price:{' '}
                  {formatCurrency(parseFloat(formData.pricePerHour))}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be greater than 0
              </p>
            </div>

            {/* Info Box */}
            <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">ℹ️ Edit Venue Details</p>
              <p className="mt-2">
                Update the venue information. Changes will be saved when you
                click Save Changes.
              </p>
              {!hasChanges && (
                <p className="mt-2 text-xs italic text-blue-600">
                  No changes made yet.
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate({ to: `/owner/locations/${locationId}` })
                }
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !hasChanges}
                className="flex-1 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
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
