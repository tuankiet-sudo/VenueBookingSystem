DELIMITER $$
CREATE PROCEDURE getListLocations(
    IN p_city VARCHAR(50),
    -- IN p_minCapacity INT,
    IN p_startTime DATETIME,
    IN p_endTime DATETIME,
    IN p_minPrice DECIMAL(10, 2),
    IN p_maxPrice DECIMAL(10, 2),
    IN p_minAvgRating DECIMAL(2, 1),
    IN p_theme VARCHAR(50),    -- Lọc theo Theme (VD: 'Luxury', 'Minimalist')
    IN p_size VARCHAR(20),     -- Lọc theo Size (Input: 'Small', 'Medium', 'Large')
    IN p_amenityCategory VARCHAR(50), -- VD: 'Projector_Kit' (Check trong kho Location)
    IN p_sort VARCHAR(20),

    IN p_clientId VARCHAR(36)  -- <--- Tham số mới: ID của người đang search
)
BEGIN
DECLARE v_clientId BINARY(16);
    -- Nếu không truyền clientId (khách vãng lai), gán NULL để tránh lỗi convert
SET v_clientId = IF(p_clientId IS NULL, NULL, UUID_TO_BIN(p_clientId));
SELECT
    -- 1. Thông tin Location (Địa điểm cha)
    BIN_TO_UUID(l.location_id) AS location_id,
    l.name AS location_name,
    l.addrNo,
    l.ward,
    l.city,
    l.avgRating,
    l.thumbnailURL,
    l.mapURL,
    l.phoneNo AS location_phone,
    -- 2. Thông tin Venue (Phòng cụ thể)
    v.name AS venue_name,
    v.floor,
    v.area,
    v.pricePerHour,
    -- 3. Thông tin Venue Type (Chi tiết kỹ thuật)
    BIN_TO_UUID(vt.venueType_id) AS venueType_id,
    vt.name AS theme_name,
    vt.minCapacity,
    vt.maxCapacity,

    -- 4. Images List (MỚI: Gom tất cả ảnh thành chuỗi)
    GROUP_CONCAT(DISTINCT vi.locationImgURL SEPARATOR ',') AS image_urls,

    -- CỘT MỚI: Đánh dấu yêu thích (1 = Có, 0 = Không)
    -- Logic: Kiểm tra xem User này có like Location này chưa
    EXISTS (
        SELECT 1 FROM favors f 
        WHERE f.client_id = v_clientId AND f.location_id = l.location_id
    ) AS is_favor
FROM
    locations l
    JOIN venues v ON v.location_id = l.location_id
    LEFT JOIN venue_types vt ON v.venueType_id = vt.venueType_id
    LEFT JOIN venue_images vi ON vi.location_id = v.location_id AND vi.venueName = v.name
    -- LEFT JOIN FAVORS favourite ON favourite.location_id = location.location_id
    -- AND favourite.client_id = p_clientId
WHERE
    l.city = p_city
    AND l.isActive = 1
    AND v.isActive = 1
    -- 2. Filter Theme (Tìm đúng tên Theme)
    AND (p_theme IS NULL OR vt.name = p_theme)
    -- 3. Filter Size (QUY ĐỔI TỪ TEXT SANG SỐ)
    AND (
        p_size IS NULL 
        OR (
            CASE p_size 
                WHEN 'Small'  THEN (vt.maxCapacity <= 40)
                WHEN 'Medium' THEN (vt.maxCapacity > 40 AND vt.maxCapacity <= 80)
                WHEN 'Large'  THEN (vt.maxCapacity >= 80) -- Bao trùm luôn 100-120
                ELSE TRUE -- Nếu truyền sai thì lấy hết hoặc chặn (tuỳ chọn)
            END
        )
    )
    -- 4. Filter Amenity (NÂNG CẤP: Check Trùng giờ)
        AND (
            p_amenityCategory IS NULL 
            OR EXISTS (
                SELECT 1 FROM amenities a
                WHERE a.location_id = l.location_id 
                  AND a.category = p_amenityCategory
                  AND a.isActive = 1
                  
                  -- B. CHECK TRÙNG GIỜ (Availability)
                  -- Đảm bảo thiết bị này chưa bị đơn hàng nào khác xí chỗ trong khung giờ tìm kiếm
                  AND (
                      p_startTime IS NULL OR p_endTime IS NULL
                      OR NOT EXISTS (
                          SELECT 1 
                          FROM order_amenities oa
                          JOIN orders o2 ON oa.order_id = o2.order_id
                          WHERE oa.location_id = a.location_id 
                            AND oa.amenity_name = a.amenity_name
                            AND o2.status IN ('PENDING', 'CONFIRMED')
                            AND (o2.startHour < p_endTime AND o2.endHour > p_startTime)
                      )
                  )
            )
        )
    AND (
        p_minAvgRating IS NULL
        OR l.avgRating >= p_minAvgRating
    )
    AND (
        p_minPrice IS NULL
        OR v.pricePerHour >= p_minPrice
    )
    AND (
        p_maxPrice IS NULL
        OR v.pricePerHour <= p_maxPrice
    )
    -- AND (
    --     p_clientId IS NULL
    --     OR p_onlyFavorites = 0
    --     OR favourite.client_id IS NOT NULL
    -- )
    AND (
            p_startTime IS NULL OR p_endTime IS NULL
            OR NOT EXISTS (
                SELECT 1 
                FROM orders o
                WHERE o.venue_loc_id = v.location_id 
                  AND o.venueName = v.name
                  AND o.status IN ('PENDING', 'CONFIRMED') -- Không quan tâm đơn đã hủy hoặc hoàn tất
                  AND (
                      -- Logic trùng lịch: (StartA < EndB) AND (EndA > StartB)
                      o.startHour < p_endTime AND o.endHour > p_startTime
                  )
            )
        )
    -- Sort by price (tăng dần)
    
    -- GROUP BY BẮT BUỘC KHI DÙNG GROUP_CONCAT
    -- Phải group theo khóa chính của Venue (LocationID + VenueName)
    GROUP BY l.location_id, v.name
-- Sắp xếp kết quả
    ORDER BY
        -- 1. ƯU TIÊN SỐ 1: Đưa địa điểm yêu thích lên đầu
        is_favor DESC, 
        
        -- 2. Các tiêu chí sắp xếp khác (như cũ)
        CASE WHEN p_sort = 'PRICE_ASC' THEN v.pricePerHour END ASC,
        CASE WHEN p_sort = 'PRICE_DESC' THEN v.pricePerHour END DESC,
        CASE WHEN p_sort = 'RATING' THEN l.avgRating END DESC,
        -- Sắp xếp theo diện tích (lấy từ bảng venues v.area)
        CASE WHEN p_sort = 'AREA_ASC' THEN v.area END ASC,
        CASE WHEN p_sort = 'AREA_DESC' THEN v.area END DESC,
        -- Mặc định sắp xếp theo tên Location nếu không chọn gì
        l.name ASC;
END$$

CREATE PROCEDURE listLocationOfOwner(
    IN p_owner VARCHAR(36)
)
BEGIN
    SELECT * FROM locations
    WHERE UUID_TO_BIN(p_owner) = owner_id
    ORDER BY avgRating DESC;
END$$

CREATE PROCEDURE getLocationDetailById(
    IN p_userId VARCHAR(36),
    IN p_id VARCHAR(36)
)
BEGIN
    SELECT p_id as id, description, addrNo, ward, city, avgRating, policy, phoneNo, mapURL, thumbnailURL FROM locations
    WHERE UUID_TO_BIN(p_id) = location_id AND UUID_TO_BIN(p_userId) = owner_id;
END$$

CREATE PROCEDURE listVenueOfLocation(
    IN p_locId VARCHAR(36)
)
SELECT
    v.name AS venueName,
    v.floor AS venueFloor,
    v.area AS venueArea,
    v.pricePerHour AS venuePricePerHour,
    v.isActive AS venueIsActive,
    vt.name AS venueTypeName,
    vt.maxCapacity AS venueCapacity,
    -- Use GROUP_CONCAT to list all image URLs for the group
    GROUP_CONCAT(vi.locationImgURL ORDER BY vi.locationImgURL ASC SEPARATOR ', ') AS venueImageURLs
FROM
    venues v
JOIN
    venue_types vt ON v.venueType_id = vt.venueType_id
JOIN
    venue_images vi ON v.location_id = vi.location_id AND v.name = vi.venueName
WHERE
    v.location_id = UUID_TO_BIN(p_locId)
-- Group by all non-aggregated columns
GROUP BY
    v.name,
    v.floor,
    v.area,
    v.pricePerHour,
    v.isActive,
    vt.name,
    vt.maxCapacity
ORDER BY
    v.createdAt DESC;
END$$

	CREATE PROCEDURE Venue_Preview(
	    IN p_locId VARCHAR(36),
	    IN p_name VARCHAR(100)
	)
	BEGIN
	    SELECT
	        v.name AS venue_name,
	        v.floor,
	        v.area,
	        v.pricePerHour,
	        BIN_TO_UUID(v.venueType_id) AS venueType_id,
	        vt.name AS theme_name,
	        vt.minCapacity,
	        vt.maxCapacity,
	        -- Convert the BINARY(16) location_id back to a readable VARCHAR(36) UUID
	        BIN_TO_UUID(v.location_id) AS location_id_uuid 
	    FROM
	        venues v
	    LEFT JOIN venue_types vt ON v.venueType_id = vt.venueType_id
	    WHERE
	        -- Convert the input VARCHAR(36) ID to BINARY(16) for comparison
	        v.location_id = UUID_TO_BIN(p_locId)
	        AND v.name = p_name;
	    
	    -- Removed GROUP BY clause as it is unnecessary when only selecting unique fields
	END$$
DELIMITER ;