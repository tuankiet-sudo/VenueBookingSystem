DELIMITER $$
CREATE TRIGGER Check_VenueImg
BEFORE INSERT ON venue_images
FOR EACH ROW
BEGIN
    DECLARE v_count INT;

    -- Đếm số lượng ảnh hiện có của Venue này
    SELECT COUNT(*) INTO v_count
    FROM venue_images
    WHERE location_id = NEW.location_id 
      AND venueName = NEW.venueName;

    -- Nếu đã có từ 10 ảnh trở lên thì báo lỗi
    IF v_count >= 10 THEN
      SIGNAL SQLSTATE '45122' 
        SET MESSAGE_TEXT = 'Error: Maximum limit of 10 images per venue reached. Please delete old images before adding new ones.';
    END IF;
END$$

DELIMITER ;