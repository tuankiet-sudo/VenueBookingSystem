import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useCallback } from 'react';

import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { mockProvinces } from '@/data/provinces';
import { useLocationsServiceLocationControllerGetAllLocations } from '@/generated/queries/queries';
import { useBookingStore } from '@/stores';

export const Route = createFileRoute('/')({
  component: HomePage,
});

export function HomePage() {
  const navigate = useNavigate();
  const setSearchParams = useBookingStore((state) => state.setSearchParams);

  // Fetch all locations from API
  const { data: locationsData } =
    useLocationsServiceLocationControllerGetAllLocations();

  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [searchData, setSearchData] = useState({
    location: 'Hồ Chí Minh',
    checkIn: tomorrowStr,
    checkOut: '',
    startTime: '09:00',
    endTime: '17:00',
    capacity: '',
    rooms: 1,
  });

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validate
      if (!searchData.location) {
        // console.warn('[HomePage] No location selected');
      }

      // Map capacity to size for API
      const size =
        searchData.capacity === 'Small'
          ? 'Small'
          : searchData.capacity === 'Medium'
            ? 'Medium'
            : searchData.capacity === 'Large'
              ? 'Large'
              : undefined;

      // Save to store
      setSearchParams({
        location: searchData.location,
        checkIn: searchData.checkIn ? new Date(searchData.checkIn) : null,
        checkOut: searchData.checkOut ? new Date(searchData.checkOut) : null,
        startTime: searchData.startTime,
        endTime: searchData.endTime,
        capacity:
          searchData.capacity === 'Small'
            ? 10
            : searchData.capacity === 'Medium'
              ? 50
              : searchData.capacity === 'Large'
                ? 100
                : 1,
        rooms: 1,
      });

      // Navigate to search results page with query params including size
      navigate({
        to: '/search',
        search: {
          ...searchData,
          checkIn: searchData.checkIn ?? '',
          size: size || '', // Ensure size is always a string
        },
      });
    },
    [navigate, searchData, setSearchParams],
  );

  // Get top 10 locations for trending section
  const trendingLocations = locationsData?.slice(0, 10) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-hero relative overflow-hidden text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container-custom section relative z-10">
          <div className="animate-fade-in mx-auto mb-12 max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Find Your Perfect Venue
            </h1>
            <p className="mb-8 text-xl text-white/90 md:text-2xl">
              Book premium event spaces in Ho Chi Minh City's finest hotels
            </p>

            {/* Black Friday Banner */}
            <div className="glass-strong animate-pulse-slow mb-8 inline-block rounded-full px-6 py-3">
              <span className="text-lg font-bold text-orange">
                🎉 Special Offer:{' '}
              </span>
              <span className="text-white">
                Save up to 40% on selected venues!
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="animate-slide-up mx-auto max-w-5xl">
            <form
              onSubmit={handleSearch}
              className="glass-strong rounded-2xl p-6 shadow-2xl md:p-8"
            >
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={searchData.location}
                      onChange={(e) => {
                        console.log(
                          '[HomePage] Location changed:',
                          e.target.value,
                        );
                        setSearchData({
                          ...searchData,
                          location: e.target.value,
                        });
                      }}
                      className="input-glass w-full appearance-none"
                    >
                      <option value="" disabled className="text-gray-500">
                        Select location
                      </option>
                      {mockProvinces.map((province) => (
                        <option
                          key={province.code}
                          value={province.name}
                          className="text-gray-900"
                        >
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/70">
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
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div> */}
                  </div>
                </div>

                {/* Check-in Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Date</label>
                  <input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) =>
                      setSearchData({ ...searchData, checkIn: e.target.value })
                    }
                    className="input-glass"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Capacity
                  </label>
                  <select
                    value={searchData.capacity}
                    onChange={(e) => {
                      console.log(
                        '[HomePage] Capacity changed:',
                        e.target.value,
                      );
                      setSearchData({
                        ...searchData,
                        capacity: e.target.value,
                      });
                    }}
                    className="input-glass w-full appearance-none"
                  >
                    <option value="" disabled className="text-gray-500">
                      Select capacity
                    </option>
                    <option value="Small" className="text-gray-900">
                      Small
                    </option>
                    <option value="Medium" className="text-gray-900">
                      Medium
                    </option>
                    <option value="Large" className="text-gray-900">
                      Large
                    </option>
                  </select>
                </div>

                {/* Start Time */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={searchData.startTime}
                    onChange={(e) => {
                      console.log(
                        '[HomePage] Start time changed:',
                        e.target.value,
                      );
                      setSearchData({
                        ...searchData,
                        startTime: e.target.value,
                      });
                    }}
                    className="input-glass"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={searchData.endTime}
                    onChange={(e) => {
                      console.log(
                        '[HomePage] End time changed:',
                        e.target.value,
                      );
                      setSearchData({ ...searchData, endTime: e.target.value });
                    }}
                    className="input-glass"
                  />
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="btn-accent hover-lift w-full"
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Search
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/80">
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Bookings must be made at least 4 hours in advance</span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Why Choose <span className="text-gradient-primary">VenueBook</span>?
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: (
                  <svg
                    className="size-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: 'Instant Booking',
                description:
                  'Book your venue instantly with real-time availability',
              },
              {
                icon: (
                  <svg
                    className="size-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: 'Best Price Guarantee',
                description: 'We guarantee the best prices for premium venues',
              },
              {
                icon: (
                  <svg
                    className="size-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                title: '2M+ Properties',
                description: 'Choose from millions of venues worldwide',
              },
              {
                icon: (
                  <svg
                    className="size-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ),
                title: '24/7 Support',
                description: 'Professional customer service you can rely on',
              },
            ].map((feature, index) => (
              <div key={index} className="card hover-lift text-center">
                <div className="mb-4 flex justify-center text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      {/* <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-3xl font-bold md:text-4xl">
              Featured <span className="text-gradient-primary">Venues</span>
            </h2>
            <button
              onClick={() => navigate({ to: '/' })}
              className="btn-outline hidden md:inline-flex"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {locationsLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="spinner" />
              </div>
            ) : locationsError ? (
              <div className="col-span-full rounded-lg bg-red-50 p-8 text-center">
                <p className="text-red-600">Failed to load locations</p>
              </div>
            ) : featuredLocations.length === 0 ? (
              <div className="col-span-full rounded-lg bg-gray-100 p-8 text-center">
                <p className="text-gray-600">No locations available</p>
              </div>
            ) : (
              featuredLocations.map((location) => (
                <div
                  key={location.location_id}
                  className="card hover-lift cursor-pointer"
                  onClick={() =>
                  navigate({ to: '/locations/$location-id', params: { 'location-id': location.location_id } })                  }
                >
                  <div className="relative -m-6 mb-4 h-64 overflow-hidden rounded-t-xl">
                    <img
                      src={location.thumbnailURL}
                      alt={location.location_name}
                      className="size-full object-cover"
                    />
                    <div className="glass-strong absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-semibold text-white">
                      ⭐ {parseFloat(location.avgRating as any).toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">
                      {location.location_name}
                    </h3>
                    <p className="mb-2 flex items-center gap-2 text-gray-600">
                      <svg
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {location.addrNo}, {location.ward}, {location.city}
                    </p>
                    <p className="mb-4 text-sm text-gray-500">
                      {location.total_venues} venues • {location.total_reviews}{' '}
                      reviews
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-sm text-gray-500">Starting from</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(location.min_price)}
                        </p>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                      <button className="btn-primary">View Details</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <button
              onClick={() => navigate({ to: '/' })}
              className="btn-outline"
            >
              View All Locations
            </button>
          </div>
        </div>
      </section> */}

      {/* Trending Destinations */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Trending <span className="text-gradient-primary">Locations</span>
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trendingLocations.map((location) => (
              <div
                key={location.location_id}
                className="group relative h-80 cursor-pointer overflow-hidden rounded-2xl"
                onClick={() =>
                navigate({ to: '/locations/$location-id', params: { 'location-id': location.location_id } })                }
              >
                <img
                  src={location.thumbnailURL}
                  alt={location.location_name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="mb-2 text-2xl font-bold">
                    {location.location_name}
                  </h3>
                  <p className="mb-1 text-sm text-white/90">
                    {location.addrNo}, {location.ward}, {location.city}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white/90">
                      {parseFloat(location.avgRating as any).toFixed(1)} •{' '}
                      {location.total_venues} venues
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-hero text-white">
        <div className="container-custom text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Ready to Host Your Event?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            Join thousands of satisfied customers who trust VenueBook for their
            events
          </p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="btn-accent px-8 py-4 text-lg"
          >
            Start Booking Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
