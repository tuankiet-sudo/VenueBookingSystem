-- client
DELIMITER $$

-- Insert Client
CREATE PROCEDURE Client_Insert(
    IN p_userId VARCHAR(36),
    IN p_slug VARCHAR(10)
)
BEGIN
    DECLARE v_uuid BINARY(16);
    SET v_uuid = UUID_TO_BIN(p_userId);

    -- 1. Check if User exists in USERS table (Foreign Key check)
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_uuid) THEN
        SIGNAL SQLSTATE '45089' SET MESSAGE_TEXT = 'Error: User ID does not exist in Users table.';
    END IF;

    -- 2. Check if this User is already a Client (One-to-One check)
    IF EXISTS (SELECT 1 FROM clients WHERE user_id = v_uuid) THEN
        SIGNAL SQLSTATE '45090' SET MESSAGE_TEXT = 'Error: This User is already registered as a Client.';
    END IF;

    -- 3. Validate Unique Slug
    IF EXISTS (SELECT 1 FROM clients WHERE slug = p_slug) THEN
        SIGNAL SQLSTATE '45091' SET MESSAGE_TEXT = 'Error: Slug already exists. Please choose another one.';
    END IF;

    -- Execute Insert (membership_points defaults to 0)
    INSERT INTO clients (user_id, slug)
    VALUES (v_uuid, p_slug);
END$$

-- Update Client
CREATE PROCEDURE Client_Update(
    IN p_userId VARCHAR(36),
    IN p_points INT
)
BEGIN
    DECLARE v_uuid BINARY(16);
    SET v_uuid = UUID_TO_BIN(p_userId);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM clients WHERE user_id = v_uuid) THEN
        SIGNAL SQLSTATE '45092' SET MESSAGE_TEXT = 'Error: Client does not exist.';
    END IF;

    -- 2. Validate Points (Must be positive)
    IF p_points IS NOT NULL AND p_points < 0 THEN
        SIGNAL SQLSTATE '45093' SET MESSAGE_TEXT = 'Error: Membership points cannot be negative.';
    END IF;

    -- Execute Update (Using COALESCE for partial update)
    UPDATE clients 
    SET membership_points = COALESCE(p_points, membership_points)
    WHERE user_id = v_uuid;
END$$

DELIMITER ;