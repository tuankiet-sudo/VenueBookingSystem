DELIMITER $$
CREATE TRIGGER Check_ApplyDiscount
BEFORE INSERT ON applies
FOR EACH ROW
BEGIN
    -- Khai báo biến Discount
    DECLARE v_minPrice DECIMAL(12,2);
    DECLARE v_start DATETIME;
    DECLARE v_end DATETIME;
    DECLARE v_venueTypeId BINARY(16);
    DECLARE v_requiredTier VARCHAR(20);    
    
    -- Khai báo biến Order & Client
    DECLARE v_venueTotal DECIMAL(12,2);   -- Tiền phòng
    DECLARE v_amenityTotal DECIMAL(12,2); -- Tiền tiện nghi
    DECLARE v_originalPrice DECIMAL(12,2);-- Tổng tiền gốc (Phòng + Tiện nghi)
    
    DECLARE v_bookingDate DATETIME;
    DECLARE v_orderVenueType BINARY(16);
    DECLARE v_clientPoints INT;
    DECLARE v_clientTier VARCHAR(20);

    -- 1. Lấy thông tin Mã giảm giá
    SELECT minPrice, startedAt, expiredAt, venueTypeId, membershipTier
    INTO v_minPrice, v_start, v_end, v_venueTypeId, v_requiredTier
    FROM discounts 
    WHERE discount_id = NEW.discount_id;

    -- 2. TÍNH TIỀN PHÒNG (Venue Price)
    SELECT 
        (v.pricePerHour * GREATEST(1, TIMESTAMPDIFF(HOUR, o.startHour, o.endHour))), 
        o.createdAt, 
        v.venueType_id, 
        c.membership_points
    INTO 
        v_venueTotal, 
        v_bookingDate, 
        v_orderVenueType, 
        v_clientPoints
    FROM orders o
    JOIN venues v ON o.venue_loc_id = v.location_id AND o.venueName = v.name
    JOIN clients c ON o.client_id = c.user_id
    WHERE o.order_id = NEW.order_id;

    -- 3. TÍNH TIỀN TIỆN NGHI (Amenity Price)
    -- Cộng tổng giá các tiện nghi đi kèm đơn hàng (Nếu không có thì bằng 0)
    SELECT COALESCE(SUM(a.price), 0)
    INTO v_amenityTotal
    FROM order_amenities oa
    JOIN amenities a ON oa.amenity_name = a.amenity_name AND oa.location_id = a.location_id
    WHERE oa.order_id = NEW.order_id;

    -- 4. TỔNG HỢP GIÁ GỐC
    SET v_originalPrice = v_venueTotal + v_amenityTotal;

    -- 5. Tính hạng thành viên
    SET v_clientTier = Get_Tier(v_clientPoints);

    -- 6. Bắt đầu kiểm tra (Validation Logic)
    
    -- Check 1: Thời gian hiệu lực
    IF v_bookingDate < v_start OR v_bookingDate > v_end THEN
        SIGNAL SQLSTATE '45072' SET MESSAGE_TEXT = 'Error: Discount code is expired or not yet active.';
    END IF;

    -- Check 2: Đơn hàng tối thiểu (So sánh với Tổng Giá Gốc)
    IF v_minPrice IS NOT NULL AND v_originalPrice < v_minPrice THEN
        SIGNAL SQLSTATE '45073' SET MESSAGE_TEXT = 'Error: Order base amount (Venue + Amenities) does not meet the minimum requirement for this discount.';
    END IF;

    -- Check 3: Loại phòng
    IF v_venueTypeId IS NOT NULL AND v_venueTypeId != v_orderVenueType THEN
        SIGNAL SQLSTATE '45074' SET MESSAGE_TEXT = 'Error: Discount code is not applicable for this venue type.';
    END IF;

    -- Check 4: Hạng thành viên
    IF v_requiredTier IS NOT NULL AND v_clientTier != v_requiredTier THEN
        SIGNAL SQLSTATE '45075' SET MESSAGE_TEXT = 'Error: Your membership tier is not eligible for this discount.';
    END IF;

END$$

DELIMITER ;