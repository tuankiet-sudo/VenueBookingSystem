-- ===========================================================
-- NHÓM 1: MINIMALIST
-- ===========================================================

-- 1. Small (1-40)
CALL VenueType_Insert(
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0001', 
    'Minimalist', 
    'Không gian tối giản, gọn gàng dành cho các nhóm nhỏ (Size S).', 
    1, 40
);

-- 2. Medium (40-80)
CALL VenueType_Insert(
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0002', 
    'Minimalist', 
    'Phòng họp phong cách tối giản, phù hợp training (Size M).', 
    40, 80
);

-- 3. Large (80-120)
CALL VenueType_Insert(
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0003', 
    'Minimalist', 
    'Sảnh lớn thiết kế tối giản cho sự kiện đông người (Size L).', 
    80, 120
);


-- ===========================================================
-- NHÓM 2: LUXURY
-- ===========================================================

-- 4. Small (1-40)
CALL VenueType_Insert(
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0001', 
    'Luxury', 
    'Phòng VIP sang trọng cho cuộc họp kín (Size S).', 
    1, 40
);

-- 5. Medium (40-80)
CALL VenueType_Insert(
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0002', 
    'Luxury', 
    'Không gian tiệc sang trọng, trang trí cầu kỳ (Size M).', 
    40, 80
);

-- 6. Large (80-120)
CALL VenueType_Insert(
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0003', 
    'Luxury', 
    'Đại sảnh Luxury đẳng cấp 5 sao (Size L).', 
    80, 120
);


-- ===========================================================
-- NHÓM 3: OUTDOOR
-- ===========================================================

-- 7. Small (1-40)
CALL VenueType_Insert(
    'cccc3333-cccc-cccc-cccc-cccccccc0001', 
    'Outdoor', 
    'Góc sân vườn nhỏ xanh mát (Size S).', 
    1, 40
);

-- 8. Medium (40-80)
CALL VenueType_Insert(
    'cccc3333-cccc-cccc-cccc-cccccccc0002', 
    'Outdoor', 
    'Khu vực bãi cỏ hoặc sân thượng thoáng đãng (Size M).', 
    40, 80
);

-- 9. Large (80-120)
CALL VenueType_Insert(
    'cccc3333-cccc-cccc-cccc-cccccccc0003', 
    'Outdoor', 
    'Không gian sự kiện ngoài trời rộng lớn (Size L).', 
    80, 120
);