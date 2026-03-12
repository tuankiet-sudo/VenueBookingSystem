import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/owner/locations/$location-id/venues/__layout',
)({
  component: VenuesLayout,
});

function VenuesLayout() {
  return <Outlet />;
}

export default VenuesLayout;
