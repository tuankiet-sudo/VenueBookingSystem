DELIMITER $$

-- Procedure to get all favored locations by a client
CREATE PROCEDURE getClientFavors(
    IN p_clientId VARCHAR(36)
)
BEGIN
    DECLARE v_clientId BINARY(16);
    
    -- Convert UUID to BINARY
    SET v_clientId = UUID_TO_BIN(p_clientId);
    
    -- Return all favorited locations by this client
    SELECT 
        BIN_TO_UUID(f.client_id) as clientId,
        BIN_TO_UUID(f.location_id) as locationId,
        l.name as locationName,
        l.city,
        l.avgRating,
        l.thumbnailURL,
        f.created_at as createdAt
    FROM favors f
    JOIN locations l ON f.location_id = l.location_id
    WHERE f.client_id = v_clientId
    ORDER BY f.created_at DESC;
    
END$$

DELIMITER ;
