CREATE DATABASE IF NOT EXISTS rental_management;
USE rental_management;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'landlord', 'tenant') NOT NULL,
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  landlord_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  rent_amount DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (landlord_id) REFERENCES users(id)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  property_id INT NOT NULL,
  start_date DATE,
  end_date DATE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE rent_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  property_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_on DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES users(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
USE rental_management;
SELECT * FROM bookings;
SELECT * FROM bookings WHERE tenant_id = 3;
USE rental_management;
SELECT id, name, email, role FROM users;

USE rental_management;
SELECT id, title, landlord_id, is_available FROM properties;
USE rental_management;

-- Delete all properties
DELETE FROM properties;
DELETE FROM properties WHERE id > 0;
-- Reset auto increment back to 1
ALTER TABLE properties AUTO_INCREMENT = 1;

SET SQL_SAFE_UPDATES = 0;

DELETE FROM properties;

ALTER TABLE properties AUTO_INCREMENT = 1;

SET SQL_SAFE_UPDATES = 1;

USE rental_management;

SET SQL_SAFE_UPDATES = 0;

-- Delete in correct order (children first, parent last)
DELETE FROM notices WHERE id > 0;
DELETE FROM rent_records WHERE id > 0;
DELETE FROM bookings WHERE id > 0;
DELETE FROM properties WHERE id > 0;

-- Reset all auto increments to 1
ALTER TABLE notices AUTO_INCREMENT = 1;
ALTER TABLE rent_records AUTO_INCREMENT = 1;
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE properties AUTO_INCREMENT = 1;

SET SQL_SAFE_UPDATES = 1;

SELECT id, name, email, role FROM users;