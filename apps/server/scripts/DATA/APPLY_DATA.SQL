-- =============================================================================
-- ÁP DỤNG MÃ GIẢM GIÁ CHO CÁC ĐƠN HÀNG THÁNG 10/2025
-- =============================================================================

-- 1. ALICE (Gold): Áp dụng D1 (Welcome 10%) cho đơn lớn
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Grand Sunrise Hall' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000001' -- WELCOME10
);

-- 2. BOB (Gold): Áp dụng D1 (Welcome 10%) cho đơn lớn
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Grace Ballroom' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000001' -- WELCOME10
);

-- 3. CHARLIE (Silver): Áp dụng D3 (Flash Sale - dành cho Silver)
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Garden Foyer' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000003' -- OCTOBER FLASH SALE
);

-- 4. DAVID (Platinum): Áp dụng D5 (Platinum Exclusive - Đơn > 10tr)
-- Đơn này 60tr -> Thỏa mãn
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Royal Banquet Hall' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000005' -- PLATINUM EXCLUSIVE
);
-- David cũng dùng thêm D1 cho đơn này (Được phép dùng 2 mã nếu không conflict logic)
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Royal Banquet Hall' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000001' -- WELCOME10
);

-- 5. EVE (Silver): 
-- Đơn 1: Dùng D3 (Flash Sale)
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Private Dining Room' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000003' -- OCTOBER FLASH SALE
);
-- Đơn 2: Dùng D4 (Small Room Promo) cho phòng Meeting Suite A (Là loại Small)
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Meeting Suite A' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000004' -- SMALL ROOM SPECIAL
);

-- 6. FRANK (Silver):
-- Đơn 1: Dùng D4 (Small Room Promo) cho Interview Room
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Interview Room' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000004' -- SMALL ROOM SPECIAL
);
-- Đơn 2: Dùng D1 (Welcome) cho Sky Bar
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Sky Bar Area' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000001' -- WELCOME10
);

-- 7. GRACE (Gold): Áp dụng D1 cho Conference Hall
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Conference Hall B' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000001' -- WELCOME10
);

-- 8. HEIDI (Platinum): "Combo" 2 mã cho đơn 48tr
-- Mã D2 (Luxury October - dành cho Platinum + Luxury Large)
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Main Gallery' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000002' -- LUXURY OCTOBER
);
-- Mã D5 (Platinum Exclusive)
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Main Gallery' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000005' -- PLATINUM EXCLUSIVE
);

-- 9. IVAN (Gold): 
-- Đơn 1: D1
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Pop-up Store Area' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000001' -- WELCOME10
);
-- Đơn 2: D4 (Small Promo) cho Pottery Studio
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Pottery Studio' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000004' -- SMALL ROOM SPECIAL
);

-- 10. JUDY (Silver): Dùng D3 cho Sunrise VIP Suite
CALL Applies_Insert(
    (SELECT BIN_TO_UUID(order_id) FROM orders WHERE venueName = 'Sunrise VIP Suite' AND status = 'COMPLETED' LIMIT 1),
    'dddd0000-0000-0000-0000-000000000003' -- OCTOBER FLASH SALE
);