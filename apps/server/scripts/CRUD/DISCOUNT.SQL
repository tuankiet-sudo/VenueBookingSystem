-- discount
DELIMITER $$

-- Insert Discount
CREATE PROCEDURE Discount_Insert(
    IN p_id VARCHAR(36),
    IN p_name VARCHAR(100),
    IN p_percent INT,
    IN p_maxDisc DECIMAL(12,2), -- Bổ sung
    IN p_minPrice DECIMAL(12,2), -- Bổ sung
    IN p_venueTypeId VARCHAR(36),-- Bổ sung (ID loại phòng), null là all
    IN p_tiers VARCHAR(255),     -- Bổ sung (VD: 'GOLD,PLATINUM'), null là all
    IN p_start DATETIME,
    IN p_end DATETIME
)
BEGIN
    DECLARE v_venueTypeBin BINARY(16);
    
    -- Xử lý chuyển đổi UUID (Nếu NULL thì giữ NULL)
    SET v_venueTypeBin = IF(p_venueTypeId IS NULL, NULL, UUID_TO_BIN(p_venueTypeId));

    -- 1. Validate Percentage
    IF p_percent < 0 OR p_percent > 100 THEN
        SIGNAL SQLSTATE '45094' SET MESSAGE_TEXT = 'Error: Percentage must be between 0 and 100.';
    END IF;

    -- 2. Validate Dates
    IF p_end <= p_start THEN
        SIGNAL SQLSTATE '45095' SET MESSAGE_TEXT = 'Error: End date must be after Start date.';
    END IF;

    -- 3. Validate Prices
    IF (p_maxDisc IS NOT NULL AND p_maxDisc < 0) OR (p_minPrice IS NOT NULL AND p_minPrice < 0) THEN
        SIGNAL SQLSTATE '45096' SET MESSAGE_TEXT = 'Error: Discount prices cannot be negative.';
    END IF;

    -- 4. Validate Venue Type Existence (Nếu có truyền ID)
    IF v_venueTypeBin IS NOT NULL AND NOT EXISTS (SELECT 1 FROM venue_types WHERE venueType_id = v_venueTypeBin) THEN
        SIGNAL SQLSTATE '45097' SET MESSAGE_TEXT = 'Error: Venue Type does not exist.';
    END IF;

    INSERT INTO discounts (
        discount_id, name, percentage, 
        maxDiscountPrice, minPrice, venueTypeId, membershipTier,
        startedAt, expiredAt
    )
    VALUES (
        UUID_TO_BIN(p_id), p_name, p_percent, 
        p_maxDisc, p_minPrice, v_venueTypeBin, p_tiers, 
        p_start, p_end
    );
END$$

-- Update Discount
CREATE PROCEDURE Discount_Update(
    IN p_id VARCHAR(36),
    IN p_name VARCHAR(100),      -- Dùng COALESCE (Bắt buộc có)
    IN p_percent INT,            -- Dùng COALESCE (Bắt buộc có)
    IN p_maxDisc DECIMAL(12,2),  -- GHI ĐÈ (Để có thể set về NULL)
    IN p_minPrice DECIMAL(12,2), -- GHI ĐÈ (Để có thể set về NULL)
    IN p_venueTypeId VARCHAR(36),-- GHI ĐÈ (Để có thể set về NULL)
    IN p_tiers VARCHAR(255),     -- GHI ĐÈ (Để có thể set về NULL)
    IN p_start DATETIME,         -- Dùng COALESCE
    IN p_end DATETIME            -- Dùng COALESCE
)
BEGIN
    DECLARE v_id BINARY(16);
    DECLARE v_venueTypeBin BINARY(16);
    
    -- Biến tạm để validate ngày tháng
    DECLARE v_newStart DATETIME;
    DECLARE v_newEnd DATETIME;

    SET v_id = UUID_TO_BIN(p_id);
    SET v_venueTypeBin = IF(p_venueTypeId IS NULL, NULL, UUID_TO_BIN(p_venueTypeId));

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM discounts WHERE discount_id = v_id) THEN
        SIGNAL SQLSTATE '45098' SET MESSAGE_TEXT = 'Error: Discount does not exist.';
    END IF;

    -- 2. Validate Percentage (Nếu có update)
    IF p_percent IS NOT NULL AND (p_percent < 0 OR p_percent > 100) THEN
        SIGNAL SQLSTATE '45099' SET MESSAGE_TEXT = 'Error: Percentage must be between 0 and 100.';
    END IF;

    -- 3. Validate Prices (Nếu có truyền vào thì phải không âm)
    IF (p_maxDisc IS NOT NULL AND p_maxDisc < 0) OR (p_minPrice IS NOT NULL AND p_minPrice < 0) THEN
        SIGNAL SQLSTATE '45100' SET MESSAGE_TEXT = 'Error: Discount prices cannot be negative.';
    END IF;

    -- 4. Validate Venue Type FK (Chỉ check nếu KHÁC NULL)
    -- Nếu p_venueTypeId là NULL -> Nghĩa là user muốn gỡ bỏ điều kiện loại phòng -> Hợp lệ, không cần check FK.
    IF v_venueTypeBin IS NOT NULL AND NOT EXISTS (SELECT 1 FROM venue_types WHERE venueType_id = v_venueTypeBin) THEN
        SIGNAL SQLSTATE '45101' SET MESSAGE_TEXT = 'Error: Venue Type does not exist.';
    END IF;

    -- 5. Validate Dates Logic
    SELECT 
        COALESCE(p_start, startedAt), 
        COALESCE(p_end, expiredAt)
    INTO v_newStart, v_newEnd
    FROM discounts WHERE discount_id = v_id;

    IF v_newEnd <= v_newStart THEN
        SIGNAL SQLSTATE '45102' SET MESSAGE_TEXT = 'Error: End date must be after Start date.';
    END IF;

    -- Execute Update
    -- Lưu ý: Những cột dùng COALESCE là những cột NOT NULL hoặc Logic không cho phép xóa
    -- Những cột gán trực tiếp là những cột cho phép NULL (để gỡ bỏ điều kiện)
    UPDATE discounts 
    SET 
        name             = COALESCE(p_name, name),
        percentage       = COALESCE(p_percent, percentage),
        
        -- GHI ĐÈ TRỰC TIẾP (Nếu truyền NULL -> Database sẽ lưu NULL -> Gỡ bỏ giới hạn) =>> PHẢI TRUYỂN LẠI GIÁ TRỊ CŨ NẾU K ĐỔI
        maxDiscountPrice = p_maxDisc,
        minPrice         = p_minPrice,
        venueTypeId      = v_venueTypeBin, -- ->> 1/all venuetype
        membershipTier   = p_tiers,
        
        startedAt        = COALESCE(p_start, startedAt),
        expiredAt        = COALESCE(p_end, expiredAt)
    WHERE discount_id = v_id;
END$$

-- Delete Discount
CREATE PROCEDURE Discount_Delete(IN p_id VARCHAR(36))
BEGIN
    DECLARE v_id BINARY(16);
    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM discounts WHERE discount_id = v_id) THEN
        SIGNAL SQLSTATE '45103' SET MESSAGE_TEXT = 'Error: Discount does not exist.';
    END IF;


    DELETE FROM discounts WHERE discount_id = v_id;
END$$

DELIMITER ;