-- client
DELIMITER $$
CREATE TRIGGER Update_OrderPoints
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    -- =================================================================
    -- PHẦN 2: TÍCH ĐIỂM THÀNH VIÊN
    -- Chỉ chạy khi đơn hàng HOÀN TẤT (COMPLETED)
    -- =================================================================
    IF NEW.status = 'COMPLETED' AND OLD.status <> 'COMPLETED' THEN
        
        UPDATE clients
        SET membership_points = membership_points + NEW.points
        WHERE user_id = NEW.client_id;
        
    END IF;
END$$

DELIMITER ;