DELIMITER $$

DROP EVENT IF EXISTS Event_Handler$$

CREATE EVENT Event_Handler
ON SCHEDULE EVERY 1 MINUTE -- Chạy mỗi phút
DO
BEGIN
    -- BƯỚC 1: Xử lý đơn hàng (Order Processing)
    -- =========================================================================
    
    -- 1.1. Trả phòng ngay lập tức khi hết giờ
    -- (Để kết thúc tính tiền và cộng điểm cho khách ngay, không bắt khách chờ)
    UPDATE orders
    SET status = 'COMPLETED'
    WHERE status = 'CONFIRMED' 
      AND endHour < NOW();

    -- 2. XỬ LÝ HỦY ĐƠN TREO & HÓA ĐƠN TREO (Expired Orders)
    -- =========================================================================
    
    -- 2.1. Hủy Invoice trước (Set thành FAILED hoặc CANCELLED tùy ENUM của bạn)
    -- Logic: Tìm các Invoice đang PENDING thuộc về các Order sắp bị hủy
    UPDATE invoices i
    INNER JOIN orders o ON i.order_id = o.order_id
    SET i.status = 'FAILED' 
    WHERE o.status = 'PENDING'      -- Đơn hàng chưa thanh toán
      AND DATE_SUB(o.expiredAt, INTERVAL 13 MINUTE) < NOW() -- <--- SỬA TẠI ĐÂY
      -- AND o.expiredAt < NOW()       -- Đã quá hạn giữ chỗ
      AND i.status = 'PENDING';     -- Hóa đơn cũng đang treo

    -- 2.2. Sau đó mới hủy Order
    UPDATE orders
    SET status = 'CANCELLED'
    WHERE status = 'PENDING' 
      -- AND expiredAt < NOW();
      AND DATE_SUB(expiredAt, INTERVAL 13 MINUTE) < NOW(); -- <--- SỬA TẠI ĐÂY
END$$

DELIMITER ;