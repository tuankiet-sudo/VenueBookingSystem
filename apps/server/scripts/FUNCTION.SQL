-- function cơ bản
DELIMITER $$
CREATE FUNCTION Cal_Age(birthDate DATE)
RETURNS INT
NOT DETERMINISTIC
BEGIN
    -- Tính số năm chênh lệch giữa ngày sinh và ngày hiện tại
    RETURN TIMESTAMPDIFF(YEAR, birthDate, CURDATE());
END$$

DELIMITER ;

DELIMITER $$

CREATE FUNCTION Get_Tier(p_points INT)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    -- Logic quy đổi điểm (có thể sửa mốc điểm)
    IF p_points >= 5000 THEN
        RETURN 'PLATINUM';
    ELSEIF p_points >= 2000 THEN
        RETURN 'GOLD';
    ELSEIF p_points >= 500 THEN
        RETURN 'SILVER';
    ELSE
        RETURN 'BRONZE';
    END IF;
END$$

DELIMITER ;

-- function phức tạp
-- DELIMITER ;
DELIMITER $$
CREATE FUNCTION Calc_OwnerFee(
    p_ownerId VARCHAR(36),
    p_month INT,
    p_year INT
)
RETURNS DECIMAL(15, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
    -- 1. Khai báo biến
    DECLARE v_owner_uuid BINARY(16);
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_orderPrice DECIMAL(12, 2);

    -- Biến kiểm tra tồn tại
    DECLARE v_ownerExists INT;
    DECLARE v_joinDate DATETIME;
    
    -- Biến theo dõi doanh thu tích lũy
    DECLARE v_revenue_OLD DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_revenue_NEW DECIMAL(15, 2) DEFAULT 0;
    
    -- Biến tính phí tích lũy
    DECLARE v_fee_OLD DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_fee_NEW DECIMAL(15, 2) DEFAULT 0;
    
    DECLARE v_totalCommission DECIMAL(15, 2) DEFAULT 0;
    
    -- 2. Cursor: Lấy tất cả đơn hàng hoàn tất của Owner (từ mọi Location)
    DECLARE cur_orders CURSOR FOR 
        SELECT o.totalPrice
        FROM orders o
        JOIN venues v ON o.venue_loc_id = v.location_id AND o.venueName = v.name
        JOIN locations l ON v.location_id = l.location_id
        WHERE l.owner_id = v_owner_uuid
          AND o.status = 'COMPLETED'
          AND MONTH(o.endHour) = p_month
          AND YEAR(o.endHour) = p_year
        ORDER BY o.createdAt ASC; -- Duyệt theo thời gian để tính lũy tiến chính xác

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- 3. Validate
    -- A. Kiểm tra Tháng/Năm hợp lệ
    IF p_month < 1 OR p_month > 12 THEN 
        RETURN NULL; -- Tháng sai
    END IF;

    -- B. Kiểm tra Owner có tồn tại không
    -- (Lưu ý: Phải convert trước khi select)
    SET v_owner_uuid = UUID_TO_BIN(p_ownerId);

    SELECT COUNT(*), MAX(u.createdAt) INTO v_ownerExists, v_joinDate
    FROM owners o
    JOIN users u ON o.user_id = u.id
    WHERE o.user_id = v_owner_uuid;

    IF v_ownerExists = 0 THEN
        RETURN NULL; -- Owner không tồn tại
    END IF;

    -- C. Kiểm tra Logic thời gian tham gia (Optional)
    -- Nếu tháng tính phí nhỏ hơn tháng tham gia hệ thống -> Trả về 0
    IF (p_year * 12 + p_month) < (YEAR(v_joinDate) * 12 + MONTH(v_joinDate)) THEN
        RETURN 0;
    END IF;

    -- 4. Duyệt và Tính toán
    OPEN cur_orders;

    read_loop: LOOP
        FETCH cur_orders INTO v_orderPrice;
        IF done THEN LEAVE read_loop; END IF;

        -- Cập nhật trạng thái doanh thu
        SET v_revenue_NEW = v_revenue_OLD + v_orderPrice;

        -- A. Tính tổng phí cho mức doanh thu CŨ
        SET v_fee_OLD = CASE 
            WHEN v_revenue_OLD <= 5000000 THEN 0
            WHEN v_revenue_OLD <= 10000000 THEN (v_revenue_OLD - 5000000) * 0.10
            WHEN v_revenue_OLD <= 50000000 THEN 500000 + (v_revenue_OLD - 10000000) * 0.08
            ELSE 3700000 + (v_revenue_OLD - 50000000) * 0.05
        END;

        -- B. Tính tổng phí cho mức doanh thu MỚI
        SET v_fee_NEW = CASE 
            WHEN v_revenue_NEW <= 5000000 THEN 0
            WHEN v_revenue_NEW <= 10000000 THEN (v_revenue_NEW - 5000000) * 0.10
            WHEN v_revenue_NEW <= 50000000 THEN 500000 + (v_revenue_NEW - 10000000) * 0.08
            ELSE 3700000 + (v_revenue_NEW - 50000000) * 0.05
        END;

        -- Phí của đơn hàng này = Chênh lệch
        SET v_totalCommission = v_totalCommission + (v_fee_NEW - v_fee_OLD);
        
        -- Gán lại cho vòng lặp sau
        SET v_revenue_OLD = v_revenue_NEW;
        
    END LOOP;

    CLOSE cur_orders;

    RETURN v_totalCommission;
END$$

DELIMITER ;

DELIMITER $$
CREATE FUNCTION Owner_MonthlyReport(
    p_ownerId VARCHAR(36),
    p_month INT,
    p_year INT
)
RETURNS TEXT
DETERMINISTIC
READS SQL DATA
BEGIN
    -- 1. Khai báo biến quản lý
    DECLARE v_ownerUuid BINARY(16);
    DECLARE v_report TEXT DEFAULT '';
    DECLARE done INT DEFAULT FALSE;

    -- Biến thông tin Owner
    DECLARE v_ownerName VARCHAR(100);
    DECLARE v_ownerEmail VARCHAR(100);

    -- Biến trong vòng lặp (Location Details)
    DECLARE v_locId BINARY(16);
    DECLARE v_locName VARCHAR(150);
    DECLARE v_addr VARCHAR(255); -- Địa chỉ ghép
    DECLARE v_rating DECIMAL(2,1);
    DECLARE v_venueCount INT;    -- Số lượng phòng

    -- Biến tính toán doanh thu (như cũ)
    DECLARE v_locRevenue DECIMAL(15, 2);
    DECLARE v_locOrders INT;
    
    -- Biến tổng hợp tài chính
    DECLARE v_totalGross DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_totalFee DECIMAL(15, 2) DEFAULT 0;
    DECLARE v_totalNet DECIMAL(15, 2) DEFAULT 0;

    -- 2. Khai báo Cursor: Lấy nhiều thông tin hơn từ Location
    DECLARE cur_locations CURSOR FOR 
        SELECT 
            location_id, 
            name, 
            CONCAT(addrNo, ', ', ward, ', ', city), -- Ghép địa chỉ cho gọn
            avgRating
        FROM locations 
        WHERE owner_id = v_ownerUuid
        ORDER BY name;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- 3. Validate & Convert
    SET v_ownerUuid = UUID_TO_BIN(p_ownerId);

    -- Lấy thêm tên và email Owner
    SELECT CONCAT(u.firstName, ' ', u.lastName), u.email 
    INTO v_ownerName, v_ownerEmail
    FROM owners o
    JOIN users u ON o.user_id = u.id
    WHERE o.user_id = v_ownerUuid;

    IF v_ownerName IS NULL THEN
        RETURN 'Error: Owner does not exist.';
    END IF;

    IF p_month < 1 OR p_month > 12 THEN
        RETURN 'Error: Invalid month.';
    END IF;

    -- 4. Header Báo Cáo (Thêm thông tin cá nhân)
    SET v_report = CONCAT('--- MONTHLY REPORT (', p_month, '/', p_year, ') ---\n');
    SET v_report = CONCAT(v_report, 'Owner: ', v_ownerName, ' (', v_ownerEmail, ')\n');
    SET v_report = CONCAT(v_report, 'ID: ', p_ownerId, '\n');
    SET v_report = CONCAT(v_report, '======================================\n');
    SET v_report = CONCAT(v_report, 'DETAILS BY LOCATION:\n');

    -- 5. Duyệt từng địa điểm
    OPEN cur_locations;

    read_loop: LOOP
        FETCH cur_locations INTO v_locId, v_locName, v_addr, v_rating;
        
        IF done THEN LEAVE read_loop; END IF;

        -- Lấy số lượng phòng (Venue) của địa điểm này
        SELECT COUNT(*) INTO v_venueCount 
        FROM venues WHERE location_id = v_locId;

        -- Tính doanh thu & số đơn
        SELECT 
            IFNULL(SUM(totalPrice), 0), 
            COUNT(order_id)
        INTO v_locRevenue, v_locOrders
        FROM orders 
        WHERE venue_loc_id = v_locId 
          AND status = 'COMPLETED'
          AND MONTH(endHour) = p_month
          AND YEAR(endHour) = p_year;

        SET v_totalGross = v_totalGross + v_locRevenue;

        -- Ghi chi tiết (Bổ sung Address, Rating, Venue Count)
        IF v_locRevenue > 0 OR v_locOrders > 0 THEN
            SET v_report = CONCAT(v_report, '> ', v_locName, ' [', v_rating, '★]\n');
            SET v_report = CONCAT(v_report, '   Address: ', v_addr, '\n');
            SET v_report = CONCAT(v_report, '   Scale  : ', v_venueCount, ' venues\n');
            SET v_report = CONCAT(v_report, '   Performance: ', v_locOrders, ' orders | ', FORMAT(v_locRevenue, 0), ' VND\n');
            SET v_report = CONCAT(v_report, '- - - - - - - - - - - -\n');
        END IF;

    END LOOP;

    CLOSE cur_locations;

    -- 6. TÍNH TOÁN TÀI CHÍNH TỔNG HỢP
    SET v_totalFee = Calc_OwnerFee(p_ownerId, p_month, p_year);
    IF v_totalFee IS NULL THEN SET v_totalFee = 0; END IF;
    SET v_totalNet = v_totalGross - v_totalFee;

    -- 7. Footer Báo Cáo
    SET v_report = CONCAT(v_report, '======================================\n');
    SET v_report = CONCAT(v_report, 'FINANCIAL SUMMARY:\n');
    SET v_report = CONCAT(v_report, '1. Gross Revenue :  ', FORMAT(v_totalGross, 0), ' VND\n');
    SET v_report = CONCAT(v_report, '2. Platform Fee  : -', FORMAT(v_totalFee, 0), ' VND\n');
    SET v_report = CONCAT(v_report, '--------------------------------------\n');
    SET v_report = CONCAT(v_report, '3. NET INCOME    :  ', FORMAT(v_totalNet, 0), ' VND\n');
    SET v_report = CONCAT(v_report, '======================================');

    RETURN v_report;
END$$

DELIMITER ;