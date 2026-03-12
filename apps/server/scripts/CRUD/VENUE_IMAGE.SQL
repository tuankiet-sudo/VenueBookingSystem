-- venue images
DELIMITER $$

-- 1. Insert Venue Image
CREATE PROCEDURE VenueImage_Insert(
    IN p_locId VARCHAR(36),      -- ID của địa điểm
    IN p_venueName VARCHAR(100), -- Tên phòng
    IN p_url VARCHAR(255)        -- Link ảnh (Lưu ý: Phải < 255 ký tự)
)
BEGIN
    DECLARE v_locId BINARY(16);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Validate URL
    IF p_url IS NULL OR p_url = '' THEN
        SIGNAL SQLSTATE '45014' SET MESSAGE_TEXT = 'Error: Image URL cannot be empty.';
    END IF;

    -- 2. Validate Foreign Key (Venue Existence)
    IF NOT EXISTS (
        SELECT 1 FROM venues 
        WHERE location_id = v_locId AND name = p_venueName
    ) THEN
        SIGNAL SQLSTATE '45015' SET MESSAGE_TEXT = 'Error: Venue does not exist.';
    END IF;

    -- 3. Validate Duplicate (Trùng ảnh trong cùng 1 phòng)
    IF EXISTS (
        SELECT 1 FROM venue_images 
        WHERE location_id = v_locId 
          AND venueName = p_venueName 
          AND locationImgURL = p_url
    ) THEN
        SIGNAL SQLSTATE '45016' SET MESSAGE_TEXT = 'Error: This image already exists for this venue.';
    END IF;

    -- Execute Insert
    INSERT INTO venue_images (location_id, venueName, locationImgURL)
    VALUES (v_locId, p_venueName, p_url);
END$$

-- no update for primary key

-- 3. Delete Venue Image
CREATE PROCEDURE VenueImage_Delete(
    IN p_locId VARCHAR(36),
    IN p_venueName VARCHAR(100),
    IN p_url VARCHAR(255) -- Phải truyền đúng URL muốn xóa để định danh
)
BEGIN
    DECLARE v_locId BINARY(16);
    SET v_locId = UUID_TO_BIN(p_locId);

    -- 1. Check Existence
    IF NOT EXISTS (
        SELECT 1 FROM venue_images 
        WHERE location_id = v_locId 
          AND venueName = p_venueName 
          AND locationImgURL = p_url
    ) THEN
        SIGNAL SQLSTATE '45017' SET MESSAGE_TEXT = 'Error: Image does not exist.';
    END IF;

    -- Execute Delete
    DELETE FROM venue_images 
    WHERE location_id = v_locId 
      AND venueName = p_venueName 
      AND locationImgURL = p_url;
END$$

DELIMITER ;
