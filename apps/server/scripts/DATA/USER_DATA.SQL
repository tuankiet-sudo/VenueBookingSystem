-- User 1: Alice Nguyen
CALL User_Insert(
    '11111111-1111-1111-1111-111111111111', 
    'alice.nguyen@email.com', 
    'password123', 
    'Alice', 
    'Nguyen', 
    '0901111111', 
    'https://example.com/avatar/alice.jpg', 
    '1990-05-15' -- 34 tuổi
);

-- User 2: Bob Tran
CALL User_Insert(
    '22222222-2222-2222-2222-222222222222', 
    'bob.tran@email.com', 
    'securePass456', 
    'Bob', 
    'Tran', 
    '0902222222', 
    'https://example.com/avatar/bob.png', 
    '1985-10-20' -- 39 tuổi
);

-- User 3: Charlie Le
CALL User_Insert(
    '33333333-3333-3333-3333-333333333333', 
    'charlie.le@email.com', 
    'mySecret789', 
    'Charlie', 
    'Le', 
    '0903333333', 
    NULL, -- Avatar có thể NULL (nếu bảng cho phép, hoặc truyền chuỗi rỗng)
    '2000-01-01' -- 24 tuổi
);

-- User 4: David Pham
CALL User_Insert(
    '44444444-4444-4444-4444-444444444444', 
    'david.pham@email.com', 
    'davidPass!', 
    'David', 
    'Pham', 
    '0904444444', 
    'https://example.com/avatar/david.jpg', 
    '1995-12-25' -- 29 tuổi
);

-- User 5: Eve Hoang
CALL User_Insert(
    '55555555-5555-5555-5555-555555555555', 
    'eve.hoang@email.com', 
    'eve@2024', 
    'Eve', 
    'Hoang', 
    '0905555555', 
    'https://example.com/avatar/eve.png', 
    '1998-07-07' -- 26 tuổi
);

-- User 6: Frank Vu
CALL User_Insert(
    '66666666-6666-6666-6666-666666666666', 
    'frank.vu@email.com', 
    'frankie123', 
    'Frank', 
    'Vu', 
    '0906666666', 
    NULL, 
    '1988-03-30' -- 36 tuổi
);

-- User 7: Grace Do
CALL User_Insert(
    '77777777-7777-7777-7777-777777777777', 
    'grace.do@email.com', 
    'gracePass99', 
    'Grace', 
    'Do', 
    '0907777777', 
    'https://example.com/avatar/grace.jpg', 
    '2002-09-09' -- 22 tuổi
);

-- User 8: Heidi Ngo
CALL User_Insert(
    '88888888-8888-8888-8888-888888888888', 
    'heidi.ngo@email.com', 
    'heidi_secure', 
    'Heidi', 
    'Ngo', 
    '0908888888', 
    'https://example.com/avatar/heidi.png', 
    '1993-11-11' -- 31 tuổi
);

-- User 9: Ivan Bui
CALL User_Insert(
    '99999999-9999-9999-9999-999999999999', 
    'ivan.bui@email.com', 
    'ivanTheGreat', 
    'Ivan', 
    'Bui', 
    '0909999999', 
    NULL, 
    '1991-04-14' -- 33 tuổi
);

-- User 10: Judy Dang
CALL User_Insert(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
    'judy.dang@email.com', 
    'judyP@ss', 
    'Judy', 
    'Dang', 
    '0901010101', 
    'https://example.com/avatar/judy.jpg', 
    '1999-08-19' -- 25 tuổi
);