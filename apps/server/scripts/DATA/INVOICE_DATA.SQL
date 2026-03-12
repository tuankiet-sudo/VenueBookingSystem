-- =================================================================================
-- TẠO HÓA ĐƠN (INVOICE) CHO TẤT CẢ CÁC ĐƠN HÀNG ĐÃ HOÀN TẤT
-- =================================================================================

INSERT INTO invoices (
    invoice_id, 
    order_id, 
    amount, 
    status, 
    senderBankAccount, 
    receiverBankAccount, 
    transaction_id, 
    paidOn, 
    description
)
SELECT 
    -- 1. Tạo ID mới cho hóa đơn
    UUID_TO_BIN(UUID()), 
    
    -- 2. Lấy ID đơn hàng
    o.order_id, 
    
    -- 3. Lấy số tiền (đảm bảo > 0 từ dữ liệu mẫu trước đó)
    o.totalPrice, 
    
    -- 4. Trạng thái thành công
    'SUCCEEDED', 
    
    -- 5. Fake tài khoản người gửi (Dựa trên ID khách hàng)
    CONCAT('BANK-', LEFT(HEX(o.client_id), 8)), 
    
    -- 6. Lấy tài khoản thật của Owner (Người nhận tiền)
    -- Join: Order -> Venue -> Location -> Owner
    own.accountNo, 
    
    -- 7. Sinh mã giao dịch giả (VD: TRX-167888...)
    CONCAT('TRX-', UNIX_TIMESTAMP(o.createdAt), '-', LEFT(HEX(o.order_id), 4)), 
    
    -- 8. Thời gian thanh toán: Sau khi tạo đơn 5 phút
    DATE_ADD(o.createdAt, INTERVAL 5 MINUTE), 
    
    -- 9. Nội dung chuyển khoản
    CONCAT('Thanh toan booking tai ', l.name)

FROM orders o
-- Join để lấy thông tin Owner (người nhận tiền)
JOIN venues v ON o.venue_loc_id = v.location_id AND o.venueName = v.name
JOIN locations l ON v.location_id = l.location_id
JOIN owners own ON l.owner_id = own.user_id

WHERE o.status = 'COMPLETED' 
  -- Chỉ tạo nếu đơn hàng này chưa có hóa đơn (tránh trùng lặp nếu chạy 2 lần)
  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.order_id = o.order_id);