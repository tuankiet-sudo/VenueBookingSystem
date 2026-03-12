DELIMITER $$
CREATE PROCEDURE Admin_ManageOwnerFees(
    IN p_month INT,
    IN p_year INT
)
BEGIN
    -- Validate Input
    IF p_month < 1 OR p_month > 12 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Invalid month.';
    END IF;

    SELECT 
        BIN_TO_UUID(o.user_id) AS Owner_ID,
        o.accountName AS Owner_Name,
        o.accountNo AS Bank_Account,
        
        -- Đếm số địa điểm hoạt động (Dùng DISTINCT để không bị trùng do join nhiều bảng)
        COUNT(DISTINCT l.location_id) AS Active_Locations,
        
        -- 1. TÍNH TỔNG DOANH THU (Gross Revenue)
        -- Sử dụng hàm SUM trực tiếp trên bảng orders đã join
        IFNULL(SUM(ord.totalPrice), 0) AS Gross_Revenue,
        
        -- 2. TÍNH TỔNG PHÍ SÀN (Platform Fee)
        -- Gọi hàm tính phí (Hàm này trả về phí của cả Owner, nên ta gọi 1 lần cho mỗi nhóm)
        -- Lưu ý: MySQL tự động hiểu hàm này là hằng số trong nhóm Group By
        Calc_OwnerFee(BIN_TO_UUID(o.user_id), p_month, p_year) AS Total_Service_Fee,
        
        -- 3. THỰC NHẬN (Net Income)
        (
            IFNULL(SUM(ord.totalPrice), 0) - 
            Calc_OwnerFee(BIN_TO_UUID(o.user_id), p_month, p_year)
        ) AS Net_Income

    FROM owners o
    -- Join xuyên suốt từ Owner -> Location -> Venue -> Order
    JOIN locations l ON o.user_id = l.owner_id
    JOIN venues v ON l.location_id = v.location_id
    JOIN orders ord ON ord.venue_loc_id = v.location_id AND ord.venueName = v.name
    
    WHERE 
        ord.status = 'COMPLETED'       -- Chỉ lấy đơn hoàn tất
        AND MONTH(ord.endHour) = p_month -- Lọc theo tháng
        AND YEAR(ord.endHour) = p_year   -- Lọc theo năm
    
    GROUP BY o.user_id
    
    -- Chỉ hiện những Owner có phí phải đóng (> 0)
    -- Điều này đồng nghĩa doanh thu của họ > 5 triệu (theo logic trong hàm Fee)
    HAVING Total_Service_Fee > 0
    
    ORDER BY Total_Service_Fee DESC;

END$$

CREATE PROCEDURE GetUsersByRoleAndStatus(
    IN in_role VARCHAR(20),   -- Optional: 'ADMIN', 'OWNER', 'CLIENT', or NULL
    IN in_status BOOLEAN      -- Optional: 1 (Active), 0 (Inactive), or NULL
)
BEGIN
    -- Common Table Expression to calculate the role priority first
    WITH UserRoles AS (
        SELECT 
            u.id,
            u.email,
            u.firstName,
            u.lastName,
            u.phoneNo,
            u.isActive,
            u.createdAt,
            -- Determine Highest Role Priority
            CASE 
                WHEN u.isAdmin = 1 THEN 'ADMIN'
                WHEN o.user_id IS NOT NULL THEN 'OWNER'
                WHEN c.user_id IS NOT NULL THEN 'CLIENT'
                ELSE 'USER'
            END AS type
        FROM users u
        -- Left join to check existence in other tables
        LEFT JOIN owners o ON u.id = o.user_id
        LEFT JOIN clients c ON u.id = c.user_id
    )
    SELECT 
        BIN_TO_UUID(id) as id,
        email, 
        firstName, 
        lastName, 
        phoneNo, 
        type as userType, 
        isActive, 
        createdAt
    FROM UserRoles
    WHERE 
        -- Handle Optional Role Filter (Case insensitive)
        (in_role IS NULL OR type = UPPER(in_role))
        
        -- Handle Optional Status Filter
        AND (in_status IS NULL OR isActive = in_status)
        
    ORDER BY createdAt DESC;
END //

DELIMITER ;