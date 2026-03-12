-- favor
DELIMITER $$

-- Insert Favor (Like)
CREATE PROCEDURE Favor_Insert(
    IN p_clientId VARCHAR(36),
    IN p_locId VARCHAR(36)
)
BEGIN
    DECLARE v_clientId BINARY(16);
    DECLARE v_locId BINARY(16);
    
    SET v_clientId = UUID_TO_BIN(p_clientId);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Validate Foreign Keys
    IF NOT EXISTS (SELECT 1 FROM clients WHERE user_id = v_clientId) THEN
        SIGNAL SQLSTATE '45105' SET MESSAGE_TEXT = 'Error: Client does not exist.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM locations WHERE location_id = v_locId) THEN
        SIGNAL SQLSTATE '45106' SET MESSAGE_TEXT = 'Error: Location does not exist.';
    END IF;

    -- 2. Validate Duplicate (Đã like rồi thì không like nữa)
    IF EXISTS (SELECT 1 FROM favors WHERE client_id = v_clientId AND location_id = v_locId) THEN
        SIGNAL SQLSTATE '45107' SET MESSAGE_TEXT = 'Error: You have already favorited this location.';
    END IF;

    INSERT INTO favors (client_id, location_id)
    VALUES (v_clientId, v_locId);
END$$

-- Delete Favor (Unlike)
CREATE PROCEDURE Favor_Delete(
    IN p_clientId VARCHAR(36),
    IN p_locId VARCHAR(36)
)
BEGIN
    DECLARE v_clientId BINARY(16);
    DECLARE v_locId BINARY(16);
    
    SET v_clientId = UUID_TO_BIN(p_clientId);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Validate Existence
    IF NOT EXISTS (SELECT 1 FROM favors WHERE client_id = v_clientId AND location_id = v_locId) THEN
        SIGNAL SQLSTATE '45108' SET MESSAGE_TEXT = 'Error: Favor not found (Maybe you already unliked it).';
    END IF;

    DELETE FROM favors 
    WHERE client_id = v_clientId AND location_id = v_locId;
END$$

DELIMITER ;