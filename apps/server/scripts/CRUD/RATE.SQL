-- rate
DELIMITER $$

-- Insert Rate
CREATE PROCEDURE Rate_Insert(
    IN p_clientId VARCHAR(36),
    IN p_locId VARCHAR(36),
    IN p_stars INT,
    IN p_comment TEXT
)
BEGIN
    DECLARE v_clientId BINARY(16);
    DECLARE v_locId BINARY(16);
    
    SET v_clientId = UUID_TO_BIN(p_clientId);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Validate Stars (1-5)
    IF p_stars < 1 OR p_stars > 5 THEN
        SIGNAL SQLSTATE '45044' SET MESSAGE_TEXT = 'Error: Rating stars must be an integer between 1 and 5.';
    END IF;

    -- 2. Validate Foreign Keys
    IF NOT EXISTS (SELECT 1 FROM clients WHERE user_id = v_clientId) THEN
        SIGNAL SQLSTATE '45045' SET MESSAGE_TEXT = 'Error: Client does not exist.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM locations WHERE location_id = v_locId) THEN
        SIGNAL SQLSTATE '45046' SET MESSAGE_TEXT = 'Error: Location does not exist.';
    END IF;

    -- 3. Validate Duplicate (Mỗi khách chỉ đánh giá 1 lần cho 1 địa điểm)
    IF EXISTS (SELECT 1 FROM rates WHERE client_id = v_clientId AND location_id = v_locId) THEN
        SIGNAL SQLSTATE '45047' SET MESSAGE_TEXT = 'Error: You have already rated this location. Please update your existing rating instead.';
    END IF;

    -- Lưu ý: Logic "Phải có đơn hàng hoàn tất mới được đánh giá" 
    -- đã được xử lý bởi Trigger 'trg_Rate_CheckEligibility' mà chúng ta viết trước đó.
    
    INSERT INTO rates (client_id, location_id, stars, comment)
    VALUES (v_clientId, v_locId, p_stars, p_comment);
END$$

-- Update Rate
CREATE PROCEDURE Rate_Update(
    IN p_clientId VARCHAR(36),
    IN p_locId VARCHAR(36),
    IN p_stars INT,
    IN p_comment TEXT
)
BEGIN
    DECLARE v_clientId BINARY(16);
    DECLARE v_locId BINARY(16);
    
    SET v_clientId = UUID_TO_BIN(p_clientId);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM rates WHERE client_id = v_clientId AND location_id = v_locId) THEN
        SIGNAL SQLSTATE '45048' SET MESSAGE_TEXT = 'Error: Rating does not exist.';
    END IF;

    -- 2. Validate Stars (Nếu có truyền vào)
    IF p_stars IS NOT NULL AND (p_stars < 1 OR p_stars > 5) THEN
        SIGNAL SQLSTATE '45049' SET MESSAGE_TEXT = 'Error: Rating stars must be an integer between 1 and 5.';
    END IF;

    -- Execute Update (Partial Update)
    UPDATE rates 
    SET 
        stars = COALESCE(p_stars, stars),
        comment = COALESCE(p_comment, comment)
    WHERE client_id = v_clientId AND location_id = v_locId;
END$$

-- Delete Rate
CREATE PROCEDURE Rate_Delete(
    IN p_clientId VARCHAR(36),
    IN p_locId VARCHAR(36)
)
BEGIN
    DECLARE v_clientId BINARY(16);
    DECLARE v_locId BINARY(16);
    
    SET v_clientId = UUID_TO_BIN(p_clientId);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM rates WHERE client_id = v_clientId AND location_id = v_locId) THEN
        SIGNAL SQLSTATE '45050' SET MESSAGE_TEXT = 'Error: Rating does not exist.';
    END IF;

    DELETE FROM rates 
    WHERE client_id = v_clientId AND location_id = v_locId;
END$$

DELIMITER ;