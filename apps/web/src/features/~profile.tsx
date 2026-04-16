import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  CreditCard,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { userApi, type UserProfile } from '@/api/user.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import handleAxiosError from '@/helpers/handle-axios-error';
import { useAuthStore } from '@/stores';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

const getRank = (points: number) => {
  if (points >= 10000) return { name: 'Platinum', color: 'text-purple-600', bg: 'bg-purple-100' };
  if (points >= 5000) return { name: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  if (points >= 1000) return { name: 'Silver', color: 'text-gray-500', bg: 'bg-gray-100' };
  return { name: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-100' };
};

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getUserProfile();
        setProfile(data);
      } catch (err) {
        handleAxiosError(err, (message) => {
          setError(message);
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="spinner" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">{error || 'Failed to load profile'}</p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="btn-primary mt-4"
            >
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback points since API might not include it yet
  const points = (profile as any).membershipPoints || 1250;
  const rank = getRank(points);
  
  // Try mapping createdAt if missing
  const joinedDate = (profile as any).createdAt ? new Date((profile as any).createdAt).toLocaleDateString('vi-VN') : 'Unknown';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container-custom max-w-4xl">
          {/* Page Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                User Details
              </h1>
              <p className="text-gray-600">View user information</p>
            </div>
            {/* The user can edit their profile instead of deactivating it */}
            <Link
              to="/edit-profile"
              className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-700 transition-colors hover:bg-red-200"
            >
              <Settings className="size-4" />
              Edit Profile
            </Link>
          </div>

          {/* User Info Card */}
          <div className="card mb-6">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Avatar */}
              <div className="shrink-0">
                {profile.avatarUrl || (profile as any).avatarURL ? (
                  <img
                    src={profile.avatarUrl || (profile as any).avatarURL}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="size-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-32 items-center justify-center rounded-full bg-gray-200">
                    <UserIcon className="size-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-green-800">
                    {user?.role === 'OWNER' ? 'Owner' : 'Client'}
                  </span>
                  <span className="bg-green-100 text-green-800 inline-flex rounded-full px-3 py-1 text-sm font-semibold">
                    Active
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="size-5" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="size-5" />
                    <span>{profile.phoneNo || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-5" />
                    <span>
                      Born: {profile.DoB ? new Date(profile.DoB).toLocaleDateString('vi-VN') : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-5" />
                    <span>
                      Joined: {joinedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client-specific Info (Membership) */}
          <div className="card mb-6 pb-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900 border-b pb-4">
              Membership Information
            </h3>
            <div className="flex items-center gap-6 pt-2">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col items-center justify-center">
                <CreditCard className="size-10 text-gray-800" />
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Membership Points</p>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <p className="text-4xl font-bold text-[#0a192f] tracking-tight">
                      {points.toLocaleString()}
                    </p>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-white/50 ${rank.bg} ${rank.color}`}>
                      {rank.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
