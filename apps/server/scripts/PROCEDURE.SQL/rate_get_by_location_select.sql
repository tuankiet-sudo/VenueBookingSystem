DELIMITER $$

-- Procedure to get all ratings for a location with client info
CREATE PROCEDURE getLocationRatings(
    IN p_locationId VARCHAR(36)
)
BEGIN
    DECLARE v_locationId BINARY(16);
    
    -- Convert UUID to BINARY
    SET v_locationId = UUID_TO_BIN(p_locationId);
    
    -- Return all ratings for this location with client information
    SELECT 
        BIN_TO_UUID(r.client_id) as clientId,
        BIN_TO_UUID(r.location_id) as locationId,
        r.stars,
        r.comment,
        r.created_at as createdAt,
        r.updated_at as updatedAt,
        -- Client information
        CONCAT(u.firstName, ' ', u.lastName) as clientName,
        u.avatarURL
    FROM rates r
    JOIN clients c ON r.client_id = c.user_id
    JOIN users u ON c.user_id = u.id
    WHERE r.location_id = v_locationId
    ORDER BY r.created_at DESC;
    
END$$

DELIMITER ;
