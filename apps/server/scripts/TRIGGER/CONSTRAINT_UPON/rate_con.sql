-- rate
DELIMITER $$

CREATE TRIGGER Check_Rate
BEFORE INSERT ON rates
FOR EACH ROW
BEGIN
    -- Kiểm tra xem có tồn tại đơn hàng hợp lệ nào không
    IF NOT EXISTS (
        SELECT 1 
        FROM orders o
        -- Join để đảm bảo Order đó thuộc về Location đang được rate
        -- (Vì bảng Order lưu venue_loc_id chính là location_id)
        WHERE o.client_id = NEW.client_id 
          AND o.venue_loc_id = NEW.location_id
          AND o.status = 'COMPLETED' -- Hoặc trạng thái đã hoàn thành nếu có
          AND o.endHour < NOW()      -- Phải sử dụng xong mới được review
    ) THEN
        SIGNAL SQLSTATE '45124' 
        SET MESSAGE_TEXT = 'Error: You can only rate a location after completing a booking there.';
    END IF;
END$$
