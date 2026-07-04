const pool = require('./db');

const createTables = async () => {
    try {

        // Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(15) NOT NULL,
                role VARCHAR(10) NOT NULL CHECK (role IN ('tenant', 'owner')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created!');

        // Properties Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS properties (
                id SERIAL PRIMARY KEY,
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('pg', 'hostel', '1bhk', '2bhk', '3bhk', 'single_room', 'flat_share')),
                gender_preference VARCHAR(10) CHECK (gender_preference IN ('male', 'female', 'any')),
                furnishing VARCHAR(20) CHECK (furnishing IN ('unfurnished', 'semi_furnished', 'fully_furnished')),
                rent INTEGER NOT NULL,
                deposit INTEGER,
                area VARCHAR(100) NOT NULL,
                address TEXT NOT NULL,
                city VARCHAR(50) DEFAULT 'Hyderabad',
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                available BOOLEAN DEFAULT true,
                available_from DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Properties table created!');

        // Amenities Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS amenities (
                id SERIAL PRIMARY KEY,
                property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
                wifi BOOLEAN DEFAULT false,
                ac BOOLEAN DEFAULT false,
                parking BOOLEAN DEFAULT false,
                food BOOLEAN DEFAULT false,
                laundry BOOLEAN DEFAULT false,
                gym BOOLEAN DEFAULT false,
                cctv BOOLEAN DEFAULT false,
                pet_friendly BOOLEAN DEFAULT false
            )
        `);
        console.log('Amenities table created!');

        // Property Images Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS property_images (
                id SERIAL PRIMARY KEY,
                property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
                image_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Property images table created!');

        // Saved Properties Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS saved_properties (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, property_id)
            )
        `);
        console.log('Saved properties table created!');

        // Enquiries Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS enquiries (
                id SERIAL PRIMARY KEY,
                tenant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Enquiries table created!');

        console.log('All tables created successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error creating tables:', error.message);
        process.exit(1);
    }
};

createTables();