DELIMITER $$
CREATE PROCEDURE Get_User_Channels(
    IN p_userId VARCHAR(36) -- ID của người dùng muốn xem danh sách chat
)
BEGIN
    DECLARE v_userBin BINARY(16);
    SET v_userBin = UUID_TO_BIN(p_userId);

    SELECT 
        -- 1. Xác định ID của người kia (Partner)
        -- Nếu mình là user_1 thì người kia là user_2 và ngược lại
        BIN_TO_UUID(
            CASE 
                WHEN c.user_1_id = v_userBin THEN c.user_2_id 
                ELSE c.user_1_id 
            END
        ) AS partner_id,
        
        -- 2. Lấy thông tin hiển thị của người kia
        CONCAT(u.firstName, ' ', u.lastName) AS partner_name,
        u.avatarURL AS partner_avatar,
        
        -- 3. Thông tin kênh
        c.created_at AS channel_created_at
        
    FROM chat_channels c
    -- Join thông minh: Chỉ join với ID của người kia
    JOIN users u ON u.id = (
        CASE 
            WHEN c.user_1_id = v_userBin THEN c.user_2_id 
            ELSE c.user_1_id 
        END
    )
    
    WHERE c.user_1_id = v_userBin OR c.user_2_id = v_userBin
    
    -- Sắp xếp: Kênh nào mới tạo hoặc có tin nhắn mới (nếu join thêm bảng message) lên đầu
    ORDER BY c.created_at DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE Message_GetByConversation(
    IN p_userA VARCHAR(36), -- Người xem (Me)
    IN p_userB VARCHAR(36)  -- Người kia (Partner)
)
BEGIN
    DECLARE v_u1 BINARY(16);
    DECLARE v_u2 BINARY(16);

    -- 1. Sắp xếp ID để tìm đúng kênh (Nhỏ trước, Lớn sau)
    IF p_userA < p_userB THEN
        SET v_u1 = UUID_TO_BIN(p_userA);
        SET v_u2 = UUID_TO_BIN(p_userB);
    ELSE
        SET v_u1 = UUID_TO_BIN(p_userB);
        SET v_u2 = UUID_TO_BIN(p_userA);
    END IF;

    -- 2. Kiểm tra kênh có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM chat_channels WHERE user_1_id = v_u1 AND user_2_id = v_u2) THEN
        SIGNAL SQLSTATE '45076' SET MESSAGE_TEXT = 'Error: Chat channel not found.';
    END IF;

    -- 3. Truy vấn TOÀN BỘ tin nhắn
    SELECT 
        BIN_TO_UUID(m.message_id) AS message_id,
        BIN_TO_UUID(m.sender_id) AS sender_id,
        
        -- Thông tin người gửi
        CONCAT(u.firstName, ' ', u.lastName) AS sender_name,
        u.avatarURL AS sender_avatar,
        
        m.content,
        m.sentAt
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.channel_user_1_id = v_u1 
      AND m.channel_user_2_id = v_u2
    ORDER BY m.sentAt ASC; -- SỬA: Đổi thành ASC (Cũ -> Mới) để hiển thị đúng dòng thời gian
END$$

DELIMITER ;