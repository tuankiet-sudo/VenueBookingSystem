DELIMITER $$
CREATE TRIGGER Check_ExistOrderDis
BEFORE DELETE ON discounts
FOR EACH ROW
BEGIN
    -- Kiểm tra xem Discount này đã từng được áp dụng cho đơn hàng nào chưa
    IF EXISTS (SELECT 1 FROM applies WHERE discount_id = OLD.discount_id) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Cannot delete this Discount because it has been used in order history.';
    END IF;
END$$

DELIMITER ;