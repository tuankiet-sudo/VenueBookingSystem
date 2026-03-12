DELIMITER $$
CREATE PROCEDURE Register_New_Client(
    -- Thông tin User
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_firstName VARCHAR(50),
    IN p_lastName VARCHAR(50),
    IN p_phoneNo VARCHAR(15),
    IN p_avatarURL TEXT,
    IN p_DoB DATE,
    -- Thông tin Client
    IN p_slug VARCHAR(10)
)
BEGIN
    -- Khai báo biến ID để dùng chung cho cả 2 bảng
    DECLARE v_newId VARCHAR(36);
    
    -- Xử lý lỗi: Nếu có bất kỳ lỗi gì xảy ra -> Rollback (Hủy hết)
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45138' SET MESSAGE_TEXT = 'Error: Registration failed. Transaction rolled back.';
    END;

    -- 1. Tạo UUID mới
    SET v_newId = UUID();

    -- 2. Bắt đầu Giao dịch
    START TRANSACTION;

        -- Bước 1: Tạo User (Gọi lại Procedure có sẵn để tận dụng Validation)
        CALL User_Insert(
            v_newId, p_email, p_password, p_firstName, p_lastName, 
            p_phoneNo, p_avatarURL, p_DoB
        );

        -- Bước 2: Tạo Client ngay lập tức
        CALL Client_Insert(v_newId, p_slug);

    -- 3. Nếu cả 2 bước đều êm xuôi -> Lưu lại
    COMMIT;
    
END$$

DELIMITER ;