-- rate
DELIMITER $$

CREATE TRIGGER Insert_AvgRate
AFTER INSERT ON rates
FOR EACH ROW
BEGIN
    UPDATE locations
    SET avgRating = (
        SELECT IFNULL(AVG(stars), 0) 
        FROM rates 
        WHERE location_id = NEW.location_id
    )
    WHERE location_id = NEW.location_id;
END$$

CREATE TRIGGER Update_AvgRate
AFTER UPDATE ON rates
FOR EACH ROW
BEGIN
    UPDATE locations
    SET avgRating = (
        SELECT IFNULL(AVG(stars), 0) 
        FROM rates 
        WHERE location_id = NEW.location_id
    )
    WHERE location_id = NEW.location_id;
END$$

CREATE TRIGGER Delete_AvgRate
AFTER DELETE ON rates
FOR EACH ROW
BEGIN
    UPDATE locations
    SET avgRating = (
        SELECT IFNULL(AVG(stars), 0) 
        FROM rates 
        -- SỬA LỖI: Đổi NEW thành OLD
        WHERE location_id = OLD.location_id
    )
    -- SỬA LỖI: Đổi NEW thành OLD
    WHERE location_id = OLD.location_id;
END$$

DELIMITER ;