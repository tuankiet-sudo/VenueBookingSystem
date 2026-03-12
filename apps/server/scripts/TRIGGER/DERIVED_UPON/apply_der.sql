DELIMITER $$
CREATE TRIGGER Insert_PriceDiscount
AFTER INSERT ON applies
FOR EACH ROW
BEGIN
    -- Gọi thủ tục tính toán lại cho đơn hàng này
    CALL Cal_Final_Price(NEW.order_id);
END$$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER Delete_PriceDiscount
AFTER DELETE ON applies
FOR EACH ROW
BEGIN
    -- Gọi thủ tục tính toán lại (dùng OLD.order_id vì dòng đã bị xóa)
    CALL Cal_Final_Price(OLD.order_id);
END$$

DELIMITER ;