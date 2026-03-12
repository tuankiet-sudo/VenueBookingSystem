-- =============================================================================
-- NHÓM 1: HIỆU LỰC TỪ THÁNG 9 ĐẾN HẾT THÁNG 12 NĂM 2025 (2 MÃ)
-- =============================================================================

-- 1. WELCOME2025 (Giảm 10% cho tất cả)
CALL Discount_Insert(
    'dddd0000-0000-0000-0000-000000000001',  -- ID
    'WELCOME 2025',                          -- Name
    10,                                      -- Percent
    500000.00,                               -- Max giảm 500k
    NULL,                                    -- Không yêu cầu tối thiểu
    NULL,                                    -- Áp dụng mọi loại phòng
    NULL,                                    -- Áp dụng mọi khách
    '2025-09-01 00:00:00',                   -- Bắt đầu T9
    '2025-12-31 23:59:59'                    -- Kết thúc T12
);

-- 2. PLATINUM_YEAR_END (Giảm 25% cho khách VIP dịp cuối năm)
CALL Discount_Insert(
    'dddd0000-0000-0000-0000-000000000005',
    'PLATINUM YEAR END',
    25,
    5000000.00,                              -- Max giảm 5tr
    10000000.00,                             -- Đơn tối thiểu 10tr
    NULL,                                    -- Áp dụng mọi loại phòng
    'PLATINUM',                              -- Chỉ khách Platinum
    '2025-09-01 00:00:00',                   -- Bắt đầu T9
    '2025-12-31 23:59:59'                    -- Kết thúc T12
);


-- =============================================================================
-- NHÓM 2: CHỈ HIỆU LỰC TRONG THÁNG 10 NĂM 2025 (3 MÃ)
-- =============================================================================

-- 3. LUXURY_OCTOBER (Giảm 15% cho phòng Luxury Large)
CALL Discount_Insert(
    'dddd0000-0000-0000-0000-000000000002',
    'LUXURY OCTOBER',
    15,
    2000000.00,                              -- Max giảm 2tr
    5000000.00,                              -- Đơn tối thiểu 5tr
    'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbb0003',  -- Chỉ áp dụng cho Luxury Large
    'PLATINUM',                              -- Chỉ khách Platinum
    '2025-10-01 00:00:00',                   -- Đầu tháng 10
    '2025-10-31 23:59:59'                    -- Cuối tháng 10
);

-- 4. OCT_FLASH_SALE (Giảm 20% cho khách Silver)
CALL Discount_Insert(
    'dddd0000-0000-0000-0000-000000000003',
    'OCTOBER FLASH SALE',
    20,
    1000000.00,                              -- Max giảm 1tr
    1000000.00,                              -- Đơn tối thiểu 1tr
    NULL,                                    -- Áp dụng mọi loại phòng
    'SILVER',                                -- Chỉ khách Silver
    '2025-10-01 00:00:00',
    '2025-10-31 23:59:59'
);

-- 5. SMALL_ROOM_PROMO (Giảm 5% cho phòng nhỏ)
CALL Discount_Insert(
    'dddd0000-0000-0000-0000-000000000004',
    'SMALL ROOM SPECIAL',
    5,
    200000.00,                               -- Max giảm 200k
    NULL,                                    -- Không yêu cầu tối thiểu
    'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaa0001',  -- Chỉ Minimalist Small
    NULL,                                    -- Áp dụng mọi khách
    '2025-10-01 00:00:00',
    '2025-10-31 23:59:59'
);