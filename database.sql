CREATE DATABASE IF NOT EXISTS medilab_db;
USE medilab_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Store hashed passwords
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123) - You should change this in production
INSERT INTO users (username, password) VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') ON DUPLICATE KEY UPDATE id=id;

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id VARCHAR(20) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    patient_email VARCHAR(100),
    patient_phone VARCHAR(20),
    test_type TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    booking_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
