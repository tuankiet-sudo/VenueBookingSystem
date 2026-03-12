DELIMITER $$
CREATE PROCEDURE Message_Insert(
    IN p_senderId VARCHAR(36),   -- Người gửi
    IN p_receiverId VARCHAR(36), -- Người nhận
    IN p_content TEXT            -- Nội dung
)
BEGIN
    DECLARE v_senderBin BINARY(16);
    DECLARE v_receiverBin BINARY(16);
    DECLARE v_channelU1 BINARY(16);
    DECLARE v_channelU2 BINARY(16);
    
    -- 1. Validate Input
    IF p_content IS NULL OR TRIM(p_content) = '' THEN
        SIGNAL SQLSTATE '45065' SET MESSAGE_TEXT = 'Error: Message content cannot be empty.';
    END IF;

    SET v_senderBin = UUID_TO_BIN(p_senderId);
    SET v_receiverBin = UUID_TO_BIN(p_receiverId);

    -- 2. Xác định ID của Kênh (Luôn là ID nhỏ trước, ID lớn sau)
    IF p_senderId < p_receiverId THEN
        SET v_channelU1 = v_senderBin;
        SET v_channelU2 = v_receiverBin;
    ELSE
        SET v_channelU1 = v_receiverBin;
        SET v_channelU2 = v_senderBin;
    END IF;

    -- 3. Kiểm tra Kênh có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM chat_channels WHERE user_1_id = v_channelU1 AND user_2_id = v_channelU2) THEN
        SIGNAL SQLSTATE '45066' 
        SET MESSAGE_TEXT = 'Error: Chat channel does not exist. Please create a channel first.';
    END IF;

    -- 4. Insert Tin nhắn
    INSERT INTO messages (
        message_id, 
        channel_user_1_id, 
        channel_user_2_id, 
        sender_id, 
        content, 
        sentAt
    )
    VALUES (
        UUID_TO_BIN(UUID()), 
        v_channelU1, 
        v_channelU2, 
        v_senderBin, 
        p_content, 
        NOW()
    );
END$$
DELIMITER ;