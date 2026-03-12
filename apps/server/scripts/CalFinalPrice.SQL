DELIMITER $$
CREATE PROCEDURE Cal_Final_Price(IN p_orderId BINARY(16))
BEGIN
    -- Biến chứa giá trị
    DECLARE v_venuePrice DECIMAL(12,2) DEFAULT 0;
    DECLARE v_amenityPrice DECIMAL(12,2) DEFAULT 0;
    DECLARE v_basePrice DECIMAL(12,2) DEFAULT 0;
    DECLARE v_discountAmount DECIMAL(12,2) DEFAULT 0;
    DECLARE v_finalPrice DECIMAL(12,2) DEFAULT 0;
    
    -- Biến phụ trợ
    DECLARE v_hours INT;
    DECLARE v_pricePerHour DECIMAL(10,2);

    -- 1. TÍNH TIỀN PHÒNG (VENUE PRICE)
    SELECT 
        TIMESTAMPDIFF(HOUR, o.startHour, o.endHour), v.pricePerHour
    INTO v_hours, v_pricePerHour
    FROM orders o
    JOIN venues v ON o.venue_loc_id = v.location_id AND o.venueName = v.name
    WHERE o.order_id = p_orderId;

    IF v_hours <= 0 THEN SET v_hours = 1; END IF;
    SET v_venuePrice = v_pricePerHour * v_hours;

    -- 2. TÍNH TIỀN TIỆN NGHI (AMENITIES PRICE)
    -- Vì bảng order_amenities không lưu giá, ta lấy giá hiện tại từ bảng amenities
    SELECT IFNULL(SUM(a.price), 0) INTO v_amenityPrice
    FROM order_amenities oa
    JOIN amenities a ON oa.location_id = a.location_id 
                    AND oa.amenity_name = a.amenity_name
    WHERE oa.order_id = p_orderId;

    -- >> TỔNG GIÁ GỐC
    SET v_basePrice = v_venuePrice + v_amenityPrice;

    -- 3. TÍNH TỔNG TIỀN GIẢM GIÁ (DISCOUNTS)
    -- Logic: Cộng dồn tất cả số tiền được giảm từ các mã đã áp dụng
    -- Mỗi mã giảm: (BasePrice * % / 100), nhưng không quá maxDiscountPrice
    SELECT IFNULL(SUM(
        LEAST(
            (v_basePrice * d.percentage / 100), -- Số tiền giảm theo %
            IFNULL(d.maxDiscountPrice, 9999999999) -- Nếu max là NULL thì coi như không giới hạn
        )
    ), 0) INTO v_discountAmount
    FROM applies ap
    JOIN discounts d ON ap.discount_id = d.discount_id
    WHERE ap.order_id = p_orderId;

    -- 4. TÍNH GIÁ CUỐI CÙNG & ĐIỂM
    SET v_finalPrice = v_basePrice - v_discountAmount;

    -- Ràng buộc: Không được âm
    IF v_finalPrice < 0 THEN 
        SET v_finalPrice = 0; 
    END IF;

    -- 5. UPDATE VÀO BẢNG ORDERS
    UPDATE orders
    SET 
        totalPrice = v_finalPrice,
        points = FLOOR(v_finalPrice / 10000) -- Cập nhật luôn điểm
    WHERE order_id = p_orderId;

END$$

DELIMITER ;