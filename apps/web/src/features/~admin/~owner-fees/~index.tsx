import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Footer } from '@/components/booking-footer';
import { Header } from '@/components/booking-header';
import { formatCurrency } from '@/data/mock-data';
import { useLocationsServiceLocationControllerGetOwnerFees } from '@/generated/queries';
import type { AdminOwnerFeesResponseDto } from '@/generated/requests';
import { useAuthStore } from '@/stores';

export const Route = createFileRoute('/admin/owner-fees/')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để truy cập trang này');
      throw redirect({
        to: '/login',
        search: { redirect: '/admin/owner-fees' },
      });
    }
  },
  component: AdminOwnerFeesPage,
});

function AdminOwnerFeesPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [year, setYear] = useState(currentDate.getFullYear());

  const ownerFeesMutation = useLocationsServiceLocationControllerGetOwnerFees();

  const handleFetchFees = () => {
    ownerFeesMutation.mutate({
      requestBody: {
        month,
        year,
      },
    });
  };

  const fees = (ownerFeesMutation.data as AdminOwnerFeesResponseDto[]) || [];

  // Calculate total service fee only (parse strings to numbers)
  const totalServiceFee = fees.reduce((acc, fee) => {
    return acc + parseFloat(fee.Total_Service_Fee.toString());
  }, 0);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Quản Lý Phí Chủ Sở Hữu
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Theo dõi doanh thu và phí dịch vụ của các chủ sở hữu
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[200px] flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tháng
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[200px] flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Năm
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => currentDate.getFullYear() - i,
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleFetchFees}
                disabled={ownerFeesMutation.isPending}
                className="btn-primary px-8 py-2 disabled:opacity-50"
              >
                {ownerFeesMutation.isPending ? 'Đang tải...' : 'Xem báo cáo'}
              </button>
            </div>
          </div>

          {/* Error State */}
          {ownerFeesMutation.isError && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
              </p>
            </div>
          )}

          {/* Table Section */}
          {fees.length > 0 && (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Owner Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Bank Account
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                        Active Locations
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Gross Revenue
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Total Service Fee
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Net Income
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {fees.map((fee) => (
                      <tr key={fee.Owner_ID} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {fee.Owner_Name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {fee.Owner_ID}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {fee.Bank_Account}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-900">
                          {fee.Active_Locations}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(
                            parseFloat(fee.Gross_Revenue.toString()),
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-orange">
                          {formatCurrency(
                            parseFloat(fee.Total_Service_Fee.toString()),
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-green-600">
                          {formatCurrency(
                            parseFloat(fee.Net_Income.toString()),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-sm font-bold text-gray-900"
                      >
                        TỔNG PHÍ DỊCH VỤ
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-orange">
                        {formatCurrency(totalServiceFee)}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary Card */}
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-600">Tổng Phí Dịch Vụ</p>
                  <p className="mt-2 text-3xl font-bold text-orange">
                    {formatCurrency(totalServiceFee)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Từ {fees.length} chủ sở hữu
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {fees.length === 0 &&
            !ownerFeesMutation.isPending &&
            ownerFeesMutation.isSuccess && (
              <div className="rounded-lg bg-white p-12 text-center shadow">
                <svg
                  className="mx-auto size-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Không có dữ liệu
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Không có báo cáo nào cho tháng {month}/{year}
                </p>
              </div>
            )}

          {/* Initial State */}
          {!ownerFeesMutation.data && !ownerFeesMutation.isPending && (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <svg
                className="mx-auto size-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chọn tháng và năm
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Nhấn "Xem báo cáo" để xem thống kê phí chủ sở hữu
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
