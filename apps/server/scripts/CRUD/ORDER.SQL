-- order
DELIMITER $$

    -- Insert Order
CREATE PROCEDURE Order_Insert(
    IN p_id VARCHAR(36),
    IN p_clientId VARCHAR(36),
    IN p_locId VARCHAR(36),
    IN p_venueName VARCHAR(100),
    IN p_start DATETIME,
    IN p_end DATETIME
)
BEGIN
    -- Khai báo biến tính toán
    DECLARE v_pricePerHour DECIMAL(10, 2);
    DECLARE v_hours INT;
    DECLARE v_totalPrice DECIMAL(12, 2);
    DECLARE v_points INT;

    -- =========================================================================
    -- 1. VALIDATION (Kiểm tra dữ liệu đầu vào)
    -- =========================================================================
    
    -- Check thời gian hợp lệ (Kết thúc sau Bắt đầu)
    IF p_end <= p_start THEN
        SIGNAL SQLSTATE '45055' SET MESSAGE_TEXT = 'Error: End time must be after Start time.';
    END IF;

    -- Check quy tắc đặt trước 4 tiếng
    IF p_start < DATE_ADD(NOW(), INTERVAL 4 HOUR) THEN
        SIGNAL SQLSTATE '45056' SET MESSAGE_TEXT = 'Error: Bookings must be made at least 4 hours in advance.';
    END IF;

    -- Check Khách hàng tồn tại
    IF NOT EXISTS (SELECT 1 FROM clients WHERE user_id = UUID_TO_BIN(p_clientId)) THEN
        SIGNAL SQLSTATE '45057' SET MESSAGE_TEXT = 'Error: Client does not exist.';
    END IF;

    -- =========================================================================
    -- 2. CALCULATION (Lấy giá & Tính toán)
    -- =========================================================================
    
    -- Lấy giá phòng từ Database
    SELECT pricePerHour INTO v_pricePerHour
    FROM venues 
    WHERE location_id = UUID_TO_BIN(p_locId) AND name = p_venueName;

    -- Nếu v_pricePerHour là NULL nghĩa là phòng không tồn tại (Thay thế cho check EXISTS cũ)
    IF v_pricePerHour IS NULL THEN
        SIGNAL SQLSTATE '45058' SET MESSAGE_TEXT = 'Error: Venue does not exist.';
    END IF;

    -- Tính số giờ (Làm tròn, tối thiểu 1h)
    SET v_hours = TIMESTAMPDIFF(HOUR, p_start, p_end);
    IF v_hours <= 0 THEN SET v_hours = 1; END IF;

    -- Tính Tổng tiền (Base Price)
    SET v_totalPrice = v_pricePerHour * v_hours;

    -- Tính Điểm (10.000 VND = 1 điểm)
    SET v_points = FLOOR(v_totalPrice / 10000);

    -- =========================================================================
    -- 3. INSERT (Ghi vào DB với giá trị đã tính)
    -- =========================================================================
    INSERT INTO orders (
        order_id, 
        client_id, 
        venue_loc_id, 
        venueName, 
        totalPrice,  -- Sử dụng biến đã tính
        points,      -- Sử dụng biến đã tính
        startHour, 
        endHour, 
        expiredAt
    )
    VALUES (
        UUID_TO_BIN(p_id), 
        UUID_TO_BIN(p_clientId), 
        UUID_TO_BIN(p_locId), 
        p_venueName, 
        v_totalPrice, -- Giá trị thật
        v_points,     -- Giá trị thật
        p_start, 
        p_end, 
        DATE_ADD(NOW(), INTERVAL 15 MINUTE) -- Thời gian giữ đơn (để thanh toán)
    );
END$$
DELIMITER ;

-- Update Order
DELIMITER $$
CREATE PROCEDURE Order_Update(
    IN p_id VARCHAR(36),
    IN p_totalPrice DECIMAL(12,2), -- Truyền NULL nếu không sửa
    IN p_points INT,               -- Truyền NULL nếu không sửa
    IN p_status VARCHAR(20)        -- Truyền NULL nếu không sửa ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
)
BEGIN
    DECLARE v_id BINARY(16);
    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_id = v_id) THEN
        SIGNAL SQLSTATE '45059' SET MESSAGE_TEXT = 'Error: Order does not exist.';
    END IF;

    -- 2. Validate Price (Nếu có truyền vào)
    IF p_totalPrice IS NOT NULL AND p_totalPrice < 0 THEN
        SIGNAL SQLSTATE '45131' SET MESSAGE_TEXT = 'Error: Total Price cannot be negative.';
    END IF;

    -- 3. Validate Points (Nếu có truyền vào)
    IF p_points IS NOT NULL AND p_points < 0 THEN
        SIGNAL SQLSTATE '45132' SET MESSAGE_TEXT = 'Error: Points cannot be negative.';
    END IF;

    -- 4. Validate Status (Nếu có truyền vào)
    -- Đã thêm 'CANCELLED' vào danh sách cho phép
    IF p_status IS NOT NULL AND p_status NOT IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') THEN
        SIGNAL SQLSTATE '45133' SET MESSAGE_TEXT = 'Error: Invalid status value.';
    END IF;

    -- 5. Execute Update (Partial Update)
    -- Cập nhật trực tiếp, bao gồm cả trạng thái CANCELLED
    UPDATE orders 
    SET 
        totalPrice = COALESCE(p_totalPrice, totalPrice),
        points     = COALESCE(p_points, points),
        status     = COALESCE(p_status, status)
    WHERE order_id = v_id;
END$$

CREATE PROCEDURE Order_Cancel(
    IN p_orderId VARCHAR(36),
    IN p_cancelReason TEXT
)
BEGIN
    DECLARE v_orderBin BINARY(16);
    DECLARE v_invoiceBin BINARY(16);
    DECLARE exit handler for sqlexception
    BEGIN
        -- Rollback if any error occurs
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Transaction failed. Order not cancelled.';
    END;

    SET v_orderBin = UUID_TO_BIN(p_orderId);

    -- 1. Validations
    -- Check if Order Exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_id = v_orderBin) THEN
        SIGNAL SQLSTATE '45059' SET MESSAGE_TEXT = 'Error: Order does not exist.';
    END IF;

    -- Optional: Check if Order is already Completed (Cannot cancel a completed order)
    IF EXISTS (SELECT 1 FROM orders WHERE order_id = v_orderBin AND status = 'COMPLETED') THEN
        SIGNAL SQLSTATE '45060' SET MESSAGE_TEXT = 'Error: Cannot cancel a COMPLETED order.';
    END IF;

    -- 2. Start Atomic Transaction
    START TRANSACTION;

        -- A. Update Order Status to CANCELLED
        UPDATE orders 
        SET status = 'CANCELLED'
        WHERE order_id = v_orderBin;

        -- B. Update Invoice Status to FAILED
        -- logic: We find the invoice associated with this order
        -- If no invoice exists (e.g., cancelled before payment created), this simply affects 0 rows, which is fine.
        UPDATE invoices 
        SET 
            status = 'FAILED', 
            description = CONCAT('Order Cancelled. Reason: ', COALESCE(p_cancelReason, 'User Request'))
        WHERE order_id = v_orderBin; 
        -- NOTE: Ensure your 'invoices' table has an 'order_id' column. 
        -- If your relationship is different (e.g. order has invoice_id), you must SELECT the invoice_id first.

    -- 3. Commit Changes
    COMMIT;
    
END$$
DELIMITER ;
