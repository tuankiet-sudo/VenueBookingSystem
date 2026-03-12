import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/owner/locations/$location-id/venues/$venue-id/__layout',
)({
  component: VenueDetailLayout,
});

function VenueDetailLayout() {
  return <Outlet />;
}

export default VenueDetailLayout;
