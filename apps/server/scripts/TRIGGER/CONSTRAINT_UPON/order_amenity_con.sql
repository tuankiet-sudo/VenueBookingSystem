DELIMITER $$
CREATE TRIGGER Check_ValidOrderAme
BEFORE INSERT ON order_amenities
FOR EACH ROW
BEGIN
    DECLARE v_currentStart DATETIME;
    DECLARE v_currentEnd DATETIME;

    -- 1. Lấy khung giờ của đơn hàng đang định thêm amenity vào
    SELECT startHour, endHour INTO v_currentStart, v_currentEnd
    FROM orders 
    WHERE order_id = NEW.order_id;

    -- 2. Kiểm tra trùng lịch (Overlap Check)
    -- Logic: Tìm xem có đơn hàng nào KHÁC cũng đang dùng amenity này và bị trùng giờ không
    IF EXISTS (
        SELECT 1 
        FROM order_amenities oa
        JOIN orders o ON oa.order_id = o.order_id
        WHERE oa.location_id = NEW.location_id     -- SỬA: So sánh Location
          AND oa.amenity_name = NEW.amenity_name   -- SỬA: So sánh Tên
          AND o.order_id != NEW.order_id          -- Không tính chính đơn hàng này (nếu update)
          AND o.status IN ('PENDING', 'CONFIRMED') -- Chỉ tính các đơn đang giữ chỗ
          AND (
              -- Công thức trùng giờ: (StartA < EndB) AND (EndA > StartB)
              o.startHour < v_currentEnd AND o.endHour > v_currentStart
          )
    ) THEN
        SIGNAL SQLSTATE '45121' 
        SET MESSAGE_TEXT = 'Error: This amenity is already booked by another order during this time slot.';
    END IF;
END$$

DELIMITER ;