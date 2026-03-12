import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';

export const Route = createFileRoute('/owner/locations/__layout')({
  component: LocationsLayout,
});

function LocationsLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="container-custom flex-1 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default LocationsLayout;
