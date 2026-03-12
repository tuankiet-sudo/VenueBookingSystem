-- venue_type
DELIMITER $$

-- Insert Type
CREATE PROCEDURE VenueType_Insert(
    IN p_id VARCHAR(36),
    IN p_name VARCHAR(50),
    IN p_desc TEXT,
    IN p_minCap INT,
    IN p_maxCap INT
)
BEGIN
    -- 1. Validate Null / Empty
    IF p_name IS NULL OR p_name = '' THEN
        SIGNAL SQLSTATE '45006' SET MESSAGE_TEXT = 'Error: Venue Type name cannot be empty.';
    END IF;

    -- 2. Validate Duplicate Name
    -- IF EXISTS (SELECT 1 FROM venue_types WHERE name = p_name) THEN
    --     SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Venue Type name already exists.';
    -- END IF;

    -- 3. Validate Capacity Logic
    IF p_minCap <= 0 OR p_maxCap <= 0 THEN
        SIGNAL SQLSTATE '45007' SET MESSAGE_TEXT = 'Error: Capacity must be greater than 0.';
    END IF;

    IF p_minCap > p_maxCap THEN
        SIGNAL SQLSTATE '45008' SET MESSAGE_TEXT = 'Error: Min Capacity cannot be greater than Max Capacity.';
    END IF;

    INSERT INTO venue_types (venueType_id, name, description, minCapacity, maxCapacity)
    VALUES (UUID_TO_BIN(p_id), p_name, p_desc, p_minCap, p_maxCap);
END$$

-- Update Type
CREATE PROCEDURE VenueType_Update(
    IN p_id VARCHAR(36),
    IN p_name VARCHAR(50),
    IN p_desc TEXT,          -- <--- Bổ sung tham số này
    IN p_minCap INT,
    IN p_maxCap INT
)
BEGIN
    DECLARE v_id BINARY(16);
    DECLARE v_currentMin INT;
    DECLARE v_currentMax INT;
    DECLARE v_newMin INT;
    DECLARE v_newMax INT;

    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM venue_types WHERE venueType_id = v_id) THEN
        SIGNAL SQLSTATE '45009' SET MESSAGE_TEXT = 'Error: Venue Type does not exist.';
    END IF;

    -- 2. Validate Duplicate Name (Nếu đổi tên khác, tên đó phải chưa tồn tại)
    -- IF p_name IS NOT NULL AND EXISTS (SELECT 1 FROM venue_types WHERE name = p_name AND venueType_id != v_id) THEN
    --     SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Venue Type name already exists.';
    -- END IF;

    -- 3. Validate Capacity Logic (Phức tạp hơn vì là Partial Update)
    -- Phải lấy giá trị cũ ra để so sánh với giá trị mới (nếu người dùng chỉ update 1 trong 2)
    SELECT minCapacity, maxCapacity INTO v_currentMin, v_currentMax 
    FROM venue_types WHERE venueType_id = v_id;

    SET v_newMin = COALESCE(p_minCap, v_currentMin);
    SET v_newMax = COALESCE(p_maxCap, v_currentMax);

    IF v_newMin <= 0 OR v_newMax <= 0 THEN
        SIGNAL SQLSTATE '45010' SET MESSAGE_TEXT = 'Error: Capacity must be greater than 0.';
    END IF;

    IF v_newMin > v_newMax THEN
        SIGNAL SQLSTATE '45011' SET MESSAGE_TEXT = 'Error: Min Capacity cannot be greater than Max Capacity.';
    END IF;

    -- Execute Update
    UPDATE venue_types 
    SET 
        name        = COALESCE(p_name, name),
        description = COALESCE(p_desc, description),
        minCapacity = COALESCE(p_minCap, minCapacity), 
        maxCapacity = COALESCE(p_maxCap, maxCapacity)
    WHERE venueType_id = v_id;
END$$

-- Delete Type
CREATE PROCEDURE VenueType_Delete(IN p_id VARCHAR(36))
BEGIN
    DECLARE v_id BINARY(16);
    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM venue_types WHERE venueType_id = v_id) THEN
        SIGNAL SQLSTATE '45012' SET MESSAGE_TEXT = 'Error: Venue Type does not exist.';
    END IF;

    DELETE FROM venue_types WHERE venueType_id = v_id;
END$$

DELIMITER ;