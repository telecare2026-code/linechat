-- 1. Users (Admins)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    line_user_id VARCHAR(50) UNIQUE NOT NULL, -- Login ID
    display_name VARCHAR(100) NOT NULL,       -- Chat display name
    role VARCHAR(20) DEFAULT 'agent',         -- agent, manager
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    line_user_id VARCHAR(50) UNIQUE NOT NULL, -- Webhook user_id
    display_name VARCHAR(255),
    real_name VARCHAR(255),
    address TEXT,
    phone_number VARCHAR(20),
    avatar_url TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tags
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color_code VARCHAR(10) DEFAULT '#808080'
);

-- 4. Customer Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS customer_tags (
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, tag_id)
);

-- 5. Messages
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    sender_type VARCHAR(10) CHECK (sender_type IN ('customer', 'admin', 'system')),
    admin_id INT REFERENCES admins(id), -- Nullable if customer sends
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, sticker, location
    content TEXT,
    payload JSONB, -- Raw line payload
    is_internal_note BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_customer_created ON messages(customer_id, created_at DESC);
