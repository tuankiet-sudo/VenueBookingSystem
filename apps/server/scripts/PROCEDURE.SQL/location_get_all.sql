DELIMITER $$

-- Procedure to get all active locations (simplified list)
CREATE PROCEDURE getAllLocations(
    IN p_clientId VARCHAR(36)  -- Optional: to check if user has favorited
)
BEGIN
    SELECT 
        BIN_TO_UUID(l.location_id) AS location_id,
        l.name AS location_name,
        l.description,
        l.addrNo,
        l.ward,
        l.city,
        l.avgRating,
        l.thumbnailURL,
        l.mapURL,
        l.phoneNo,
        BIN_TO_UUID(l.owner_id) AS owner_id,
        l.isActive,
        l.createdAt,
        l.updatedAt,
        
        -- Check if current user has favorited this location
        COALESCE(
            (
                SELECT 1 
                FROM favors f 
                WHERE p_clientId IS NOT NULL
                AND f.client_id = UUID_TO_BIN(p_clientId) 
                AND f.location_id = l.location_id
                LIMIT 1
            ),
            0
        ) AS is_favorited,
        
        -- Count total venues at this location
        (SELECT COUNT(*) FROM venues v WHERE v.location_id = l.location_id AND v.isActive = 1) AS total_venues,
        
        -- Get minimum price from all venues
        (SELECT MIN(v.pricePerHour) FROM venues v WHERE v.location_id = l.location_id AND v.isActive = 1) AS min_price,
        
        -- Get maximum price from all venues
        (SELECT MAX(v.pricePerHour) FROM venues v WHERE v.location_id = l.location_id AND v.isActive = 1) AS max_price,
        
        -- Count total reviews
        (SELECT COUNT(*) FROM rates r WHERE r.location_id = l.location_id) AS total_reviews
        
    FROM locations l
    WHERE l.isActive = 1
    ORDER BY l.avgRating DESC, l.createdAt DESC;
    
END$$

DELIMITER ;
