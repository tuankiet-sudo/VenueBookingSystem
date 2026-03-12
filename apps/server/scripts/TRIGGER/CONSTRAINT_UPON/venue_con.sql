DELIMITER $$
CREATE TRIGGER Check_ExistOrderVen
BEFORE DELETE ON venues
FOR EACH ROW
BEGIN
    -- Logic: Kiểm tra xem phòng này có bất kỳ đơn hàng nào (kể cả đã hoàn thành)
    -- Nếu có -> Báo lỗi, không cho xóa.
    IF EXISTS (
        SELECT 1 
        FROM orders o
        WHERE o.venue_loc_id = OLD.location_id 
          AND o.venueName = OLD.name
          AND o.status IN ('CANCELLED', 'PENDING', 'CONFIRMED', 'COMPLETED')
    ) THEN
        SIGNAL SQLSTATE '45123' 
        SET MESSAGE_TEXT = 'Error: Cannot delete Venue. It has associated bookings history (Pending, Confirmed, or Completed). Please deactivate it instead.';
    END IF;
END$$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER Check_DeactiveVen
BEFORE UPDATE ON venues
FOR EACH ROW
BEGIN
    -- Chỉ kiểm tra khi chuyển từ Active (1) sang Inactive (0)
    IF OLD.isActive = 1 AND NEW.isActive = 0 THEN
        
        -- Kiểm tra xem có đơn hàng nào sắp tới hoặc đang diễn ra không
        IF EXISTS (
            SELECT 1 FROM orders
            WHERE venue_loc_id = OLD.location_id 
              AND venueName = OLD.name
              AND status IN ('PENDING', 'CONFIRMED')
              AND endHour > NOW() -- Đơn hàng chưa kết thúc
        ) THEN
            SIGNAL SQLSTATE '45137' 
            SET MESSAGE_TEXT = 'Error: Cannot deactivate Venue. There are active or upcoming orders associated with it.';
        END IF;
        
    END IF;
END$$

DELIMITER ;