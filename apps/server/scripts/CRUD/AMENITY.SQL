-- amenity
DELIMITER $$

-- Insert Amenity
CREATE PROCEDURE Amenity_Insert(
    IN p_locId VARCHAR(36),
    IN p_name VARCHAR(100), -- Thay cho p_id
    IN p_category VARCHAR(50),
    IN p_desc TEXT,
    IN p_price DECIMAL(12,2)
)
BEGIN
    DECLARE v_locId BINARY(16);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Validate Location Existence (Foreign Key)
    IF NOT EXISTS (SELECT 1 FROM locations WHERE location_id = v_locId) THEN
        SIGNAL SQLSTATE '45083' SET MESSAGE_TEXT = 'Error: Location does not exist.';
    END IF;

    -- 2. Validate Price
    IF p_price < 0 THEN
        SIGNAL SQLSTATE '45084' SET MESSAGE_TEXT = 'Error: Price cannot be negative.';
    END IF;

    -- 2. Validate Duplicate Name (Trong cùng 1 Location không được trùng tên)
    IF EXISTS (SELECT 1 FROM amenities WHERE location_id = v_locId AND amenity_name = p_name) THEN
        SIGNAL SQLSTATE '45130' SET MESSAGE_TEXT = 'Error: Amenity name already exists in this location.';
    END IF;

    INSERT INTO amenities (location_id, amenity_name, category, description, price)
    VALUES (v_locId, p_name, p_category, p_desc, p_price);
END$$

-- Update Amenity
CREATE PROCEDURE Amenity_Update(
    IN p_locId VARCHAR(36),
    IN p_newName VARCHAR(100),
    IN p_name VARCHAR(100), -- Dùng làm khóa để tìm
    IN p_category VARCHAR(50),
    IN p_desc TEXT,
    IN p_price DECIMAL(12,2),
    IN p_isActive BOOLEAN
)
BEGIN
    DECLARE v_locId BINARY(16);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM amenities WHERE location_id = v_locId AND amenity_name = p_name) THEN
        SIGNAL SQLSTATE '45085' SET MESSAGE_TEXT = 'Error: Amenity does not exist.';
    END IF;

    -- 2. Validate Price
    IF p_price IS NOT NULL AND p_price < 0 THEN
        SIGNAL SQLSTATE '45086' SET MESSAGE_TEXT = 'Error: Price cannot be negative.';
    END IF;

    UPDATE amenities 
    SET
        amenity_name   = COALESCE(p_newName, amenity_name),
        category       = COALESCE(p_category, category),
        description    = COALESCE(p_desc, description),
        price          = COALESCE(p_price, price),
        isActive       = COALESCE(p_isActive, isActive)
    WHERE location_id = v_locId AND amenity_name = p_name;
END$$

-- Delete Amenity
CREATE PROCEDURE Amenity_Delete(
    IN p_locId VARCHAR(36),
    IN p_name VARCHAR(100)
)
BEGIN
    DECLARE v_locId BINARY(16);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM amenities WHERE location_id = v_locId AND amenity_name = p_name) THEN
        SIGNAL SQLSTATE '45087' SET MESSAGE_TEXT = 'Error: Amenity does not exist.';
    END IF;

    DELETE FROM amenities WHERE location_id = v_locId AND amenity_name = p_name;
END$$

DELIMITER ;