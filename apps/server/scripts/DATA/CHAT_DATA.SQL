-- =============================================================================
-- CHANNEL 1: Alice (1111...) & Frank (6666...) - Sunrise Hall
-- =============================================================================
-- Msg 1: Alice hỏi về máy chiếu
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), -- User 1 (Nhỏ)
    UUID_TO_BIN('66666666-6666-6666-6666-666666666666'), -- User 2 (Lớn)
    UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), -- Sender: Alice
    'Hi Frank, is the 4K projector included in the Large Hall rental price?', 
    DATE_SUB(NOW(), INTERVAL 2 DAY)
);

-- Msg 2: Frank trả lời
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 
    UUID_TO_BIN('66666666-6666-6666-6666-666666666666'), 
    UUID_TO_BIN('66666666-6666-6666-6666-666666666666'), -- Sender: Frank
    'Hello Alice. No, amenities are rented separately. You can select them during booking!', 
    DATE_SUB(NOW(), INTERVAL 2 DAY)
);


-- =============================================================================
-- CHANNEL 2: Bob (2222...) & Grace (7777...) - Grace Events Center
-- =============================================================================
-- Msg 1: Bob hỏi lịch xem phòng
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), 
    UUID_TO_BIN('77777777-7777-7777-7777-777777777777'), 
    UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), -- Sender: Bob
    'Can I come over to check the venue tomorrow morning?', 
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- Msg 2: Grace xác nhận
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('22222222-2222-2222-2222-222222222222'), 
    UUID_TO_BIN('77777777-7777-7777-7777-777777777777'), 
    UUID_TO_BIN('77777777-7777-7777-7777-777777777777'), -- Sender: Grace
    'Sure Bob! I will be at the reception desk at 9 AM.', 
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);


-- =============================================================================
-- CHANNEL 3: Charlie (3333...) & Heidi (8888...) - Heidi Banquet
-- =============================================================================
-- Msg 1: Charlie hỏi về thực đơn chay
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('33333333-3333-3333-3333-333333333333'), 
    UUID_TO_BIN('88888888-8888-8888-8888-888888888888'), 
    UUID_TO_BIN('33333333-3333-3333-3333-333333333333'), -- Sender: Charlie
    'Do you provide a full Vegan menu for the Gala Dinner set?', 
    DATE_SUB(NOW(), INTERVAL 5 HOUR)
);

-- Msg 2: Heidi trả lời
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('33333333-3333-3333-3333-333333333333'), 
    UUID_TO_BIN('88888888-8888-8888-8888-888888888888'), 
    UUID_TO_BIN('88888888-8888-8888-8888-888888888888'), -- Sender: Heidi
    'Yes, we have a specialized Vegan option. I can send you the PDF menu via email.', 
    DATE_SUB(NOW(), INTERVAL 4 HOUR)
);


-- =============================================================================
-- CHANNEL 4: David (4444...) & Ivan (9999...) - Ivan Rooftop
-- =============================================================================
-- Msg 1: David lo lắng về trời mưa
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('44444444-4444-4444-4444-444444444444'), 
    UUID_TO_BIN('99999999-9999-9999-9999-999999999999'), 
    UUID_TO_BIN('44444444-4444-4444-4444-444444444444'), -- Sender: David
    'Is the rooftop venue covered? I am worried about rain next week.', 
    NOW()
);

-- Msg 2: Ivan trấn an
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('44444444-4444-4444-4444-444444444444'), 
    UUID_TO_BIN('99999999-9999-9999-9999-999999999999'), 
    UUID_TO_BIN('99999999-9999-9999-9999-999999999999'), -- Sender: Ivan
    'Don\'t worry David, we have a retractable roof system for rainy days!', 
    NOW()
);


-- =============================================================================
-- CHANNEL 5: Alice (1111...) & Grace (7777...) - Grace Center
-- =============================================================================
-- Msg 1: Alice hỏi mã giảm giá
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 
    UUID_TO_BIN('77777777-7777-7777-7777-777777777777'), 
    UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), -- Sender: Alice
    'Hi Grace, do you have any promotion codes for loyal members?', 
    NOW()
);

-- Msg 2: Grace trả lời
INSERT INTO messages (message_id, channel_user_1_id, channel_user_2_id, sender_id, content, sentAt)
VALUES (
    UUID_TO_BIN(UUID()), 
    UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 
    UUID_TO_BIN('77777777-7777-7777-7777-777777777777'), 
    UUID_TO_BIN('77777777-7777-7777-7777-777777777777'), -- Sender: Grace
    'Absolutely! Since you are a Gold Member, try using code "GOLD2025" for 10% off.', 
    NOW()
);