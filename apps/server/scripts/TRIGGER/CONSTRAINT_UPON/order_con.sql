-- order
DELIMITER $$
CREATE TRIGGER Check_OverlapOrder
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    -- Kiểm tra trùng lịch
    IF EXISTS (
        SELECT 1 FROM orders
        WHERE venue_loc_id = NEW.venue_loc_id 
          AND venueName = NEW.venueName
          AND status IN ('PENDING', 'CONFIRMED') -- Chỉ chặn các đơn đang hoạt động
          AND (startHour < NEW.endHour AND endHour > NEW.startHour) -- Logic chồng lấn thời gian
    ) THEN
        SIGNAL SQLSTATE '45118' 
        SET MESSAGE_TEXT = 'Error: This venue is already booked for the selected time slot.';
    END IF;
END$$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER Check_Active
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE v_venueActive BOOLEAN;
    DECLARE v_locationActive BOOLEAN;

    -- Lấy trạng thái của Venue và Location cha
    SELECT v.isActive, l.isActive 
    INTO v_venueActive, v_locationActive
    FROM venues v
    JOIN locations l ON v.location_id = l.location_id
    WHERE v.location_id = NEW.venue_loc_id 
      AND v.name = NEW.venueName;

    -- Kiểm tra
    IF v_locationActive = 0 THEN
        SIGNAL SQLSTATE '45119' SET MESSAGE_TEXT = 'Error: This Location is currently inactive/closed.';
    END IF;

    IF v_venueActive = 0 THEN
        SIGNAL SQLSTATE '45120' SET MESSAGE_TEXT = 'Error: This Venue is currently under maintenance or inactive.';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER CheckClient_Limit
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    -- Chỉ kiểm tra đơn đang PENDING (chưa thanh toán)
    -- Cho phép đặt nhiều đơn CONFIRMED (đặt trước cho tương lai)
    IF EXISTS (
        SELECT 1 FROM orders
        WHERE client_id = NEW.client_id
          AND status = 'PENDING'
    ) THEN
        SIGNAL SQLSTATE '45136' 
        SET MESSAGE_TEXT = 'Error: You have a pending order. Please complete payment or cancel it before booking a new one.';
    END IF;
END$$

DELIMITER ;