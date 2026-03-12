import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

import { userApi } from '@/api/user.api';
import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import CountdownBar from '@/components/countdown-bar';
import { StepOne } from '@/features/checkout/components/step-one';
import { StepThree } from '@/features/checkout/components/step-three';
import { StepTwo } from '@/features/checkout/components/step-two';
import {
  useOrdersServiceOrderControllerCreate,
  useVenuesServiceVenueControllerPreviewVenue,
} from '@/generated/queries';
import { useBookingStore, useAuthStore } from '@/stores';
import { VenueWithDetails } from '@/types/venue.types';

export const Route = createFileRoute('/checkout/$location-id/$venue-id/')({
  component: CheckoutPage,
});
enum CheckoutStep {
  BOOKING_DETAILS = 1,
  PAYMENT = 2,
  CONFIRMATION = 3,
}

function CheckoutPage() {
  console.log('[CHECKOUT] ========== RENDER START ==========');
  const { 'location-id': locationId, 'venue-id': venueName } =
    Route.useParams();
  console.log('[CHECKOUT] Route params:', { locationId, venueName });
  const navigate = useNavigate();
  const hasValidated = useRef(false);
  console.log('[CHECKOUT] hasValidated.current:', hasValidated.current);
  // Get auth user - FIXED: Use individual selectors instead of object selector
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);
  console.log('[CHECKOUT] Auth state:', { isAuthenticated, userId: user?.id });

  // Get booking data from store - FIXED: Already using individual selectors (correct)
  const searchParams = useBookingStore((state) => state.searchParams);
  const selectedAmenities = useBookingStore((state) => state.selectedAmenities);
  const appliedDiscounts = useBookingStore((state) => state.appliedDiscount);
  const discountAmount = useBookingStore((state) => state.discountAmount);
  console.log('[CHECKOUT] Booking store:', {
    searchParams,
    selectedAmenities,
    discountAmount,
  });
  const [expiredAt, setExpiredAt] = useState<Date>();

  // Fetch venue details from API
  const {
    data: venuePreviewData,
    isLoading: venueLoading,
    error: venueError,
  } = useVenuesServiceVenueControllerPreviewVenue({
    locationId,
    name: decodeURIComponent(venueName),
  });
  console.log('[CHECKOUT] Venue API state:', {
    hasData: !!venuePreviewData,
    isLoading: venueLoading,
    hasError: !!venueError,
  });

  // Self-healing: Fetch real profile if we have a temp ID
  useEffect(() => {
    console.log('[CHECKOUT] useEffect[user] - Running user validation');
    const fetchRealProfile = async () => {
      if (user?.id === 'temp-user-id') {
        console.log(
          '[CHECKOUT] Detected temp-user-id, fetching real profile...',
        );
        try {
          const profile = await userApi.getUserProfile();
          console.log('[CHECKOUT] Real profile fetched:', profile);
          updateUser({
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatarURL: profile.avatarUrl,
          });
        } catch (error) {
          console.error('[CHECKOUT] Failed to fetch real profile:', error);
        }
      }
    };

    if (user) {
      fetchRealProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // FIXED: Removed updateUser from dependencies

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(
    CheckoutStep.BOOKING_DETAILS,
  );
  const [venue, setVenue] = useState<VenueWithDetails | null>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: searchParams.startTime || '',
    endTime: searchParams.endTime || '',
    capacity: searchParams.capacity || 1,
  });
  const [bookingId, setBookingId] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);

  console.log('[CHECKOUT] State:', {
    currentStep,
    hasVenue: !!venue,
    bookingData,
    bookingId,
    totalAmount,
  });

  // Order creation API
  const createOrderMutation = useOrdersServiceOrderControllerCreate({
    onSuccess: (data: any) => {
      console.log('[CheckoutPage] Order created successfully:', data);
      // Backend returns { _id: uuid, expiredTime: date }
      const orderId = data._id || data.orderId || data.id;
      if (!orderId) {
        console.error('[CheckoutPage] No order ID in response:', data);
        toast.error('Lỗi: Không nhận được mã đơn hàng');
        return;
      }
      setBookingId(orderId);
      setExpiredAt(data.expiredAt);
      toast.success('Đơn hàng đã được tạo thành công!');
      setCurrentStep(CheckoutStep.PAYMENT);
    },
    onError: (error: any) => {
      console.error('[CheckoutPage] Order creation failed:', error);
      toast.error('Không thể tạo đơn hàng. Vui lòng thử lại.');
    },
  });

  // Mock user balance - replace with actual user store

  const progressSteps = [
    {
      step: 1,
      title: 'Xác nhận đặt phòng',
      status: currentStep >= 1 ? 'completed' : 'pending',
    },
    {
      step: 2,
      title: 'Thanh toán',
      status: currentStep >= 2 ? 'completed' : 'pending',
    },
    {
      step: 3,
      title: 'Hoàn tất',
      status: currentStep >= 3 ? 'completed' : 'pending',
    },
  ];

  // Load venue data from API and validate
  useEffect(() => {
    console.log('[CHECKOUT] useEffect[venueData] - START', {
      hasValidated: hasValidated.current,
      venueLoading,
      hasVenueData: !!venuePreviewData,
      hasError: !!venueError,
    });

    // Prevent multiple validations
    if (hasValidated.current) {
      console.log('[CHECKOUT] useEffect[venueData] - SKIP (already validated)');
      return;
    }

    if (venueLoading) {
      console.log('[CHECKOUT] useEffect[venueData] - SKIP (still loading)');
      return;
    }

    if (venueError) {
      console.log(
        '[CHECKOUT] useEffect[venueData] - ERROR, navigating to search',
      );
      hasValidated.current = true;
      toast.error('Không tìm thấy venue');
      navigate({
        to: '/search',
        search: {
          location: '',
          checkIn: '',
          checkOut: '',
          startTime: '',
          endTime: '',
          capacity: '',
          size: '',
          rooms: 1,
        },
      });
      return;
    }

    if (venuePreviewData) {
      console.log('[CHECKOUT] useEffect[venueData] - Mapping venue data');
      // Map API response to VenueWithDetails
      const mappedVenue: VenueWithDetails = {
        location_id: venuePreviewData.location_id_uuid,
        name: venuePreviewData.venue_name,
        venueType_id: venuePreviewData.venueType_id,
        floor: venuePreviewData.floor,
        pricePerHour: venuePreviewData.pricePerHour,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
          location_id: venuePreviewData.location_id_uuid,
          owner_id: '',
          name: searchParams.location || 'Location',
          addrNo: '',
          ward: '',
          city: searchParams.location || '',
          avgRating: 0,
          phoneNo: '',
          mapURL: '',
          thumbnailURL: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        venueType: {
          venueType_id: venuePreviewData.venueType_id,
          name: venuePreviewData.theme_name,
          minCapacity: venuePreviewData.minCapacity,
          maxCapacity: venuePreviewData.maxCapacity,
          area: venuePreviewData.area,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        images: [],
        amenities: [],
        avgRating: 0,
        reviewCount: 0,
      };

      console.log('[CHECKOUT] useEffect[venueData] - Setting venue state');
      setVenue(mappedVenue);

      // Validate required data (only once)
      if (
        !searchParams.checkIn ||
        !searchParams.startTime ||
        !searchParams.endTime
      ) {
        console.log(
          '[CHECKOUT] useEffect[venueData] - Missing booking params, redirecting',
        );
        hasValidated.current = true;
        toast.error('Vui lòng chọn thông tin đặt phòng');
        navigate({
          to: '/search',
          search: {
            location: '',
            checkIn: '',
            checkOut: '',
            startTime: '',
            endTime: '',
            capacity: '',
            size: '',
            rooms: 1,
          },
        });
      } else {
        console.log('[CHECKOUT] useEffect[venueData] - All data valid');
      }
    }
    console.log('[CHECKOUT] useEffect[venueData] - END');
  }, [venuePreviewData, venueError, venueLoading, searchParams, navigate]);

  // Initialize booking data from store
  useEffect(() => {
    console.log('[CHECKOUT] useEffect[searchParams] - Syncing booking data');
    // Always try to sync if we have date/time in store
    if (searchParams.checkIn || searchParams.startTime) {
      console.log(
        '[CHECKOUT] useEffect[searchParams] - Updating bookingData state',
      );
      setBookingData((prev) => ({
        ...prev,
        date: searchParams.checkIn
          ? new Date(searchParams.checkIn).toISOString().split('T')[0]
          : prev.date,
        startTime: searchParams.startTime || prev.startTime,
        endTime: searchParams.endTime || prev.endTime,
        capacity: searchParams.capacity || prev.capacity,
      }));
    } else {
      console.log(
        '[CHECKOUT] useEffect[searchParams] - No search params to sync',
      );
    }
  }, [searchParams]);

  // Calculate total amount
  useEffect(() => {
    console.log('[CHECKOUT] useEffect[pricing] - Calculating total');
    if (venue && bookingData.startTime && bookingData.endTime) {
      const start = parseInt(bookingData.startTime.split(':')[0]);
      const end = parseInt(bookingData.endTime.split(':')[0]);
      const hours = end - start;
      const basePrice = hours * venue.pricePerHour;
      const total = basePrice * 1.05; // Add 5% service fee
      console.log('[CHECKOUT] useEffect[pricing] - Setting totalAmount:', {
        hours,
        basePrice,
        total,
      });
      setTotalAmount(total);
    } else {
      console.log(
        '[CHECKOUT] useEffect[pricing] - Missing data for calculation',
      );
    }
  }, [venue, bookingData.startTime, bookingData.endTime]);

  const handleNextStep = useCallback(() => {
    console.log('[CHECKOUT] ========== handleNextStep CALLED ==========');
    console.log('[CHECKOUT] Current step:', currentStep);
    console.log('[CHECKOUT] Booking data:', bookingData);

    if (currentStep === CheckoutStep.BOOKING_DETAILS) {
      // Validate booking data
      console.log('[CHECKOUT] Step 1: Validating booking data');
      if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
        console.log('[CHECKOUT] ❌ Validation failed - missing fields:', {
          hasDate: !!bookingData.date,
          hasStartTime: !!bookingData.startTime,
          hasEndTime: !!bookingData.endTime,
        });
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      console.log('[CHECKOUT] ✓ All required fields present');

      // Check authentication
      console.log('[CHECKOUT] Step 2: Checking authentication');
      if (!isAuthenticated || !user) {
        console.log('[CHECKOUT] ❌ User not authenticated:', {
          isAuthenticated,
          hasUser: !!user,
        });
        toast.error('Vui lòng đăng nhập để đặt phòng');
        navigate({ to: '/login' });
        return;
      }
      console.log('[CHECKOUT] ✓ User authenticated:', user.id);

      // Validate time range
      console.log('[CHECKOUT] Step 3: Validating time range');
      if (bookingData.startTime >= bookingData.endTime) {
        console.log('[CHECKOUT] ❌ Invalid time range:', {
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
        });
        toast.error('Giờ kết thúc phải sau giờ bắt đầu');
        return;
      }
      console.log('[CHECKOUT] ✓ Time range valid');

      // Check venue
      console.log('[CHECKOUT] Step 4: Checking venue');
      if (!venue) {
        console.log('[CHECKOUT] ❌ Venue not found');
        toast.error('Không tìm thấy thông tin venue');
        return;
      }
      console.log('[CHECKOUT] ✓ Venue found:', {
        name: venue.name,
        locationId: venue.location_id,
      });

      // Create order via API
      console.log('[CHECKOUT] Step 5: Creating order via API');
      console.log('[CHECKOUT] Preparing time data...');

      // Properly combine date and time with seconds
      const startTimeWithSeconds = bookingData.startTime.includes(':')
        ? `${bookingData.startTime}:00`
        : bookingData.startTime;
      const endTimeWithSeconds = bookingData.endTime.includes(':')
        ? `${bookingData.endTime}:00`
        : bookingData.endTime;

      const checkInDateTime = new Date(
        `${bookingData.date}T${startTimeWithSeconds}`,
      );
      const checkOutDateTime = new Date(
        `${bookingData.date}T${endTimeWithSeconds}`,
      );

      // Format to ISO 8601 for API (required by @IsDateString() validator)
      const formattedStartTime = checkInDateTime.toISOString();
      const formattedEndTime = checkOutDateTime.toISOString();

      console.log('[CHECKOUT] Time formatting complete:', {
        original: {
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
        },
        iso8601: {
          formattedStartTime,
          formattedEndTime,
        },
        jsObjects: {
          checkInDateTime: checkInDateTime.toString(),
          checkOutDateTime: checkOutDateTime.toString(),
        },
      });

      const orderPayload = {
        clientId: user.id,
        locationId: venue.location_id,
        venueName: venue.name,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        amenityIds: selectedAmenities,
        discountIds: appliedDiscounts
          ? appliedDiscounts.map((discount) => discount.discount_id)
          : undefined,
      };

      console.log('[CHECKOUT] Order payload:', orderPayload);
      console.log('[CHECKOUT] Calling create order mutation...');

      createOrderMutation.mutate({
        requestBody: orderPayload,
      });

      // TODO: After calling this api, you will recieve order id and expiredAt, use the order id to call api create invoice (POST /payment/invoices), and you will get the payment qrcode
    }
  }, [
    currentStep,
    bookingData,
    isAuthenticated,
    user,
    venue,
    selectedAmenities,
    appliedDiscounts,
    createOrderMutation,
    navigate,
  ]);

  const handlePreviousStep = useCallback(() => {
    console.log('[CHECKOUT] ========== handlePreviousStep CALLED ==========');
    console.log('[CHECKOUT] Current step:', currentStep);
    if (currentStep > CheckoutStep.BOOKING_DETAILS) {
      const newStep = currentStep - 1;
      console.log('[CHECKOUT] Moving to previous step:', newStep);
      setCurrentStep(newStep);
      window.scrollTo(0, 0);
    } else {
      console.log('[CHECKOUT] Already at first step, cannot go back');
    }
  }, [currentStep]);

  const handlePaymentSuccess = useCallback(() => {
    console.log('[CHECKOUT] ========== handlePaymentSuccess CALLED ==========');
    console.log('[CHECKOUT] Current step:', currentStep);
    console.log('[CHECKOUT] Moving to CONFIRMATION step');
    setCurrentStep(CheckoutStep.CONFIRMATION);
    window.scrollTo(0, 0);
    toast.success('Thanh toán thành công!');
    console.log('[CHECKOUT] Payment success flow complete');
  }, [currentStep]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      {currentStep === CheckoutStep.PAYMENT && (
        <CountdownBar
          targetDate={
            expiredAt ? expiredAt : new Date(Date.now() + 15 * 60 * 1000)
          }
        />
      )}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Back Button */}
          {currentStep !== CheckoutStep.CONFIRMATION && (
            <button
              onClick={() =>
                navigate({
                  to: '/search',
                  search: {
                    location: '',
                    checkIn: '',
                    checkOut: '',
                    startTime: '',
                    endTime: '',
                    capacity: '',
                    size: '',
                    rooms: 1,
                  },
                })
              }
              className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-primary"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Quay lại</span>
            </button>
          )}

          {/* Page Title */}
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Đặt phòng</h1>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="mx-auto flex w-full max-w-3xl items-center">
              {progressSteps.map((step, index) => (
                <div key={step.step} className="flex flex-1 items-center">
                  {/* Step Circle */}
                  <div className="flex w-full flex-col items-center">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full border-2 font-bold transition-colors ${
                        step.status === 'completed'
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        step.step
                      )}
                    </div>
                    <span className="mt-2 hidden text-sm font-medium text-gray-600 sm:block">
                      {step.title}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 transition-colors ${
                        currentStep > step.step ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
            {currentStep === CheckoutStep.BOOKING_DETAILS && (
              <StepOne
                venue={venue}
                bookingData={bookingData}
                onBookingDataChange={setBookingData}
                onNext={handleNextStep}
              />
            )}

            {currentStep === CheckoutStep.PAYMENT && (
              <StepTwo
                bookingId={bookingId}
                onPaymentSuccess={handlePaymentSuccess}
                onBack={handlePreviousStep}
                handleChangeTotalAmount={(m: number) => {
                  setTotalAmount(m);
                }}
              />
            )}

            {currentStep === CheckoutStep.CONFIRMATION && (
              <StepThree
                bookingId={bookingId}
                venueName={venue?.name || ''}
                bookingDate={bookingData.date}
                startTime={bookingData.startTime}
                endTime={bookingData.endTime}
                totalAmount={totalAmount}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
