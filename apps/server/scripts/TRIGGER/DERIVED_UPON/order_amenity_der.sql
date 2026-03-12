DELIMITER $$
CREATE TRIGGER Insert_AmenityPrice_Points
AFTER INSERT ON order_amenities
FOR EACH ROW
BEGIN
    CALL Cal_Final_Price(NEW.order_id);
END$$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER Delete_AmenityPrice_Points
AFTER DELETE ON order_amenities
FOR EACH ROW
BEGIN
    CALL Cal_Final_Price(OLD.order_id);
END$$

DELIMITER ;