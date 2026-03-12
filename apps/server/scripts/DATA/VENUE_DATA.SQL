-- ==============================================================================
-- LOCATION 1: Sunrise Conference Hall (Chuyên Hội nghị lớn)
-- ID: 10101010-1010-1010-1010-101010101001
-- ==============================================================================

-- 1.1. Sảnh chính (Dùng loại Minimalist Large)
CALL Venue_Insert(
    '10101010-1010-1010-1010-101010101001',
    'Grand Sunrise Hall',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0003', -- Minimalist Large
    '1', 300.0, 5000000.00
);

-- 1.2. Phòng họp VIP (Dùng loại Luxury Small)
CALL Venue_Insert(
    '10101010-1010-1010-1010-101010101001',
    'Sunrise VIP Suite',
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0001', -- Luxury Small
    '2', 40.0, 1500000.00
);


-- ==============================================================================
-- LOCATION 2: Sunrise Annex (Khu phụ trợ, họp nhỏ)
-- ID: 10101010-1010-1010-1010-101010101002
-- ==============================================================================

-- 2.1. Phòng Training A (Minimalist Medium)
CALL Venue_Insert(
    '10101010-1010-1010-1010-101010101002',
    'Training Room A',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0002', -- Minimalist Medium
    '1', 60.0, 800000.00
);

-- 2.2. Phòng Training B (Minimalist Medium)
CALL Venue_Insert(
    '10101010-1010-1010-1010-101010101002',
    'Training Room B',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0002', -- Minimalist Medium
    '1', 55.0, 750000.00
);


-- ==============================================================================
-- LOCATION 3: Grace Events Center (Tiệc cưới, sự kiện)
-- ID: 20202020-2020-2020-2020-202020202001
-- ==============================================================================

-- 3.1. Đại sảnh tiệc cưới (Luxury Large)
CALL Venue_Insert(
    '20202020-2020-2020-2020-202020202001',
    'Grace Ballroom',
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0003', -- Luxury Large
    'G', 400.0, 12000000.00
);

-- 3.2. Sảnh đón khách ngoài trời (Outdoor Medium)
CALL Venue_Insert(
    '20202020-2020-2020-2020-202020202001',
    'Garden Foyer',
    'cccc3333-cccc-cccc-cccc-cccccccc0002', -- Outdoor Medium
    'G', 100.0, 3000000.00
);


-- ==============================================================================
-- LOCATION 4: Grace Studio Rooms (Studio, Workshop)
-- ID: 20202020-2020-2020-2020-202020202002
-- ==============================================================================

-- 4.1. Studio chụp ảnh (Minimalist Small)
CALL Venue_Insert(
    '20202020-2020-2020-2020-202020202002',
    'Photo Studio 1',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0001', -- Minimalist Small
    '2', 35.0, 500000.00
);

-- 4.2. Phòng Workshop sáng tạo (Minimalist Medium)
CALL Venue_Insert(
    '20202020-2020-2020-2020-202020202002',
    'Creative Hub',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0002', -- Minimalist Medium
    '2', 70.0, 900000.00
);


-- ==============================================================================
-- LOCATION 5: Heidi Banquet Hall (Tiệc sang trọng)
-- ID: 30303030-3030-3030-3030-303030303001
-- ==============================================================================

-- 5.1. Sảnh tiệc chính (Luxury Large)
CALL Venue_Insert(
    '30303030-3030-3030-3030-303030303001',
    'Royal Banquet Hall',
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0003', -- Luxury Large
    '1', 500.0, 15000000.00
);

-- 5.2. Phòng tiệc riêng (Luxury Medium)
CALL Venue_Insert(
    '30303030-3030-3030-3030-303030303001',
    'Private Dining Room',
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0002', -- Luxury Medium
    '2', 80.0, 4000000.00
);


-- ==============================================================================
-- LOCATION 6: Heidi Meeting Suites (Phòng họp nhỏ)
-- ID: 30303030-3030-3030-3030-303030303002
-- ==============================================================================

-- 6.1. Phòng họp nhóm (Minimalist Small)
CALL Venue_Insert(
    '30303030-3030-3030-3030-303030303002',
    'Meeting Suite A',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0001', -- Minimalist Small
    '3', 20.0, 200000.00
);

-- 6.2. Phòng phỏng vấn (Minimalist Small)
CALL Venue_Insert(
    '30303030-3030-3030-3030-303030303002',
    'Interview Room',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0001', -- Minimalist Small
    '3', 15.0, 150000.00
);


-- ==============================================================================
-- LOCATION 7: Ivan Rooftop Venue (Sự kiện ngoài trời)
-- ID: 40404040-4040-4040-4040-404040404001
-- ==============================================================================

-- 7.1. Sân thượng Chill (Outdoor Medium)
CALL Venue_Insert(
    '40404040-4040-4040-4040-404040404001',
    'Sky Bar Area',
    'cccc3333-cccc-cccc-cccc-cccccccc0002', -- Outdoor Medium
    'R', 120.0, 2500000.00
);

-- 7.2. Khu BBQ (Outdoor Small)
CALL Venue_Insert(
    '40404040-4040-4040-4040-404040404001',
    'BBQ Corner',
    'cccc3333-cccc-cccc-cccc-cccccccc0001', -- Outdoor Small
    'R', 40.0, 1000000.00
);


-- ==============================================================================
-- LOCATION 8: Ivan Conference Rooms (Hội nghị văn phòng)
-- ID: 40404040-4040-4040-4040-404040404002
-- ==============================================================================

-- 8.1. Phòng hội thảo lớn (Minimalist Large)
CALL Venue_Insert(
    '40404040-4040-4040-4040-404040404002',
    'Conference Hall B',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0003', -- Minimalist Large
    '2', 150.0, 3000000.00
);

-- 8.2. Phòng họp Board (Luxury Small)
CALL Venue_Insert(
    '40404040-4040-4040-4040-404040404002',
    'Board Room',
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0001', -- Luxury Small
    '2', 50.0, 1200000.00
);


-- ==============================================================================
-- LOCATION 9: Judy Event Space (Triển lãm, Pop-up)
-- ID: 50505050-5050-5050-5050-505050505001
-- ==============================================================================

-- 9.1. Không gian triển lãm (Minimalist Large)
CALL Venue_Insert(
    '50505050-5050-5050-5050-505050505001',
    'Main Gallery',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0003', -- Minimalist Large
    '1', 200.0, 4000000.00
);

-- 9.2. Khu vực Pop-up (Minimalist Medium)
CALL Venue_Insert(
    '50505050-5050-5050-5050-505050505001',
    'Pop-up Store Area',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0002', -- Minimalist Medium
    '1', 60.0, 1000000.00
);


-- ==============================================================================
-- LOCATION 10: Judy Workshop Hub (Thủ công, workshop)
-- ID: 50505050-5050-5050-5050-505050505002
-- ==============================================================================

-- 10.1. Phòng làm gốm (Minimalist Small)
CALL Venue_Insert(
    '50505050-5050-5050-5050-505050505002',
    'Pottery Studio',
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0001', -- Minimalist Small
    'G', 30.0, 400000.00
);

-- 10.2. Phòng vẽ tranh (Outdoor Small - Giả sử có giếng trời/sân trong)
CALL Venue_Insert(
    '50505050-5050-5050-5050-505050505002',
    'Art Garden',
    'cccc3333-cccc-cccc-cccc-cccccccc0001', -- Outdoor Small
    'G', 40.0, 500000.00
);