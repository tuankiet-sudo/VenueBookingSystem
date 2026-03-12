-- 1. USERS
CREATE TABLE users (
    id BINARY(16),
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL, -- hashed password
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    phoneNo VARCHAR(10),
    avatarURL VARCHAR(255),
    DoB DATE NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    isAdmin BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    
    -- Check constraints
    CONSTRAINT chk_users_email_format CHECK (email REGEXP '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$'),
    CONSTRAINT chk_users_firstName CHECK (firstName REGEXP '^[A-Za-z]+$'),
    CONSTRAINT chk_users_lastName CHECK (lastName REGEXP '^[A-Za-z]+$'),
    CONSTRAINT chk_users_phoneNo CHECK (phoneNo REGEXP '^[0-9]+$')
);

-- 2. CLIENTS
CREATE TABLE clients (
    user_id BINARY(16),
    slug VARCHAR(10) NOT NULL,
    membership_points INT DEFAULT 0,

    CONSTRAINT pk_clients PRIMARY KEY (user_id),
    CONSTRAINT uq_clients_slug UNIQUE (slug),
    CONSTRAINT fk_clients_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 3. OWNERS
CREATE TABLE owners (
    user_id BINARY(16),
    bankId VARCHAR(50) NOT NULL,
    bankName VARCHAR(100) NOT NULL,
    accountName VARCHAR(50) NOT NULL,
    accountNo VARCHAR(50) NOT NULL,

    CONSTRAINT pk_owners PRIMARY KEY (user_id),
    CONSTRAINT fk_owners_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 4. LOCATIONS
CREATE TABLE locations (
    location_id BINARY(16),
    owner_id BINARY(16) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    addrNo VARCHAR(20) NOT NULL,
    ward VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    avgRating DECIMAL(2,1) DEFAULT 0,
    policy TEXT,
    phoneNo VARCHAR(10),
    mapURL VARCHAR(255) NOT NULL,
    thumbnailURL VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_locations PRIMARY KEY (location_id),
    CONSTRAINT fk_locations_owners FOREIGN KEY (owner_id) REFERENCES owners(user_id) ON DELETE RESTRICT,
    CONSTRAINT chk_locations_phoneNo CHECK (phoneNo REGEXP '^[0-9]+$')
);

-- 5. VENUE_TYPES
CREATE TABLE venue_types ( 
    venueType_id BINARY(16),
    name VARCHAR(50) NOT NULL, -- Minimalist, Luxury, Outdoor
    description TEXT,
    minCapacity INT NOT NULL, -- 3 type small 0-40, medium 40-80, large 80-120
    maxCapacity INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_venue_types PRIMARY KEY (venueType_id),
    CONSTRAINT chk_venue_types_minCap CHECK (minCapacity > 0),
    CONSTRAINT chk_venue_types_maxCap CHECK (maxCapacity > 0),
    CONSTRAINT chk_venue_types_range CHECK (maxCapacity >= minCapacity)
);

-- 6. VENUES
CREATE TABLE venues (
    location_id BINARY(16) NOT NULL,
    name VARCHAR(100) NOT NULL,
    venueType_id BINARY(16),
    floor VARCHAR(10) NOT NULL,
    area DECIMAL(10, 1) NOT NULL,
    pricePerHour DECIMAL(10, 2) NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_venues PRIMARY KEY (location_id, name),
    
    CONSTRAINT fk_venues_locations FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
    CONSTRAINT fk_venues_venue_types FOREIGN KEY (venueType_id) REFERENCES venue_types(venueType_id) ON DELETE RESTRICT,
    
    CONSTRAINT chk_venues_area CHECK (area > 0),
    CONSTRAINT chk_venues_price CHECK (pricePerHour > 0)
);

-- 7. VENUE_IMAGES
CREATE TABLE venue_images (
    location_id BINARY(16) NOT NULL,
    venueName VARCHAR(100) NOT NULL,
    locationImgURL VARCHAR(255) NOT NULL,

    CONSTRAINT pk_venue_images PRIMARY KEY (location_id, venueName, locationImgURL),
    
    CONSTRAINT fk_venue_images_venues FOREIGN KEY (location_id, venueName) 
        REFERENCES venues(location_id, name) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. AMENITIES
CREATE TABLE amenities (
    amenity_name VARCHAR(50) NOT NULL,
    location_id BINARY(16) NOT NULL, 
    category VARCHAR(50) NOT NULL, -- Projector, Catering, Audio Set
    description TEXT,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    isActive BOOLEAN DEFAULT 1, -- 1 là đang trong kho sẵn sàng phục vụ, 0 thì là đang dùng hoặc hỏng
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_amenities PRIMARY KEY (amenity_name, location_id),
    CONSTRAINT fk_amenities_locations FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
    CONSTRAINT chk_amenities_price CHECK (price >= 0)
);

-- 9. ORDERS
CREATE TABLE orders (
    order_id BINARY(16),
    client_id BINARY(16),
    venue_loc_id BINARY(16),
    venueName VARCHAR(100),
    totalPrice DECIMAL(12, 2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    startHour DATETIME NOT NULL,
    endHour DATETIME NOT NULL,
    points INT NOT NULL,
    expiredAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_orders PRIMARY KEY (order_id),
    
    CONSTRAINT fk_orders_clients FOREIGN KEY (client_id) REFERENCES clients(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_venues FOREIGN KEY (venue_loc_id, venueName) 
        REFERENCES venues(location_id, name) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    CONSTRAINT chk_orders_totalPrice CHECK (totalPrice >= 0),
    CONSTRAINT chk_orders_points CHECK (points >= 0),
    CONSTRAINT chk_orders_same_day CHECK (HOUR(startHour) >= 6 AND HOUR(endHour) <= 23 AND DATE(startHour) = DATE(endHour)),
    CONSTRAINT chk_orders_time_range CHECK (endHour > startHour),
    CONSTRAINT chk_orders_lead_time CHECK (startHour >= DATE_ADD(createdAt, INTERVAL 4 HOUR)) -- phải được đặt trước 4 tiếng
);

-- 10. ORDER_AMENITIES
CREATE TABLE order_amenities (
    order_id BINARY(16) NOT NULL,
    location_id BINARY(16) NOT NULL, 
    amenity_name VARCHAR(100) NOT NULL,
    
    CONSTRAINT pk_order_amenities PRIMARY KEY (order_id, location_id, amenity_name),
    
    CONSTRAINT fk_order_amenities_orders FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_amenities_amenities FOREIGN KEY (amenity_name, location_id) 
        REFERENCES amenities(amenity_name, location_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 11. DISCOUNTS
CREATE TABLE discounts (
    discount_id BINARY(16),
    name VARCHAR(100) NOT NULL,
    percentage INT NOT NULL,
    maxDiscountPrice DECIMAL(12, 2),
    minPrice DECIMAL(12, 2),
    venueTypeId BINARY(16),
    membershipTier ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'),
    startedAt DATETIME NOT NULL,
    expiredAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_discounts PRIMARY KEY (discount_id),
    CONSTRAINT fk_discounts_venue_types FOREIGN KEY (venueTypeId) REFERENCES venue_types(venueType_id) ON DELETE RESTRICT,
    
    CONSTRAINT chk_discounts_percent CHECK (percentage BETWEEN 0 AND 100),
    CONSTRAINT chk_discounts_date CHECK (expiredAt > startedAt),
    CONSTRAINT chk_discounts_maxPrice CHECK (maxDiscountPrice IS NULL OR maxDiscountPrice >= 0),
    CONSTRAINT chk_discounts_minPrice CHECK (minPrice IS NULL OR minPrice >= 0)
);

-- 12. APPLIES
CREATE TABLE applies (
    order_id BINARY(16) NOT NULL,
    discount_id BINARY(16) NOT NULL,

    CONSTRAINT pk_applies PRIMARY KEY (order_id, discount_id),
    CONSTRAINT fk_applies_orders FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_applies_discounts FOREIGN KEY (discount_id) REFERENCES discounts(discount_id) ON DELETE RESTRICT
);

-- 13. INVOICES
CREATE TABLE invoices (
    invoice_id BINARY(16),
    order_id BINARY(16),
    amount DECIMAL(12, 2) NOT NULL,
    status ENUM('PENDING', 'SUCCEEDED', 'FAILED') DEFAULT 'PENDING',
    senderBankAccount VARCHAR(50),
    receiverBankAccount VARCHAR(50),
    transaction_id VARCHAR(50),
    paidOn DATETIME,
    description TEXT,

    CONSTRAINT pk_invoices PRIMARY KEY (invoice_id),
    CONSTRAINT fk_invoices_orders FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT,
    CONSTRAINT chk_invoices_amount CHECK (amount >= 0)
);

-- 14. RATES
CREATE TABLE rates (
    client_id BINARY(16),
    location_id BINARY(16),
    stars INT, 
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_rates PRIMARY KEY (client_id, location_id),
    CONSTRAINT fk_rates_clients FOREIGN KEY (client_id) REFERENCES clients(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_rates_locations FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT,
    CONSTRAINT chk_rates_stars CHECK (stars BETWEEN 1 AND 5)
);

-- 15. FAVORS
CREATE TABLE favors (
    client_id BINARY(16) NOT NULL,
    location_id BINARY(16) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_favors PRIMARY KEY (client_id, location_id),
    CONSTRAINT fk_favors_clients FOREIGN KEY (client_id) REFERENCES clients(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_favors_locations FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE
);

-- 16. CHAT_CHANNELS
CREATE TABLE chat_channels (
    user_1_id BINARY(16) NOT NULL,
    user_2_id BINARY(16) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_chat_channels PRIMARY KEY (user_1_id, user_2_id),
    
    CONSTRAINT fk_chat_channels_user1 FOREIGN KEY (user_1_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_chat_channels_user2 FOREIGN KEY (user_2_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    CONSTRAINT chk_chat_channels_order CHECK (user_1_id < user_2_id) -- Ràng buộc để tránh trùng lặp (VD: A-B và B-A là một)
);

-- 17. MESSAGES
CREATE TABLE messages (
    message_id BINARY(16),
    channel_user_1_id BINARY(16) NOT NULL, 
    channel_user_2_id BINARY(16) NOT NULL,
    sender_id BINARY(16) NOT NULL,
    content TEXT NOT NULL,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_messages PRIMARY KEY (message_id),

    CONSTRAINT fk_messages_channels FOREIGN KEY (channel_user_1_id, channel_user_2_id) 
        REFERENCES chat_channels(user_1_id, user_2_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT
);