-- =================================================================
-- NHÓM 1: CHỈ LÀ CLIENT (Users 1 -> 5)
-- Slug format: 'client000X' (10 chars)
-- =================================================================

-- User 1: Alice (ID giả định: 11...11)
CALL Client_Insert('11111111-1111-1111-1111-111111111111', 'client0001');

-- User 2: Bob
CALL Client_Insert('22222222-2222-2222-2222-222222222222', 'client0002');

-- User 3: Charlie
CALL Client_Insert('33333333-3333-3333-3333-333333333333', 'client0003');

-- User 4: David
CALL Client_Insert('44444444-4444-4444-4444-444444444444', 'client0004');

-- User 5: Eve
CALL Client_Insert('55555555-5555-5555-5555-555555555555', 'client0005');


-- =================================================================
-- NHÓM 2: VỪA LÀ CLIENT, VỪA LÀ OWNER (Users 6 -> 10)
-- =================================================================

-- User 6: Frank
CALL Client_Insert('66666666-6666-6666-6666-666666666666', 'client0006');
-- (Insert Owner không đổi)
CALL Owner_Insert('66666666-6666-6666-6666-666666666666', 'VCB', 'Vietcombank', 'FRANK VU', '0011223344');

-- User 7: Grace
CALL Client_Insert('77777777-7777-7777-7777-777777777777', 'client0007');
CALL Owner_Insert('77777777-7777-7777-7777-777777777777', 'TCB', 'Techcombank', 'GRACE DO', '0022334455');

-- User 8: Heidi
CALL Client_Insert('88888888-8888-8888-8888-888888888888', 'client0008');
CALL Owner_Insert('88888888-8888-8888-8888-888888888888', 'MB', 'MB Bank', 'HEIDI NGO', '0033445566');

-- User 9: Ivan
CALL Client_Insert('99999999-9999-9999-9999-999999999999', 'client0009');
CALL Owner_Insert('99999999-9999-9999-9999-999999999999', 'ACB', 'Asia Commercial Bank', 'IVAN BUI', '0044556677');

-- User 10: Judy
CALL Client_Insert('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'client0010');
CALL Owner_Insert('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BIDV', 'BIDV', 'JUDY DANG', '0055667788');