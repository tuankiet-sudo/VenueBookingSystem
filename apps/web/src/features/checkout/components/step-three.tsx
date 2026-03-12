import { useNavigate } from '@tanstack/react-router';

import { formatCurrency } from '@/data/mock-data';
import { useBookingStore } from '@/stores';

interface StepThreeProps {
  bookingId: string;
  venueName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
}

export function StepThree({
  bookingId,
  venueName,
  bookingDate,
  startTime,
  endTime,
  totalAmount,
}: StepThreeProps) {
  console.log('[StepThree] ========== COMPONENT RENDER ==========');
  console.log('[StepThree] Props:', {
    bookingId,
    venueName,
    bookingDate,
    startTime,
    endTime,
    totalAmount,
  });
  const navigate = useNavigate();
  const { clearMetadata } = useBookingStore();

  return (
    <div className="text-center">
      {/* Success Icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="size-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className="mb-2 text-3xl font-bold text-green-600">
        Đặt phòng thành công!
      </h2>
      <p className="mb-8 text-gray-600">
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
      </p>

      {/* Booking Details */}
      <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-gray-200 bg-gray-50 p-6 text-left">
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          Thông tin đặt phòng
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm text-gray-600">Mã đặt phòng:</span>
            <span className="font-mono font-semibold text-gray-900">
              {bookingId}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm text-gray-600">Tên phòng:</span>
            <span className="font-semibold text-gray-900">{venueName}</span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm text-gray-600">Ngày:</span>
            <span className="font-semibold text-gray-900">
              {new Date(bookingDate).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm text-gray-600">Thời gian:</span>
            <span className="font-semibold text-gray-900">
              {startTime} - {endTime}
            </span>
          </div>

          <div className="flex justify-between pt-2">
            <span className="text-sm text-gray-600">Tổng thanh toán:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <span className="font-bold">Lưu ý:</span> Thông tin chi tiết về
          booking đã được gửi đến email của bạn. Vui lòng kiểm tra email để xem
          thông tin đầy đủ.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button
          onClick={() => {
            console.log('[StepThree] Home button clicked, navigating to /');
            clearMetadata();
            navigate({ to: '/' });
          }}
          className="flex w-full items-center justify-center bg-secondary px-8 py-3 text-white sm:w-auto"
        >
          Về trang chủ
        </button>
        <button
          onClick={() => {
            clearMetadata();
            console.log(
              '[StepThree] My bookings button clicked, navigating to /',
            );
            navigate({ to: '/my-orders' });
          }}
          className="btn-primary w-full px-8 py-3 sm:w-auto"
        >
          Xem booking của tôi
        </button>
      </div>
    </div>
  );
}
