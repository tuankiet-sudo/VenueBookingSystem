-- invoice
DELIMITER $$

CREATE TRIGGER Check_Amount
BEFORE INSERT ON invoices
FOR EACH ROW
BEGIN
    DECLARE v_orderTotal DECIMAL(12,2);

    -- Lấy tổng tiền từ đơn hàng tương ứng
    SELECT totalPrice INTO v_orderTotal
    FROM orders
    WHERE order_id = NEW.order_id;

    -- So sánh (Cho phép lệch 0 đồng, bắt buộc khớp chính xác)
    IF NEW.amount != v_orderTotal THEN
        SIGNAL SQLSTATE '45116' 
        SET MESSAGE_TEXT = 'Error: Invoice amount must match the Order total price.';
    END IF;
END$$

DELIMITER ;