import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { ownerApi } from '@/api/owner.api';
import { userApi } from '@/api/user.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import storage from '@/helpers/storage';
import { useAuthStore } from '@/stores';

export const Route = createFileRoute('/owner/singup/')({
  beforeLoad: ({ context }) => {
    if (!context.authContext.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: OwnerSignupPage,
});

interface Bank {
  id: string;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

interface FormData {
  bankId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

export function OwnerSignupPage() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const { login } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    bankId: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
  });

  // Fetch banks from VietQR API
  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.vietqr.io/v2/banks');
        const data = await response.json();
        if (data.data) {
          setBanks(data.data);
        }
      } catch (err) {
        console.error('Failed to load banks:', err);
        setErrors({
          submit: 'Failed to load bank information. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.bankId) {
      newErrors.bankId = 'Bank is required';
    }

    if (!formData.accountName) {
      newErrors.accountName = 'Account holder name is required';
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (formData.accountNumber && !/^[0-9]+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must contain only digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Selected bank:', e.target.value);
    const bankName = e.target.value;
    const selected = banks.find((b) => b.name === bankName) || null;
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        bankId: selected.bin,
        bankName: selected.name,
      }));
      setSelectedBank(selected);
    } else {
      setFormData((prev) => ({
        ...prev,
        bankId: '',
        bankName: '',
      }));
      setSelectedBank(null);
    }

    if (errors.bankId) {
      setErrors((prev) => ({
        ...prev,
        bankId: '',
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await ownerApi.ownerSignup({
        bankId: formData.bankId,
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
      });

      storage.setItem('token', res.token);

      // Fetch user profile to get complete user data
      const userProfile = await userApi.getUserProfile();

      // Use login method from auth store
      login(
        {
          accessToken: res.token,
          refreshToken: res.token,
        },
        {
          isAdmin: userProfile.isAdmin,
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          role: res.role.toUpperCase() as 'CLIENT' | 'OWNER' | 'ADMIN',
          avatarURL: userProfile.avatarUrl,
          phoneNo: userProfile.phoneNo,
        },
      );

      // Navigate to owner dashboard
      navigate({ to: '/owner' });
    } catch (err) {
      console.error('Failed to create owner account:', err);
      setErrors({
        submit: 'Failed to create owner account. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="container-custom flex-1 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Become a Venue Owner
            </h1>
            <p className="mt-2 text-gray-600">
              Register your bank information to start listing your venues
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

            {/* Bank Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Bank *
              </label>
              <select
                value={formData.bankName}
                onChange={handleBankChange}
                disabled={loading}
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.bankId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              >
                <option value="">
                  {loading ? 'Loading banks...' : 'Select a bank'}
                </option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
              {errors.bankId && (
                <p className="mt-1 text-sm text-red-600">{errors.bankId}</p>
              )}
            </div>

            {/* Selected Bank Info */}
            {selectedBank && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                {selectedBank.logo && (
                  <img
                    src={selectedBank.logo}
                    alt={selectedBank.name}
                    className="h-8 w-auto"
                  />
                )}
                <div className="text-sm">
                  <p className="font-semibold text-blue-900">
                    {selectedBank.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    Bin: {selectedBank.bin}
                  </p>
                </div>
              </div>
            )}

            {/* Account Holder Name */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                placeholder="Full name as shown on bank account"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.accountName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.accountName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.accountName}
                </p>
              )}
            </div>

            {/* Account Number */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Enter your bank account number"
                className={`w-full rounded-lg border px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.accountNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.accountNumber}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Digits only</p>
            </div>

            {/* Info Box */}
            <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-semibold">📋 Your Information</p>
              <p className="mt-2">
                Your bank account information will be securely stored and used
                for receiving payments from venue bookings.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: '/' })}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loading}
                className="flex-1 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Become an Owner'}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Already an owner?{' '}
              <button
                onClick={async () => {
                  try {
                    const response = await ownerApi.switchToOwner();
                    const userProfile = await userApi.getUserProfile();
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
                    toast.error('Please signup to become an owner first');
                  }
                }}
                className="font-semibold text-primary hover:underline"
              >
                Go to dashboard
              </button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
