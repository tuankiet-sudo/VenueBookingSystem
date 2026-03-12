DELIMITER $$
CREATE TRIGGER Check_VenueTypes
BEFORE DELETE ON venue_types
FOR EACH ROW
BEGIN
    -- Kiểm tra xem có Venue nào đang sử dụng loại phòng này không
    -- Sử dụng OLD.venueType_id để lấy ID của dòng đang bị xóa
    IF EXISTS (SELECT 1 FROM venues WHERE venueType_id = OLD.venueType_id) THEN
        SIGNAL SQLSTATE '45013' 
        SET MESSAGE_TEXT = 'Error: Cannot delete Venue Type. There are Venues using this type.';
    END IF;
END$$
DELIMITER ;