DELIMITER $$
CREATE PROCEDURE getDetailLocationById(
    IN location_id VARCHAR(50),
)
BEGIN
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
    -- 4. Filter Amenity (NÂNG CẤP: Check Tương thích Size + Check Trùng giờ)
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
                          WHERE oa.amenity_id = a.amenity_id
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

CREATE PROCEDURE Get_Venue_Details(
    IN p_locationId VARCHAR(36),
    IN p_venueName VARCHAR(100)
)
BEGIN
    SELECT 
        v.name AS venue_name,
        v.floor,
        v.area,
        v.pricePerHour,
        v.createdAt,
        v.isActive,
        -- Thông tin Venue Type (Chi tiết kỹ thuật)
        BIN_TO_UUID(vt.venueType_id) AS venueType_id,
        vt.name AS theme_name,
        vt.minCapacity,
        vt.maxCapacity,
        vt.description AS venueType_description
    FROM venues v
    LEFT JOIN venue_types vt ON v.venueType_id = vt.venueType_id
    WHERE v.location_id = UUID_TO_BIN(p_locationId)
      AND v.name = p_venueName;
END$$