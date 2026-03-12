DELIMITER $$
CREATE PROCEDURE OrderAmenity_Insert(
    IN p_orderId VARCHAR(36),
    IN p_amenityName VARCHAR(100)
)
BEGIN
    DECLARE v_orderId BINARY(16);
    DECLARE v_locId BINARY(16); -- <--- ĐÃ BỔ SUNG BIẾN NÀY
    DECLARE v_isActive BOOLEAN;
    
    SET v_orderId = UUID_TO_BIN(p_orderId);

    -- 1. Lấy Location ID từ Order
    SELECT venue_loc_id INTO v_locId
    FROM orders WHERE order_id = v_orderId;

    IF v_locId IS NULL THEN
        SIGNAL SQLSTATE '45051' SET MESSAGE_TEXT = 'Error: Order does not exist.';
    END IF;

    -- 2. Validate Amenity (Check theo Location + Name)
    SELECT isActive INTO v_isActive 
    FROM amenities 
    WHERE location_id = v_locId AND amenity_name = p_amenityName;

    IF v_isActive IS NULL THEN
        SIGNAL SQLSTATE '45052' SET MESSAGE_TEXT = 'Error: Amenity does not exist in this location.';
    END IF;

    -- Nếu tìm thấy nhưng Active = 0 (đang bận/hỏng) -> Báo lỗi
    IF v_isActive = 0 THEN
        SIGNAL SQLSTATE '45053' SET MESSAGE_TEXT = 'Error: This amenity is currently unavailable (Inactive).';
    END IF;

    -- 3. Insert
    INSERT INTO order_amenities (order_id, location_id, amenity_name)
    VALUES (v_orderId, v_locId, p_amenityName);
END$$
DELIMITER ;


DELIMITER ;