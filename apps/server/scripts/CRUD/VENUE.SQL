-- venue
DELIMITER $$

-- Insert Venue
CREATE PROCEDURE Venue_Insert(
    IN p_locId VARCHAR(36),
    IN p_name VARCHAR(100),
    IN p_typeId VARCHAR(36),
    IN p_floor VARCHAR(10),
    IN p_area DECIMAL(10,1),
    IN p_price DECIMAL(10,2)
)
BEGIN
    DECLARE v_locId BINARY(16);
    DECLARE v_typeId BINARY(16);
    
    SET v_locId = UUID_TO_BIN(p_locId);
    SET v_typeId = IF(p_typeId IS NULL, NULL, UUID_TO_BIN(p_typeId));

    -- 1. Validate Data Logic
    IF p_area <= 0 THEN
        SIGNAL SQLSTATE '45018' SET MESSAGE_TEXT = 'Error: Area must be greater than 0.';
    END IF;

    IF p_price <= 0 THEN
        SIGNAL SQLSTATE '45019' SET MESSAGE_TEXT = 'Error: Price per hour must be greater than 0.';
    END IF;

    -- 2. Validate Foreign Keys
    IF NOT EXISTS (SELECT 1 FROM locations WHERE location_id = v_locId) THEN
        SIGNAL SQLSTATE '45020' SET MESSAGE_TEXT = 'Error: Location does not exist.';
    END IF;

    IF v_typeId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM venue_types WHERE venueType_id = v_typeId) THEN
        SIGNAL SQLSTATE '45021' SET MESSAGE_TEXT = 'Error: Venue Type does not exist.';
    END IF;

    -- 3. Validate Duplicate Name (Primary Key)
    IF EXISTS (SELECT 1 FROM venues WHERE location_id = v_locId AND name = p_name) THEN
        SIGNAL SQLSTATE '45022' SET MESSAGE_TEXT = 'Error: Venue name already exists in this location.';
    END IF;

    -- Execute Insert
    INSERT INTO venues (location_id, name, venueType_id, floor, area, pricePerHour)
    VALUES (v_locId, p_name, v_typeId, p_floor, p_area, p_price);
END$$

-- Update Venue
CREATE PROCEDURE Venue_Update(
    IN p_locId VARCHAR(36),
    IN p_name VARCHAR(100),
    In p_newName VARCHAR(100),
    IN p_typeId VARCHAR(36), -- <--- Bổ sung tham số này
    IN p_floor VARCHAR(10),
    IN p_area DECIMAL(10,1),
    IN p_price DECIMAL(10,2),
    IN p_isActive BOOLEAN
)
BEGIN
    DECLARE v_locId BINARY(16);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM venues WHERE location_id = v_locId AND name = p_name) THEN
        SIGNAL SQLSTATE '45023' SET MESSAGE_TEXT = 'Error: Venue does not exist.';
    END IF;

    -- 2. Validate Data (Nếu có truyền giá trị mới)
    IF p_area IS NOT NULL AND p_area <= 0 THEN
        SIGNAL SQLSTATE '45024' SET MESSAGE_TEXT = 'Error: Area must be greater than 0.';
    END IF;

    IF p_price IS NOT NULL AND p_price <= 0 THEN
        SIGNAL SQLSTATE '45025' SET MESSAGE_TEXT = 'Error: Price per hour must be greater than 0.';
    END IF;
    
    -- Check Foreign Key (Nếu có đổi loại phòng)
    IF p_typeId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM venue_types WHERE venueType_id = UUID_TO_BIN(p_typeId)) THEN
        SIGNAL SQLSTATE '45026' SET MESSAGE_TEXT = 'Error: Venue Type does not exist.';
    END IF;

    -- Execute Update (Partial Update with COALESCE)
    UPDATE venues 
    SET 
        -- Nếu p_typeId là NULL, giữ nguyên giá trị cũ. 
        -- Nếu muốn set NULL cho loại phòng, cần quy ước khác (ví dụ chuỗi 'NULL'), nhưng ở đây ta dùng logic đơn giản.
        name         = COALESCE(p_newName, name),
        venueType_id = COALESCE(UUID_TO_BIN(p_typeId), venueType_id), 
        floor        = COALESCE(p_floor, floor),
        area         = COALESCE(p_area, area), 
        pricePerHour = COALESCE(p_price, pricePerHour), 
        isActive     = COALESCE(p_isActive, isActive)
    WHERE location_id = v_locId AND name = p_name;
END$$

-- Delete Venue
CREATE PROCEDURE Venue_Delete(
    IN p_locId VARCHAR(36),
    IN p_name VARCHAR(100)
)
BEGIN
    DECLARE v_locId BINARY(16);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM venues WHERE location_id = v_locId AND name = p_name) THEN
        SIGNAL SQLSTATE '45027' SET MESSAGE_TEXT = 'Error: Venue does not exist.';
    END IF;
    
    -- Execute Delete
    DELETE FROM venues WHERE location_id = v_locId AND name = p_name;
END$$

DELIMITER ;