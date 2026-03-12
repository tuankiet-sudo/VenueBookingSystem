-- ==================================================
-- Locations for Frank Ho (Owner ID: 66...66)
-- ==================================================

-- 1. Sunrise Conference Hall
CALL Location_Insert(
    '10101010-1010-1010-1010-101010101001',       -- p_id
    '66666666-6666-6666-6666-666666666666',       -- p_ownerId
    'Sunrise Conference Hall',                    -- p_name
    'Spacious conference hall with AV system and stage. Capacity up to 200.', -- p_desc
    '12A',                                        -- p_addrNo
    'Ward 1',                                     -- p_ward
    'Hồ Chí Minh',                           -- p_city
    '0901234001',                                 -- p_phoneNo
    'No smoking. No outside catering without permission.', -- p_policy
    'https://maps.example.com/?q=Sunrise+Conference+Hall', -- p_mapURL
    'https://example.com/thumbs/sunrise_hall.jpg' -- p_thumbnailURL
);

-- 2. Sunrise Annex
CALL Location_Insert(
    '10101010-1010-1010-1010-101010101002',
    '66666666-6666-6666-6666-666666666666',
    'Sunrise Annex',
    'Smaller meeting rooms and breakout spaces adjacent to the main hall.',
    '14B',
    'Ward 1',
    'Hồ Chí Minh',
    '0901234002',
    'Equipment rental extra. Booking deposit required.',
    'https://maps.example.com/?q=Sunrise+Annex',
    'https://example.com/thumbs/sunrise_annex.jpg'
);

-- ==================================================
-- Locations for Grace Lam (Owner ID: 77...77)
-- ==================================================

-- 3. Grace Events Center
CALL Location_Insert(
    '20202020-2020-2020-2020-202020202001',
    '77777777-7777-7777-7777-777777777777',
    'Grace Events Center',
    'Modern events center suitable for weddings, conferences and banquets.',
    '88',
    'Ward 5',
    'Hanoi',
    '0901234101',
    'Cancellations within 7 days are non-refundable.',
    'https://maps.example.com/?q=Grace+Events+Center',
    'https://example.com/thumbs/grace_events.jpg'
);

-- 4. Grace Studio Rooms
CALL Location_Insert(
    '20202020-2020-2020-2020-202020202002',
    '77777777-7777-7777-7777-777777777777',
    'Grace Studio Rooms',
    'Flexible studio rooms for workshops and small classes (20–40 pax).',
    '90',
    'Ward 5',
    'Hanoi',
    '0901234102',
    'Please respect quiet hours after 22:00.',
    'https://maps.example.com/?q=Grace+Studio+Rooms',
    'https://example.com/thumbs/grace_studio.jpg'
);

-- ==================================================
-- Locations for Heidi Kim (Owner ID: 88...88)
-- ==================================================

-- 5. Heidi Banquet Hall
CALL Location_Insert(
    '30303030-3030-3030-3030-303030303001',
    '88888888-8888-8888-8888-888888888888',
    'Heidi Banquet Hall',
    'Elegant banquet hall with in-house catering options and decoration services.',
    '5',
    'Ward 2',
    'Da Nang',
    '0901234201',
    'Decoration allowed 4 hours prior; extra fees may apply.',
    'https://maps.example.com/?q=Heidi+Banquet+Hall',
    'https://example.com/thumbs/heidi_banquet.jpg'
);

-- 6. Heidi Meeting Suites
CALL Location_Insert(
    '30303030-3030-3030-3030-303030303002',
    '88888888-8888-8888-8888-888888888888',
    'Heidi Meeting Suites',
    'Compact meeting suites with whiteboards and high-speed internet.',
    '7',
    'Ward 2',
    'Da Nang',
    '0901234202',
    'Free Wi-Fi included; refunds subject to policy.',
    'https://maps.example.com/?q=Heidi+Meeting+Suites',
    'https://example.com/thumbs/heidi_suites.jpg'
);

-- ==================================================
-- Locations for Ivan Tran (Owner ID: 99...99)
-- ==================================================

-- 7. Ivan Rooftop Venue
CALL Location_Insert(
    '40404040-4040-4040-4040-404040404001',
    '99999999-9999-9999-9999-999999999999',
    'Ivan Rooftop Venue',
    'Open-air rooftop venue perfect for evening events and parties.',
    '22',
    'Ward 10',
    'Hồ Chí Minh',
    '0901234301',
    'Outdoor events subject to weather; backup indoors recommended.',
    'https://maps.example.com/?q=Ivan+Rooftop+Venue',
    'https://example.com/thumbs/ivan_rooftop.jpg'
);

-- 8. Ivan Conference Rooms
CALL Location_Insert(
    '40404040-4040-4040-4040-404040404002',
    '99999999-9999-9999-9999-999999999999',
    'Ivan Conference Rooms',
    'Air-conditioned conference rooms with projector and seating for 50–120.',
    '24',
    'Ward 10',
    'Hồ Chí Minh',
    '0901234302',
    'Projector included; drinks allowed in designated areas.',
    'https://maps.example.com/?q=Ivan+Conference+Rooms',
    'https://example.com/thumbs/ivan_conference.jpg'
);

-- ==================================================
-- Locations for Judy Nguyen (Owner ID: aa...aa)
-- ==================================================

-- 9. Judy Event Space
CALL Location_Insert(
    '50505050-5050-5050-5050-505050505001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Judy Event Space',
    'Bright, contemporary event space good for exhibitions and pop-ups.',
    '3C',
    'Ward 7',
    'Hanoi',
    '0901234401',
    'No open flames. Security deposit required for exhibitions.',
    'https://maps.example.com/?q=Judy+Event+Space',
    'https://example.com/thumbs/judy_space.jpg'
);

-- 10. Judy Workshop Hub
CALL Location_Insert(
    '50505050-5050-5050-5050-505050505002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Judy Workshop Hub',
    'Cozy hub for creative workshops and small seminars (10–30 pax).',
    '3D',
    'Ward 7',
    'Hanoi',
    '0901234402',
    'Please clean up after use; overtime charged per hour.',
    'https://maps.example.com/?q=Judy+Workshop+Hub',
    'https://example.com/thumbs/judy_workshop.jpg'
);