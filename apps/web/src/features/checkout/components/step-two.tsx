import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import { orderApi } from '@/api/order.api';
import { formatCurrency } from '@/data/mock-data';
import { usePaymentsServicePaymentControllerCreateInvoice } from '@/generated/queries';
import { useBookingStore } from '@/stores';

interface StepTwoProps {
  bookingId: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
  handleChangeTotalAmount: (m: number) => void;
}

export function StepTwo({
  bookingId,
  onPaymentSuccess,
  onBack,
  handleChangeTotalAmount,
}: StepTwoProps) {
  console.log('[StepTwo] Component rendering');
  const { clearMetadata } = useBookingStore();
  const [invoiceId, setInvoiceId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(''); // QR code URL from API
  // const [countdown, setCountdown] = useState(100); // 100 seconds countdown
  // void countdown;
  const invoiceCreatedRef = useRef(false); // Track if invoice was created
  const [totalAmount, setTotalAmount] = useState(0);

  // Create invoice mutation
  const createInvoiceMutation =
    usePaymentsServicePaymentControllerCreateInvoice({
      onSuccess: (data: any) => {
        console.log('[StepTwo] Invoice created:', data);
        // Extract invoice ID and QR code URL
        const qrUrl = data.url || ''; // API returns QR URL in _id field
        const invId = data.invoice_id || data.id || 'INV_' + Date.now();
        setTotalAmount(data.totalPrice);
        handleChangeTotalAmount(data.totalPrice);
        setQrCodeUrl(qrUrl);
        setInvoiceId(invId);
        console.log('[StepTwo] QR Code URL:', qrUrl);
        console.log('[StepTwo] Invoice ID:', invId);
        toast.success('Hóa đơn đã được tạo!');
      },
      onError: (error: any) => {
        console.error('[StepTwo] Invoice creation failed:', error);
        toast.error('Không thể tạo hóa đơn');
      },
    });

  // Complete payment mutation
  // const completePaymentMutation =
  //   usePaymentsServicePaymentControllerCompleteInvoicePayment({
  //     onSuccess: (data: any) => {
  //       console.log('[StepTwo] Payment completed:', data);
  //       toast.success('Thanh toán thành công!');
  //       onPaymentSuccess();
  //     },
  //     onError: (error: any) => {
  //       console.error('[StepTwo] Payment completion failed:', error);
  //       toast.error('Không thể hoàn tất thanh toán');
  //     },
  //   });

  // Create invoice on mount - ONCE
  useEffect(() => {
    if (bookingId && !invoiceCreatedRef.current) {
      console.log('[StepTwo] Creating invoice for booking:', bookingId);
      invoiceCreatedRef.current = true; // Mark as created
      createInvoiceMutation.mutate({
        requestBody: {
          orderId: bookingId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]); // Removed createInvoiceMutation from deps

  // Auto-complete payment after countdown (simulating QR payment)
  // useEffect(() => {
  //   console.log('[StepTwo] useEffect[countdown] - START', { invoiceId });
  //   console.log('[StepTwo] Setting up countdown timer');
  //   const timer = setInterval(() => {
  //     setCountdown((prev) => {
  //       if (prev <= 1) {
  //         console.log(
  //           '[StepTwo] Countdown complete (0 seconds), completing payment',
  //         );
  //         console.log('[StepTwo] Invoice ID:', invoiceId);
  //         clearInterval(timer);

  //         // Complete payment via API
  //         if (invoiceId) {
  //           console.log(
  //             '[StepTwo] Completing payment with invoice:',
  //             invoiceId,
  //           );
  //           completePaymentMutation.mutate({
  //             requestBody: {
  //               id: invoiceId,
  //               transactionId: 'TXN_' + Date.now(),
  //               senderBank: 'User Bank',
  //               receiverBank: 'Venue Bank',
  //               description: `Payment for booking ${bookingId}`,
  //             },
  //           });
  //         } else {
  //           console.log(
  //             '[StepTwo] No invoice ID, calling onPaymentSuccess fallback',
  //           );
  //           // Fallback if invoice not created yet
  //           onPaymentSuccess();
  //         }
  //         return 0;
  //       }
  //       // Only log every 10 seconds to avoid spam
  //       if (prev % 10 === 0) {
  //         console.log('[StepTwo] Countdown:', prev, 'seconds remaining');
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => {
  //     console.log('[StepTwo] useEffect[countdown] - CLEANUP, clearing timer');
  //     clearInterval(timer);
  //   };
  // }, [invoiceId, bookingId, completePaymentMutation, onPaymentSuccess]);

  setTimeout(async () => {
    try {
      await orderApi.completePayment(bookingId, invoiceId);
      onPaymentSuccess();
    } catch (error) {
      console.error('Error calling API:', error);
    }
  }, 32000);

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
        Thanh toán
      </h2>

      {/* Payment Method Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary/5 px-6 py-3">
          <svg
            className="size-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <span className="text-lg font-bold text-primary">Chuyển khoản</span>
          <span className="text-sm text-gray-600">Qua ngân hàng</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - QR Code */}
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
          <h3 className="mb-6 text-xl font-bold text-gray-900">
            Quét mã QR để thanh toán
          </h3>

          {/* QR Code Container */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 animate-pulse rounded-2xl bg-gradient-to-r from-primary/20 to-yellow/20 blur-xl"></div>
            <div className="relative rounded-2xl border-4 border-primary bg-white p-4 shadow-xl">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code Thanh Toán"
                  className="size-72 rounded-lg"
                  onError={(e) => {
                    console.error('[StepTwo] QR code image failed to load');
                    e.currentTarget.src = '/example_qr.png'; // Fallback
                  }}
                />
              ) : (
                <div className="flex size-72 items-center justify-center rounded-lg bg-gray-100">
                  <div className="text-center">
                    <div className="mx-auto mb-2 size-12 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-600">Đang tạo mã QR...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="max-w-sm text-center text-sm text-gray-600">
            Sử dụng{' '}
            <span className="font-bold text-primary">ứng dụng ngân hàng</span>{' '}
            để quét mã QR và thanh toán
          </p>
        </div>

        {/* Right Column - Instructions & Summary */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
            <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <svg
                className="size-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Chi tiết thanh toán
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng tiền</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(Number(totalAmount))}
                </span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    Tổng thanh toán
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(Number(totalAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
            <h5 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <svg
                className="size-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Hướng dẫn chuyển khoản:
            </h5>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  1
                </span>
                <span>Mở ứng dụng ngân hàng trên điện thoại</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  2
                </span>
                <span>Chọn chức năng quét mã QR</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  3
                </span>
                <span>Quét mã QR bên trái</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  4
                </span>
                <span>Kiểm tra thông tin và xác nhận thanh toán</span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  5
                </span>
                <span>Chờ hệ thống xác nhận (5-10 phút)</span>
              </li>
            </ol>
          </div>

          {/* Warning Note */}
          <div className="rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange p-4 shadow-lg">
            <div className="flex gap-3">
              <svg
                className="size-6 shrink-0 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm text-yellow-800">
                <span className="font-bold">Lưu ý:</span> Vui lòng không thay
                đổi nội dung chuyển khoản để hệ thống có thể xác nhận tự động.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={async () => {
            console.log('[StepTwo] Back button clicked');
            await orderApi.cancelOrder(bookingId, invoiceId);
            toast.success('Cancel order success');
            clearMetadata();
            onBack();
          }}
          className="btn-primary px-8 py-3 shadow-md transition-all hover:shadow-lg"
        >
          Huỷ thanh toán
        </button>

        {/* <button
          onClick={async () => {
            console.log('[StepTwo] Manual payment confirmation button clicked');
            await orderApi.completePayment(bookingId, invoiceId);
            onPaymentSuccess();
          }}
          className="btn-primary px-8 py-3 shadow-md transition-all hover:shadow-lg"
        >
          Đã thanh toán →
        </button> */}
      </div>
    </div>
  );
}
