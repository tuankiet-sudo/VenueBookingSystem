DELIMITER $$

CREATE PROCEDURE getAllUsers()
BEGIN
  SELECT
    BIN_TO_UUID(u.id)                    AS user_id,
    u.firstName                          AS first_name,
    u.lastName                           AS last_name,
    u.DoB                                AS date_of_birth,
    u.email                              AS email,
    u.phoneNo                            AS phone_number,
    u.isActive                           AS is_active
  FROM users u
  ORDER BY u.lastName, u.firstName;
END$$

CREATE PROCEDURE getPasswordByEmail(
    IN p_email VARCHAR(100)
)
BEGIN
  SELECT
    u.password                          AS password
  FROM users u
  WHERE u.email = p_email;
END$$

DELIMITER ;