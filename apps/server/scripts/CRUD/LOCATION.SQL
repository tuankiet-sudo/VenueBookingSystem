-- location
DELIMITER $$

-- Insert Location
CREATE PROCEDURE Location_Insert(
    IN p_id VARCHAR(36), -- Generate UUID ở code rồi truyền vào
    IN p_ownerId VARCHAR(36),
    IN p_name VARCHAR(150),
    IN p_desc TEXT,
    IN p_addrNo VARCHAR(20),
    IN p_ward VARCHAR(50),
    IN p_city VARCHAR(50),
    IN p_phoneNo VARCHAR(15),      
    IN p_policy TEXT,               
    IN p_mapURL VARCHAR(255),
    IN p_thumbURL VARCHAR(255)
)
BEGIN
    DECLARE v_ownerUuid BINARY(16);
    SET v_ownerUuid = UUID_TO_BIN(p_ownerId);

    -- 1. Validate Owner Existence (Foreign Key)
    IF NOT EXISTS (SELECT 1 FROM owners WHERE user_id = v_ownerUuid) THEN
        SIGNAL SQLSTATE '45067' SET MESSAGE_TEXT = 'Error: Owner does not exist.';
    END IF;

    -- Thêm vào Location_Insert và Location_Update
    IF p_phoneNo IS NOT NULL AND p_phoneNo NOT REGEXP '^[0-9]+$' THEN
        SIGNAL SQLSTATE '45068' SET MESSAGE_TEXT = 'Error: Location phone number must contain only digits.';
    END IF;

    INSERT INTO locations (location_id, owner_id, name, description, addrNo, ward, city, phoneNo, policy, mapURL, thumbnailURL)
    VALUES (UUID_TO_BIN(p_id), v_ownerUuid, p_name, p_desc, p_addrNo, p_ward, p_city, p_phoneNo, p_policy, p_mapURL, p_thumbURL);
END$$

-- Update Location
CREATE PROCEDURE Location_Update(
    IN p_id VARCHAR(36),
    IN p_name VARCHAR(150),
    IN p_desc TEXT,
    IN p_addrNo VARCHAR(20),
    IN p_ward VARCHAR(50),           -- Bổ sung cho đầy đủ
    IN p_city VARCHAR(50),           -- Bổ sung cho đầy đủ
    IN p_phoneNo VARCHAR(15),        -- Đã bổ sung
    IN p_policy TEXT,                -- Đã bổ sung
    IN p_mapURL VARCHAR(255),
    IN p_thumbURL VARCHAR(255),      -- Bổ sung (thường sẽ cần sửa ảnh)
    IN p_isActive BOOLEAN
)
BEGIN
    DECLARE v_id BINARY(16);
    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM locations WHERE location_id = v_id) THEN
        SIGNAL SQLSTATE '45069' SET MESSAGE_TEXT = 'Error: Location does not exist.';
    END IF;

    IF p_phoneNo IS NOT NULL AND p_phoneNo NOT REGEXP '^[0-9]+$' THEN
        SIGNAL SQLSTATE '45070' SET MESSAGE_TEXT = 'Error: Location phone number must contain only digits.';
    END IF;
    
    UPDATE locations 
    SET 
        name         = COALESCE(p_name, name),
        description  = COALESCE(p_desc, description),
        addrNo       = COALESCE(p_addrNo, addrNo),
        ward         = COALESCE(p_ward, ward),
        city         = COALESCE(p_city, city),
        phoneNo      = COALESCE(p_phoneNo, phoneNo),
        policy       = COALESCE(p_policy, policy),
        mapURL       = COALESCE(p_mapURL, mapURL),
        thumbnailURL = COALESCE(p_thumbURL, thumbnailURL),
        isActive     = COALESCE(p_isActive, isActive)
    WHERE location_id = v_id;
END$$

-- Delete Location
CREATE PROCEDURE Location_Delete(IN p_id VARCHAR(36))
BEGIN
    DECLARE v_id BINARY(16);
    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM locations WHERE location_id = v_id) THEN
        SIGNAL SQLSTATE '45071' SET MESSAGE_TEXT = 'Error: Location does not exist.';
    END IF;
    DELETE FROM locations WHERE location_id = v_id;
END$$

DELIMITER ;