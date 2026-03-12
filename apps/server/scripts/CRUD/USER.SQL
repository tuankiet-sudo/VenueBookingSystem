-- user
DELIMITER $$

-- Insert User
CREATE PROCEDURE User_Insert(
    IN p_id VARCHAR(36), -- ID được truyền từ Backend hoặc tạo mới
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_firstName VARCHAR(50),
    IN p_lastName VARCHAR(50),
    IN p_phoneNo VARCHAR(15),
    IN p_avatarURL VARCHAR(255),
    IN p_DoB DATE
)
BEGIN
    -- 1. Kiểm tra NOT NULL các trường bắt buộc
    IF p_email IS NULL THEN
        SIGNAL SQLSTATE '45028' SET MESSAGE_TEXT = 'Error: Email cannot be empty.';
    END IF;

    IF p_password IS NULL THEN
        SIGNAL SQLSTATE '45029' SET MESSAGE_TEXT = 'Error: Password cannot be empty.';
    END IF;

    IF p_firstName IS NULL THEN
        SIGNAL SQLSTATE '45030' SET MESSAGE_TEXT = 'Error: First Name cannot be empty.';
    END IF;

    IF p_lastName IS NULL THEN
        SIGNAL SQLSTATE '45031' SET MESSAGE_TEXT = 'Error: Last Name cannot be empty.';
    END IF;

    IF p_DoB IS NULL THEN
        SIGNAL SQLSTATE '45032' SET MESSAGE_TEXT = 'Error: Date of Birth cannot be empty.';
    END IF;

    -- 2. Validate Email Format (Regex)
    IF p_email NOT REGEXP '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$' THEN
        SIGNAL SQLSTATE '45033' SET MESSAGE_TEXT = 'Error: Invalid email format.';
    END IF;

    -- 3. Validate Unique Email (Kiểm tra trùng lặp)
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45034' SET MESSAGE_TEXT = 'Error: Email already exists.';
    END IF;

    -- 4. Validate Tên (Chỉ chứa chữ cái)
    IF p_firstName NOT REGEXP '^[A-Za-z ]+$' THEN
        SIGNAL SQLSTATE '45035' SET MESSAGE_TEXT = 'Error: First Name must contain only letters.';
    END IF;

    IF p_lastName NOT REGEXP '^[A-Za-z ]+$' THEN
        SIGNAL SQLSTATE '45036' SET MESSAGE_TEXT = 'Error: Last Name must contain only letters.';
    END IF;

    -- 5. Validate Số điện thoại (Chỉ số & tối đa 10 ký tự)
    IF p_phoneNo IS NOT NULL AND (p_phoneNo NOT REGEXP '^[0-9]+$' OR LENGTH(p_phoneNo) > 10) THEN
        SIGNAL SQLSTATE '45037' SET MESSAGE_TEXT = 'Error: Phone number must be numeric and max 10 digits.';
    END IF;

    -- 6. Validate Tuổi > 18 (Gọi Function)
    IF Cal_Age(p_DoB) <= 18 THEN
        SIGNAL SQLSTATE '45038' SET MESSAGE_TEXT = 'Error: User must be at least 18 years old.';
    END IF;

    -- Thực hiện Insert
    INSERT INTO users (id, email, password, firstName, lastName, phoneNo, avatarURL, DoB)
    VALUES (UUID_TO_BIN(p_id), p_email, p_password, p_firstName, p_lastName, p_phoneNo, p_avatarURL, p_DoB);
END$$

-- Update User
CREATE PROCEDURE User_Update(
    IN p_id VARCHAR(36),
    IN p_firstName VARCHAR(50),
    IN p_lastName VARCHAR(50),
    IN p_phoneNo VARCHAR(15),
    IN p_avatarURL VARCHAR(255),
    IN p_DoB DATE,
    IN p_isActive BOOLEAN,
    IN p_isAdmin BOOLEAN
)
BEGIN
DECLARE v_id BINARY(16);
    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence (Bắt buộc)
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_id) THEN
        SIGNAL SQLSTATE '45039' SET MESSAGE_TEXT = 'Error: User does not exist.';
    END IF;

    -- 2. Validate Name (Chỉ check nếu người dùng có truyền tên mới)
    IF (p_firstName IS NOT NULL AND p_firstName NOT REGEXP '^[A-Za-z ]+$') THEN
        SIGNAL SQLSTATE '45040' SET MESSAGE_TEXT = 'Error: First Name must contain only letters.';
    END IF;

    IF (p_lastName IS NOT NULL AND p_lastName NOT REGEXP '^[A-Za-z ]+$') THEN
        SIGNAL SQLSTATE '45041' SET MESSAGE_TEXT = 'Error: Last Name must contain only letters.';
    END IF;

    -- 3. Validate Phone Number (Chỉ check nếu có truyền sđt mới)
    IF (p_phoneNo IS NOT NULL) AND (p_phoneNo NOT REGEXP '^[0-9]+$' OR LENGTH(p_phoneNo) > 10) THEN
        SIGNAL SQLSTATE '45042' SET MESSAGE_TEXT = 'Error: Phone number must be numeric and max 10 digits.';
    END IF;

    -- 4. Validate Age (Chỉ check nếu có truyền ngày sinh mới)
    IF (p_DoB IS NOT NULL) AND Cal_Age(p_DoB) <= 18 THEN
        SIGNAL SQLSTATE '45043' SET MESSAGE_TEXT = 'Error: User must be at least 18 years old.';
    END IF;

    -- 5. Execute Update with COALESCE (Partial Update)
    UPDATE users 
    SET 
        firstName = COALESCE(p_firstName, firstName), -- Nếu p_firstName là NULL, giữ nguyên firstName cũ
        lastName  = COALESCE(p_lastName, lastName),
        phoneNo   = COALESCE(p_phoneNo, phoneNo),
        avatarURL = COALESCE(p_avatarURL, avatarURL),
        DoB       = COALESCE(p_DoB, DoB),
        isActive  = COALESCE(p_isActive, isActive),
        isAdmin   = COALESCE(p_isAdmin, isAdmin)
    WHERE id = v_id;
END$$

DELIMITER ;