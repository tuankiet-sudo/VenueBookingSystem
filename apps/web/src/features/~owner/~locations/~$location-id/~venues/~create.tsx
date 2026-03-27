import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { locationApi, type LocationDetailResponse } from '@/api/location.api';
import { venueApi, type VenueType, CDN_BASE_URL } from '@/api/venue.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { formatCurrency } from '@/data/mock-data';
import handleAxiosError from '@/helpers/handle-axios-error';

export const Route = createFileRoute(
  '/owner/locations/$location-id/venues/create',
)({
  component: CreateVenuePage,
});

interface FormData {
  name: string;
  venueType_id: string;
  floor: string;
  area: string;
  pricePerHour: string;
  images: File[];
}

interface FormErrors {
  [key: string]: string;
}

interface ImagePreview {
  file: File;
  preview: string;
}

export function CreateVenuePage() {
  const navigate = useNavigate();
  const params = useParams({
    from: '/owner/locations/$location-id/venues/create',
  });
  const locationId = params['location-id'];

  const [location, setLocation] = useState<LocationDetailResponse | null>(null);
  const [venueTypes, setVenueTypes] = useState<VenueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    venueType_id: '',
    floor: '',
    area: '',
    pricePerHour: '',
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Fetch location details and venue types on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [locData, typesData] = await Promise.all([
          locationApi.getLocationDetailsById(locationId),
          venueApi.getAllVenueTypes(),
        ]);
        setLocation(locData);
        setVenueTypes(typesData);
      } catch (err) {
        handleAxiosError(err, (message) => {
          setLoadError(message);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locationId]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    }

    if (!formData.venueType_id.trim()) {
      newErrors.venueType_id = 'Venue type is required';
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
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const addImagePreviews = (files: File[]) => {
    const validImages = files.filter((file) => file.type.startsWith('image/'));
    if (validImages.length === 0) {
      setErrors((prev) => ({
        ...prev,
        images: 'Please select valid image files',
      }));
      return;
    }

    const newPreviews = validImages.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validImages],
    }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImagePreviews(Array.from(e.target.files));
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      addImagePreviews(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]!.preview);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = formData.images.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setFormData((prev) => ({
      ...prev,
      images: newFiles,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      let imageUrls: string[] = [];

      // Step 1: Upload images if any
      if (formData.images.length > 0) {
        imageUrls = await Promise.all(
          formData.images.map(async (file) => {
            // Upload each image to storage
            const { url } = await venueApi.uploadImage(file.name);
            await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': file.type,
              },
              body: file,
            });
            // Construct the full CDN URL
            return `${CDN_BASE_URL}/${file.name}`;
          }),
        );
      }

      // Step 2: Create venue with uploaded image URLs
      const createVenueData = {
        locationId,
        name: formData.name,
        venueTypeId: formData.venueType_id,
        floor: formData.floor,
        area: parseFloat(formData.area),
        pricePerHour: parseFloat(formData.pricePerHour),
        ...(imageUrls.length > 0 && { images: imageUrls }),
      };

      await venueApi.createVenue(createVenueData);

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
          <div className="mx-auto flex max-w-4xl items-center justify-center py-12">
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

  if (loadError || !location) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <div className="container-custom flex-1 py-8">
          <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-12 text-center">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {loadError ? 'Error Loading Location' : 'Location not found'}
            </h3>
            <p className="mb-4 text-gray-600">
              {loadError ||
                "The location you're trying to add a venue to doesn't exist."}
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
              {location.name}
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">New Venue</span>
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
              Create New Venue
            </h1>
            <p className="mt-2 text-gray-600">
              Add a new venue to {location.name}
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
              <p className="mt-1 text-xs text-gray-500">
                Must be unique within this location
              </p>
            </div>

            {/* Venue Type */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Venue Type *
              </label>
              <select
                name="venueType_id"
                value={formData.venueType_id}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.venueType_id
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
              {errors.venueType_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.venueType_id}
                </p>
              )}
            </div>

            {/* Selected Venue Type Info */}
            {formData.venueType_id && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                <p className="font-semibold text-blue-900">
                  {
                    venueTypes.find(
                      (t) => t.venue_type_id === formData.venueType_id,
                    )?.name
                  }
                </p>
                <p className="mt-1 text-blue-700">
                  {
                    venueTypes.find(
                      (t) => t.venue_type_id === formData.venueType_id,
                    )?.description
                  }
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
              <div className="relative">
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
              </div>
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
            <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-semibold">📋 Venue Details</p>
              <p className="mt-2">
                All fields are required. The venue name must be unique within
                this location.
              </p>
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <label className="mb-4 block text-sm font-semibold text-gray-900">
                Venue Images
              </label>

              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
              >
                <svg
                  className="mx-auto mb-3 size-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Drag and drop images here
                </p>
                <p className="mb-4 text-xs text-gray-500">or</p>
                <label className="inline-block">
                  <span className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-300">
                    Select Files
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <p className="mt-3 text-xs text-gray-500">
                  Supported formats: JPG, PNG, WebP, GIF (Max 10 MB each)
                </p>
              </div>

              {errors.images && (
                <p className="mt-2 text-sm text-red-600">{errors.images}</p>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    {imagePreviews.length} image
                    {imagePreviews.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                      >
                        <img
                          src={preview.preview}
                          alt={`Preview ${index}`}
                          className="aspect-square w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="rounded-full bg-red-600 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <svg
                              className="size-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute inset-x-1 bottom-1 truncate rounded bg-black/50 px-2 py-1 text-xs text-white">
                          {preview.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                disabled={submitting}
                className="flex-1 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Venue'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
