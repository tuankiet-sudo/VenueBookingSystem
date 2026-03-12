import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { AmenityData, DiscountData, orderApi } from '@/api/order.api';
import { formatCurrency } from '@/data/mock-data';
import { useBookingStore } from '@/stores';
import { VenueWithDetails } from '@/types/venue.types';

interface StepOneProps {
  venue: VenueWithDetails | null;
  bookingData: {
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  };
  onBookingDataChange: (data: {
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }) => void;
  onNext: () => void;
}

export function StepOne({
  venue,
  bookingData,
  onBookingDataChange,
  onNext,
}: StepOneProps) {
  console.log('[StepOne] ========== COMPONENT RENDER ==========');
  console.log('[StepOne] Props:', {
    venue: venue?.name,
    locationId: venue?.location_id,
    bookingData,
  });

  // Local State
  const [discountInput, setDiscountInput] = useState<DiscountData | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discounts, setDiscounts] = useState<DiscountData[]>([]);
  const [amenities, setAmenities] = useState<AmenityData[]>([]);

  // Store
  const selectedAmenities = useBookingStore((state) => state.selectedAmenities);
  const toggleAmenity = useBookingStore((state) => state.toggleAmenity);
  const applyDiscount = useBookingStore((state) => state.applyDiscount);
  const clearDiscount = useBookingStore((state) => state.clearDiscount);
  const appliedDiscount = useBookingStore((state) => state.appliedDiscount);
  // Removed discountAmount from store - now calculated in useMemo

  console.log('[StepOne] Store state:', {
    selectedAmenities,
    appliedDiscount,
  });

  // Derived Data
  // const availableAmenities = useMemo(() => {
  //   if (!venue) return [];
  //   return getAmenitiesByLocation(venue.location_id);
  // }, [venue]);

  const handleSubmit = (e: React.FormEvent) => {
    console.log('[StepOne] ========== FORM SUBMITTED ==========');
    console.log('[StepOne] Form data:', bookingData);
    e.preventDefault();
    console.log('[StepOne] Calling onNext()');
    onNext();
  };

  const fetchOrderMetadata = useCallback(async () => {
    console.log('[StepOne] fetchOrderMetadata - START');
    console.log('[StepOne] Fetching metadata for:', {
      locationId: venue?.location_id,
      venueName: venue?.name,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
    });

    // Guard: Don't fetch if venue is not loaded yet
    if (!venue || !venue.location_id || !venue.name) {
      console.log('[StepOne] fetchOrderMetadata - SKIP (venue not loaded yet)');
      return;
    }

    try {
      const data = await orderApi.getOrderMetadata(
        venue.location_id,
        venue.name,
        `${bookingData.date} ${bookingData.startTime}`,
        `${bookingData.date} ${bookingData.endTime}`,
      );
      console.log('[StepOne] Metadata fetched successfully:', {
        discountsCount: data.discounts.length,
        amenitiesCount: data.amenities.length,
      });
      setDiscounts(data.discounts);
      setAmenities(data.amenities);
    } catch (error) {
      console.error('[StepOne] Error fetching metadata:', error);
      toast.error('Có lỗi xảy ra khi lấy thông tin mã giảm giá');
    }
  }, [bookingData.date, bookingData.endTime, bookingData.startTime, venue]);

  useEffect(() => {
    console.log(
      '[StepOne] useEffect[fetchOrderMetadata] - Calling fetchOrderMetadata',
    );
    fetchOrderMetadata();
  }, [fetchOrderMetadata]);

  const { basePrice, selectedAmenitiesCost, discountAmount, totalPrice } =
    useMemo(() => {
      console.log('[StepOne] useMemo[pricing] - Calculating prices');
      if (!venue || !bookingData.startTime || !bookingData.endTime) {
        console.log(
          '[StepOne] useMemo[pricing] - Missing venue or time data, returning zeros',
        );
        return {
          basePrice: 0,
          selectedAmenitiesCost: 0,
          discountAmount: 0,
          totalPrice: 0,
        };
      }

      const start = parseInt(bookingData.startTime.split(':')[0]);
      const end = parseInt(bookingData.endTime.split(':')[0]);
      const hours = end - start;
      const basePrice = hours * venue.pricePerHour;

      const selectedAmenitiesCost = amenities
        .filter((a) => selectedAmenities.includes(a.amenity_name))
        .reduce((sum, a) => sum + Number(a.price), 0);

      // Calculate discount amount dynamically based on current base amount
      const currentBaseAmount = basePrice + selectedAmenitiesCost;
      const calculatedDiscountAmount =
        appliedDiscount?.reduce((total, discount) => {
          const discountValue = (currentBaseAmount * discount.percentage) / 100;
          // Apply max discount cap if exists
          const cappedDiscount = discount.maxDiscountPrice
            ? Math.min(discountValue, Number(discount.maxDiscountPrice))
            : discountValue;
          return total + cappedDiscount;
        }, 0) || 0;

      const totalPrice = currentBaseAmount - calculatedDiscountAmount;

      console.log('[StepOne] useMemo[pricing] - Calculated:', {
        hours,
        pricePerHour: venue.pricePerHour,
        basePrice,
        selectedAmenitiesCount: selectedAmenities.length,
        selectedAmenitiesCost,
        currentBaseAmount,
        appliedDiscountsCount: appliedDiscount?.length || 0,
        discountAmount: calculatedDiscountAmount,
        totalPrice,
      });

      return {
        basePrice,
        selectedAmenitiesCost,
        discountAmount: calculatedDiscountAmount,
        totalPrice,
      };
    }, [
      venue,
      bookingData.startTime,
      bookingData.endTime,
      selectedAmenities,
      amenities,
      appliedDiscount, // Changed from discountAmount to appliedDiscount
    ]);

  const handleSelectDiscount = async (discount: DiscountData) => {
    console.log('[StepOne] handleSelectDiscount - START', { discount });
    setIsApplyingDiscount(true);
    try {
      // Calculate base amount for discount validation (venue price + amenities)
      const currentBaseAmount = basePrice + selectedAmenitiesCost;
      console.log('[StepOne] Applying discount:', {
        discount,
        currentBaseAmount,
      });
      const result = await applyDiscount(discount, currentBaseAmount);
      console.log('[StepOne] Discount application result:', result);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('[StepOne] Error applying discount:', error);
      toast.error('Có lỗi xảy ra khi áp dụng mã giảm giá');
    } finally {
      setIsApplyingDiscount(false);
      console.log('[StepOne] handleSelectDiscount - END');
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountInput) return;
    setIsApplyingDiscount(true);
    try {
      // Calculate base amount for discount validation (venue price + amenities)
      const currentBaseAmount = basePrice + selectedAmenitiesCost;
      const result = await applyDiscount(discountInput, currentBaseAmount);
      if (result.success) {
        toast.success(result.message);
        setDiscountInput(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi áp dụng mã giảm giá');
      console.error(error);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  void handleApplyDiscount;

  const handleRemoveDiscount = (discountId: string) => {
    clearDiscount(discountId);
    toast.info('Đã xóa mã giảm giá');
  };

  const handleInputChange = (field: string, value: string | number) => {
    console.log('[StepOne] handleInputChange called:', { field, value });
    onBookingDataChange({
      ...bookingData,
      [field]: value,
    });
  };

  void handleInputChange;

  if (!venue) {
    console.log('[StepOne] No venue data, showing loading');
    return <div>Loading...</div>;
  }

  console.log('[StepOne] Rendering with total price:', totalPrice);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Thông tin đặt phòng
      </h2>

      {/* Venue Info */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 text-lg font-bold text-gray-900">{venue.name}</h3>
        <p className="text-sm text-gray-600">
          {venue.location.name} - {venue.location.city}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Sức chứa: {venue.venueType.maxCapacity} người
        </p>
        <p className="text-sm font-bold text-primary">
          {formatCurrency(venue.pricePerHour)}/giờ
        </p>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ngày đặt phòng
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
              {new Date(bookingData.date).toLocaleDateString('vi-VN')}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Số người
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
              {bookingData.capacity} người
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Giờ bắt đầu
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
              {bookingData.startTime}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Giờ kết thúc
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700">
              {bookingData.endTime}
            </div>
          </div>
        </div>

        {/* Amenities Selection */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 font-bold text-gray-900">Dịch vụ đi kèm</h4>
          <div className="space-y-3">
            {amenities.map((amenity) => (
              <div
                key={amenity.amenity_name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={amenity.amenity_name}
                    checked={selectedAmenities.includes(amenity.amenity_name)}
                    onChange={() => toggleAmenity(amenity.amenity_name)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={amenity.amenity_name}
                    className="text-sm text-gray-700"
                  >
                    <span className="font-medium">{amenity.category}</span>
                    <span className="mx-1">-</span>
                    <span className="text-gray-500">{amenity.description}</span>
                  </label>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(Number(amenity.price))}
                </span>
              </div>
            ))}
            {amenities.length === 0 && (
              <p className="text-sm text-gray-500">
                Không có dịch vụ đi kèm cho địa điểm này.
              </p>
            )}
          </div>
        </div>

        {/* Discount Selection */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 font-bold text-gray-900">Mã giảm giá</h4>
          <div className="space-y-3">
            {discounts.map((discount) => {
              const isApplied =
                appliedDiscount && Array.isArray(appliedDiscount)
                  ? appliedDiscount.some(
                      (d) => d.discount_id === discount.discount_id,
                    )
                  : false;

              // console.log('appliedDiscount:', appliedDiscount);
              // console.log('discount:', discount);
              // console.log('isApplied:', isApplied);
              // const isApplied = appliedDiscount ? appliedDiscount.some(d => d.discount_id === discount.discount_id) : false;
              const currentBaseAmount = basePrice + selectedAmenitiesCost;
              const isEligible =
                currentBaseAmount >= (Number(discount.minPrice) || 0);

              return (
                <div
                  key={discount.discount_id}
                  className={`rounded-lg border-2 p-3 transition-all ${
                    isApplied
                      ? 'border-green-500 bg-green-50'
                      : isEligible
                        ? 'border-gray-200 hover:border-primary'
                        : 'border-gray-200 bg-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {discount.name}
                        </span>
                        {isApplied && (
                          <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                            Đang áp dụng
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {`Giảm ${discount.percentage}%`}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Đơn tối thiểu:{' '}
                        {formatCurrency(
                          discount.minPrice ? Number(discount.minPrice) : 0,
                        )}
                      </p>
                      {!isEligible && (
                        <p className="mt-1 text-xs text-red-500">
                          Chưa đủ điều kiện áp dụng
                        </p>
                      )}
                    </div>
                    <div>
                      {isApplied ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveDiscount(discount.discount_id)
                          }
                          className="rounded bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectDiscount(discount)}
                          disabled={!isEligible || isApplyingDiscount}
                          className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-300 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {isApplyingDiscount ? 'Đang áp dụng...' : 'Chọn'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Summary */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 font-bold text-gray-900">Tổng thanh toán</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Giá thuê phòng</span>
              <span className="font-medium">{formatCurrency(basePrice)}</span>
            </div>
            {selectedAmenitiesCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dịch vụ đi kèm</span>
                <span className="font-medium">
                  {formatCurrency(selectedAmenitiesCost)}
                </span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="">Giảm giá</span>
                <span className="font-medium">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="font-bold text-primary">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full px-6 py-3">
          Tiếp tục
        </button>
      </form>
    </div>
  );
}
