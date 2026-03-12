DELIMITER $$

-- =============================================
-- 1. INSERT CHANNEL (Tạo kênh mới)
-- Logic mới: Nếu đã có kênh thì BÁO LỖI
-- =============================================
DROP PROCEDURE IF EXISTS Channel_Insert$$

CREATE PROCEDURE Channel_Insert(
    IN p_userA VARCHAR(36), -- Người tạo
    IN p_userB VARCHAR(36)  -- Người muốn chat cùng
)
BEGIN
    DECLARE v_u1 BINARY(16);
    DECLARE v_u2 BINARY(16);
    
    -- 1. Sắp xếp ID (Nhỏ trước Lớn sau) để đảm bảo tính duy nhất của cặp chat
    -- Ví dụ: A chat B hay B chat A thì đều lưu là (A, B) nếu ID A < ID B
    IF p_userA < p_userB THEN
        SET v_u1 = UUID_TO_BIN(p_userA);
        SET v_u2 = UUID_TO_BIN(p_userB);
    ELSE
        SET v_u1 = UUID_TO_BIN(p_userB);
        SET v_u2 = UUID_TO_BIN(p_userA);
    END IF;

    -- 2. Kiểm tra tồn tại (Validation)
    IF EXISTS (SELECT 1 FROM chat_channels WHERE user_1_id = v_u1 AND user_2_id = v_u2) THEN
        SIGNAL SQLSTATE '45125' 
        SET MESSAGE_TEXT = 'Error: Chat channel between these users already exists.';
    END IF;

    -- 3. Insert nếu chưa có
    INSERT INTO chat_channels (user_1_id, user_2_id) 
    VALUES (v_u1, v_u2);
END$$
