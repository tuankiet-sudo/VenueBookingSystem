DELIMITER //
CREATE PROCEDURE GetOwnerOrders (
    IN p_owner_id BINARY(16),
    IN p_status VARCHAR(20),  -- Pass NULL to see ALL orders
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_offset INT;
    
    -- Pagination Logic
    SET p_page = IF(p_page < 1, 1, p_page);
    SET p_limit = IF(p_limit < 1, 10, p_limit);
    SET v_offset = (p_page - 1) * p_limit;

    SELECT 
        BIN_TO_UUID(o.order_id) AS order_id,
        o.status,
        o.totalPrice,
        o.startHour,
        o.endHour,
        o.createdAt AS bookingDate,
        o.points,
        
        -- Venue Details
        v.name AS venue_name,
        v.floor,
        
        -- Location Details
        l.name AS location_name,
        l.city,
        l.addrNo,
        
        -- Client ID
        BIN_TO_UUID(o.client_id) AS client_id

    FROM orders o
    INNER JOIN venues v ON o.venue_loc_id = v.location_id AND o.venueName = v.name
    INNER JOIN locations l ON v.location_id = l.location_id
    
    WHERE l.owner_id = p_owner_id
    -- Standard Filter: If p_status is NULL, ignore this check. If not NULL, check equality.
    AND (p_status IS NULL OR o.status = p_status)
    
    ORDER BY o.createdAt DESC
    LIMIT p_limit OFFSET v_offset;
END //
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE getOrdersForOwner(
    IN p_ownerId VARCHAR(36),
    IN p_locationId VARCHAR(36),
    IN p_orderStatus VARCHAR(20),
    IN p_startTime DATETIME,
    IN p_endTime DATETIME
)
BEGIN
  SELECT
    BIN_TO_UUID(o.order_id) AS order_id,
    o.status AS order_status,
    o.startHour AS start_time,
    o.endHour AS end_time,
    o.totalPrice AS total_price,
    l.name AS location_name,
    u.firstName AS client_first_name,
    u.lastName AS client_last_name,
    u.phoneNo AS client_phone,
    i.senderBankAccount AS client_bank_account,
    i.paidOn AS payment_date
  FROM orders o
  JOIN users u ON o.client_id = u.id
  JOIN locations l ON o.venue_loc_id = l.location_id
  JOIN invoices i ON o.order_id = i.order_id
  WHERE l.owner_id = UUID_TO_BIN(p_ownerId)
    AND (p_locationId IS NULL OR l.location_id = UUID_TO_BIN(p_locationId))
    AND (p_orderStatus IS NULL OR o.status = p_orderStatus)
    AND (p_startTime IS NULL OR o.startHour >= p_startTime)
    AND (p_endTime IS NULL OR o.endHour <= p_endTime)
  ORDER BY o.startHour DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE Client_GetOrders(
    IN p_clientId VARCHAR(36), -- ID khách hàng
    IN p_status VARCHAR(20)    -- Trạng thái muốn lọc (Truyền NULL để lấy tất cả)
)
BEGIN
    SELECT 
        -- Thông tin Đơn hàng
        BIN_TO_UUID(o.order_id) AS order_id,
        o.status,
        o.totalPrice,
        o.points,
        o.startHour,
        o.endHour,
        o.createdAt AS booking_created_at,
        
        -- Thông tin Phòng (Venue)
        v.name AS venue_name,
        v.floor,
        v.pricePerHour,
        
        -- Thông tin Loại phòng (Type/Theme)
        vt.name AS venue_theme, -- VD: Luxury, Minimalist...,
        vt.minCapacity,
        vt.maxCapacity,
        
        -- Thông tin Địa điểm (Location)
        l.name AS location_name,
        l.addrNo,
        l.ward,
        l.city,
        l.thumbnailURL
        
    FROM orders o
    -- Join với Venue để lấy thông tin phòng
    JOIN venues v ON o.venue_loc_id = v.location_id AND o.venueName = v.name
    -- Join với Location để lấy địa chỉ
    JOIN locations l ON v.location_id = l.location_id
    -- Join với Type để lấy Theme
    LEFT JOIN venue_types vt ON v.venueType_id = vt.venueType_id
    
    WHERE 
        -- 1. Lọc theo khách hàng
        o.client_id = UUID_TO_BIN(p_clientId)
        
        -- 2. Lọc theo trạng thái (Nếu p_status NULL thì bỏ qua điều kiện này -> Lấy hết)
        AND (p_status IS NULL OR o.status = p_status)
        
    -- Sắp xếp: Đơn mới nhất lên đầu
    ORDER BY o.createdAt DESC;
END$$

CREATE PROCEDURE GetInvoiceCreateData(
    IN in_orderId VARCHAR(36)
)
BEGIN
    SELECT 
        -- Order Information
        ord.totalPrice as totalPrice,
        
        -- Owner Information
        -- Converting Binary ID back to String for readability
        BIN_TO_UUID(own.user_id) AS owner_id, 
        own.bankId as bankId,
        own.bankName as bankName,
        own.accountName as accountName,
        own.accountNo as accountNo
        
    FROM orders ord
    -- Join Orders to Locations using the venue location ID
    JOIN locations loc ON ord.venue_loc_id = loc.location_id
    -- Join Locations to Owners using the owner ID
    JOIN owners own ON loc.owner_id = own.user_id
    
    -- Filter by the specific Order ID (Converting input string to binary)
    WHERE ord.order_id = UUID_TO_BIN(in_orderId);
END $$
DELIMITER $$
CREATE PROCEDURE Get_Valid_Discounts(
    IN p_clientId VARCHAR(36),
    IN p_locId VARCHAR(36),
    IN p_venueName VARCHAR(100),
    IN p_start DATETIME,
    IN p_end DATETIME
)
BEGIN
    DECLARE v_locBin BINARY(16);
    DECLARE v_clientBin BINARY(16);
    
    DECLARE v_venueTypeId BINARY(16);
    DECLARE v_pricePerHour DECIMAL(10, 2);
    DECLARE v_estimatedPrice DECIMAL(12, 2);
    DECLARE v_hours INT;
    
    DECLARE v_clientPoints INT DEFAULT 0;
    DECLARE v_clientTier VARCHAR(20) DEFAULT 'BRONZE';

    -- 1. Chuẩn bị dữ liệu
    SET v_locBin = UUID_TO_BIN(p_locId);
    SET v_clientBin = IF(p_clientId IS NULL, NULL, UUID_TO_BIN(p_clientId));

    -- Lấy thông tin giá và loại phòng
    SELECT v.venueType_id, v.pricePerHour
    INTO v_venueTypeId, v_pricePerHour
    FROM venues v
    WHERE v.location_id = v_locBin AND v.name = p_venueName;

    -- Tính toán Giá ước tính (để lọc Discount theo minPrice)
    SET v_hours = TIMESTAMPDIFF(HOUR, p_start, p_end);
    IF v_hours <= 0 THEN SET v_hours = 1; END IF;
    SET v_estimatedPrice = v_pricePerHour * v_hours;

    -- Lấy thông tin Khách hàng & Tính hạng (nếu có đăng nhập)
    IF v_clientBin IS NOT NULL THEN
        SELECT membership_points INTO v_clientPoints 
        FROM clients WHERE user_id = v_clientBin;
        
        -- Gọi hàm tính hạng động (đảm bảo hàm Get_Tier đã tồn tại)
        SET v_clientTier = Get_Tier(v_clientPoints);
    END IF;

    -- 2. Trả về danh sách Discount hợp lệ
    SELECT 
        BIN_TO_UUID(d.discount_id) AS discount_id,
        d.name,
        d.percentage,
        d.maxDiscountPrice,
        d.minPrice,
        d.expiredAt
    FROM discounts d
    WHERE 
        -- Còn hạn sử dụng
        NOW() BETWEEN d.startedAt AND d.expiredAt
        
        -- Thỏa mãn giá trị đơn hàng tối thiểu
        AND (d.minPrice IS NULL OR v_estimatedPrice >= d.minPrice)
        
        -- Khớp loại phòng
        AND (d.venueTypeId IS NULL OR d.venueTypeId = v_venueTypeId)
        
        -- Khớp hạng thành viên (Dùng FIND_IN_SET nếu membershipTier là SET, hoặc = nếu là ENUM)
        AND (d.membershipTier IS NULL OR FIND_IN_SET(v_clientTier, d.membershipTier) > 0);
END$$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE Get_Valid_Amenities(
    IN p_locId VARCHAR(36),
    IN p_venueName VARCHAR(100),
    IN p_start DATETIME,
    IN p_end DATETIME
)
BEGIN
    DECLARE v_locBin BINARY(16);

    SET v_locBin = UUID_TO_BIN(p_locId);

    -- 2. Trả về danh sách Amenity khả dụng
    SELECT 
        a.amenity_name,
        a.category,
        a.description,
        a.price
    FROM amenities a
    WHERE 
        a.location_id = v_locBin
        AND a.isActive = 1 -- Đang trong kho
        
        -- B. Kiểm tra Trùng lịch (Availability Check)
        AND NOT EXISTS (
            SELECT 1 
            FROM order_amenities oa
            JOIN orders o ON oa.order_id = o.order_id
            WHERE oa.location_id = a.location_id 
              AND oa.amenity_name = a.amenity_name
              AND o.status IN ('PENDING', 'CONFIRMED')
              AND (o.startHour < p_end AND o.endHour > p_start)
        );
END$$

DELIMITER ;