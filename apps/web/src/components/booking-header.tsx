import { Link, useNavigate } from '@tanstack/react-router';
import { useState, useCallback, memo } from 'react';

import { ownerApi } from '@/api/owner.api';
import { userApi } from '@/api/user.api';
import storage from '@/helpers/storage';
import { useAuthStore } from '@/stores';

export const Header = memo(function Header() {
  console.log('[Header] Component rendering');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, login } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();

  const toggleMenu = useCallback(() => {
    console.log('[Header] toggleMenu called');
    setIsMenuOpen((prev) => !prev);
  }, []);
  const toggleUserMenu = useCallback(
    () => setIsUserMenuOpen((prev) => !prev),
    [],
  );

  return (
    <header className="bg-gradient-hero sticky top-0 z-50 text-white shadow-lg">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <div className="bg-gradient-accent flex size-10 items-center justify-center rounded-lg text-xl font-bold text-gray-900">
              V
            </div>
            <span className="font-['Outfit'] text-xl font-bold md:text-2xl">
              VenueBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="font-medium transition-colors hover:text-orange"
            >
              Home
            </Link>
            <Link
              to="/search"
              search={{
                location: '',
                size: '',
                checkIn: '',
                checkOut: '',
                startTime: '',
                endTime: '',
                capacity: '',
                rooms: 1,
              }}
              className="font-medium transition-colors hover:text-orange"
            >
              Find Venues
            </Link>
            <Link
              to="/my-orders"
              className="font-medium transition-colors hover:text-orange"
            >
              My Bookings
            </Link>
            <Link
              to="/favorites"
              className="font-medium transition-colors hover:text-orange"
            >
              Favorites
            </Link>
            {role === 'OWNER' && (
              <Link
                to="/owner"
                className="font-medium transition-colors hover:text-orange"
              >
                My locations
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            {/* <div className="hidden lg:block">
              <select className="glass-strong cursor-pointer rounded-lg border-0 px-3 py-2 text-sm text-white">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div> */}

            {/* Language Selector
            <div className="hidden lg:block">
              <select className="glass-strong cursor-pointer rounded-lg border-0 px-3 py-2 text-sm text-white">
                <option value="vi">🇻🇳 VI</option>
                <option value="en">🇬🇧 EN</option>
              </select>
            </div> */}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="glass-strong flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:bg-white/20"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <svg
                  className={`size-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
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
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
                <div className="animate-slide-down absolute right-0 mt-2 w-48 rounded-lg bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/my-orders"
                        className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/chat"
                        className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          {/* <MessageSquare className="size-5" /> */}
                          <span>Messages</span>
                          <span className="ml-auto size-2.5 rounded-full border-2 border-white bg-red-500" />
                        </div>
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        Favorites
                      </Link>
                      <Link
                        to="/my-reviews"
                        className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        My Reviews
                      </Link>
                      <>
                        <div
                          onClick={async () => {
                            try {
                              if (user?.role === 'OWNER') {
                                navigate({ to: '/owner' });
                                return;
                              }
                              const response = await ownerApi.switchToOwner();
                              const userProfile =
                                await userApi.getUserProfile();
                              storage.setItem('token', response.token);
                              login(
                                {
                                  accessToken: response.token,
                                  refreshToken: response.token,
                                },
                                {
                                  id: userProfile.id,
                                  isAdmin: userProfile.isAdmin,
                                  email: userProfile.email,
                                  firstName: userProfile.firstName,
                                  lastName: userProfile.lastName,
                                  role: 'OWNER',
                                  avatarURL: userProfile.avatarUrl,
                                  phoneNo: userProfile.phoneNo,
                                },
                              );
                              navigate({ to: '/owner' });
                            } catch {
                              navigate({ to: '/owner/singup' });
                            }
                          }}
                          // to="/owner/singup"
                          className="block w-full cursor-pointer px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          Become an Owner
                        </div>
                      </>
                      {user?.isAdmin === 1 && (
                        <>
                          <div className="bg-purple-50 px-4 py-2">
                            <p className="text-xs font-semibold uppercase text-purple-800">
                              Admin
                            </p>
                          </div>
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            Dashboard
                          </Link>
                          <Link
                            to="/admin/discounts"
                            className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            Discounts
                          </Link>
                          <Link
                            to="/admin/users"
                            className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            Users
                          </Link>
                          <Link
                            to="/admin/venue-types"
                            className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            Venue Types
                          </Link>
                          <Link
                            to="/admin/owner-fees"
                            className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            Owner Fees
                          </Link>
                        </>
                      )}
                      <div className="my-1 border-t border-gray-200" />
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/edit-profile"
                        className="block px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      {isAuthenticated && (
                        <Link
                          to="/"
                          onClick={() => {
                            logout();
                            location.reload();
                          }}
                          className="block px-4 py-2 text-red-600 transition-colors hover:bg-gray-100"
                        >
                          Sign Out
                        </Link>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="glass-strong rounded-lg p-2 md:hidden"
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="animate-slide-down py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="font-medium transition-colors hover:text-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/search"
                search={{
                  location: '',
                  checkIn: '',
                  size: '',
                  checkOut: '',
                  startTime: '',
                  endTime: '',
                  capacity: '',
                  rooms: 1,
                }}
                className="font-medium transition-colors hover:text-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Venues
              </Link>
              <Link
                to="/my-orders"
                className="font-medium transition-colors hover:text-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>
              <Link
                to="/favorites"
                className="font-medium transition-colors hover:text-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                Favorites
              </Link>
              <div className="my-2 border-t border-white/20"></div>
              {/* <div className="flex gap-4">
                <select className="glass-strong flex-1 rounded-lg border-0 px-3 py-2 text-sm text-white">
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
                <select className="glass-strong flex-1 rounded-lg border-0 px-3 py-2 text-sm text-white">
                  <option value="vi">🇻🇳 VI</option>
                  <option value="en">🇬🇧 EN</option>
                </select>
              </div> */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});
