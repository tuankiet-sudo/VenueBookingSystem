DELIMITER $$

-- Procedure to get all rates by a client
CREATE PROCEDURE getClientRates(
    IN p_clientId VARCHAR(36)
)
BEGIN
    DECLARE v_clientId BINARY(16);
    
    -- Convert UUID to BINARY
    SET v_clientId = UUID_TO_BIN(p_clientId);
    
    -- Return all ratings by this client with location information
    SELECT 
        BIN_TO_UUID(r.client_id) as clientId,
        BIN_TO_UUID(r.location_id) as locationId,
        r.stars,
        r.comment,
        r.created_at as createdAt,
        r.updated_at as updatedAt,
        -- Location information
        l.name as locationName,
        l.city,
        l.thumbnailURL
    FROM rates r
    JOIN locations l ON r.location_id = l.location_id
    WHERE r.client_id = v_clientId
    ORDER BY r.created_at DESC;
    
END$$

DELIMITER ;
