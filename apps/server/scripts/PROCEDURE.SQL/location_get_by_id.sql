DELIMITER $$

-- Procedure to get complete location details by ID (for public/client view)
CREATE PROCEDURE getLocationDetailsById(
    IN p_locationId VARCHAR(36),
    IN p_clientId VARCHAR(36)  -- Optional: to check if user has favorited
)
BEGIN
    DECLARE v_locationId BINARY(16);
    DECLARE v_clientId BINARY(16);
    
    -- Convert UUIDs to BINARY
    SET v_locationId = UUID_TO_BIN(p_locationId);
    SET v_clientId = IF(p_clientId IS NULL, NULL, UUID_TO_BIN(p_clientId));
    
    -- 1. Get Location basic information
    SELECT 
        BIN_TO_UUID(l.location_id) AS location_id,
        l.name AS location_name,
        l.description,
        l.addrNo,
        l.ward,
        l.city,
        l.avgRating,
        l.policy,
        l.phoneNo,
        l.mapURL,
        l.thumbnailURL,
        l.isActive,
        BIN_TO_UUID(l.owner_id) AS owner_id,
        -- Check if current user has favorited this location
        EXISTS (
            SELECT 1 FROM favors f 
            WHERE f.client_id = v_clientId AND f.location_id = v_locationId
        ) AS is_favorited
    FROM locations l
    WHERE l.location_id = v_locationId;
    
    -- 2. Get all venues at this location
    SELECT 
        v.name AS venue_name,
        v.floor,
        v.area,
        v.pricePerHour,
        v.isActive,
        BIN_TO_UUID(vt.venueType_id) AS venueType_id,
        vt.name AS theme_name,
        vt.description AS theme_description,
        vt.minCapacity,
        vt.maxCapacity
    FROM venues v
    LEFT JOIN venue_types vt ON v.venueType_id = vt.venueType_id
    WHERE v.location_id = v_locationId
    ORDER BY v.pricePerHour ASC;
    
    -- 3. Get all venue images
    SELECT 
        vi.venueName,
        vi.locationImgURL
    FROM venue_images vi
    WHERE vi.location_id = v_locationId
    ORDER BY vi.venueName;
    
    -- 4. Get all amenities available at this location
    SELECT 
        a.amenity_name,
        BIN_TO_UUID(a.location_id) AS location_id,
        a.category,
        a.description,
        a.price,
        a.isActive
    FROM amenities a
    WHERE a.location_id = v_locationId
    ORDER BY a.category, a.price;
    
    -- 5. Get all ratings/reviews for this location
    SELECT 
        BIN_TO_UUID(r.client_id) AS client_id,
        r.stars,
        r.comment,
        r.created_at,
        r.updated_at,
        -- Get reviewer info
        u.firstName,
        u.lastName,
        u.avatarURL
    FROM rates r
    JOIN clients c ON r.client_id = c.user_id
    JOIN users u ON c.user_id = u.id
    WHERE r.location_id = v_locationId
    ORDER BY r.created_at DESC;
    
    -- 6. Get rating statistics
    SELECT 
        COUNT(*) AS total_ratings,
        AVG(stars) AS avg_rating,
        SUM(CASE WHEN stars = 5 THEN 1 ELSE 0 END) AS five_stars,
        SUM(CASE WHEN stars = 4 THEN 1 ELSE 0 END) AS four_stars,
        SUM(CASE WHEN stars = 3 THEN 1 ELSE 0 END) AS three_stars,
        SUM(CASE WHEN stars = 2 THEN 1 ELSE 0 END) AS two_stars,
        SUM(CASE WHEN stars = 1 THEN 1 ELSE 0 END) AS one_star
    FROM rates
    WHERE location_id = v_locationId;
    
END$$

DELIMITER ;
