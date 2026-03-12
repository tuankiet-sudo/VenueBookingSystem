user -> owner -> location -> venue -> amenity
user -> client -> search -> favor -> order -> invoice -> rate
user -> client -> search -> order -> cannot find that venue any

-- THÊM SAMPLE DATA TRC KHI THÊM TRIGGER
-- Cập nhật lại điểm cho toàn bộ Client dựa trên lịch sử đơn hàng
UPDATE clients c
LEFT JOIN (
    SELECT 
        client_id, 
        SUM(FLOOR(totalPrice / 10000)) AS total_calculated_points
    FROM orders
    WHERE status = 'COMPLETED'
    GROUP BY client_id
) o ON c.user_id = o.client_id
SET c.membership_points = IFNULL(o.total_calculated_points, 0);

-- 1. Đẩy lùi ngày tạo User về quá khứ
UPDATE users SET createdAt = '2020-01-01 00:00:00';

-- 2. Đẩy lùi ngày tạo Location (nếu có check)
UPDATE locations SET createdAt = '2020-01-01 00:00:00';

-- 3. Đẩy lùi ngày tạo Venue
UPDATE venues SET createdAt = '2020-01-01 00:00:00';

client:
signup -> edit profile -> search location, venue -> like,reload -> filter -> make order -> choose amenity, apply discount -> confirm order -> gen QR -> invoice succeed -> view order history -> chat with owner -> completed order -> rating

owner:
signup -> edit profile -> create location, venue, venue_img, amenity -> view order, revenue

owner2:
signin -> view order, revenue, deactive location -> restrict if upcoming order exist, delete location -> restrict if exist completed order

admin:
signin -> create discount, venuetype -> manage user, location, order