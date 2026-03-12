DELIMITER $$
CREATE PROCEDURE Filter_Amenities(
    IN p_locationId VARCHAR(36), -- Bắt buộc
    IN p_category VARCHAR(50)    -- NULL được
)
BEGIN
    SELECT 
        amenity_name, -- Sửa: Lấy trực tiếp tên (Khóa chính mới)
        category,
        description,
        price,
        createdAt,
        isActive
    FROM amenities
    WHERE location_id = UUID_TO_BIN(p_locationId)
      AND isActive = 1 -- Chỉ lấy đồ đang rảnh
      
      -- Lọc theo Category
      AND (p_category IS NULL OR category = p_category)
      
    ORDER BY category ASC, price ASC;
END$$

CREATE PROCEDURE Get_Amenity_Details(
    IN p_locationId VARCHAR(36),
    IN p_name VARCHAR(100)
)
BEGIN
    SELECT 
        amenity_name, -- Sửa: Lấy trực tiếp tên (Khóa chính mới)
        category,
        description,
        price,
        createdAt,
        isActive
    FROM amenities
    WHERE location_id = UUID_TO_BIN(p_locationId)
      AND amenity_name = p_name;
END$$
DELIMITER ;