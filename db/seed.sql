CREATE DATABASE IF NOT EXISTS `koperasi` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE koperasi;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30),
  role ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_products_category (category_id), INDEX idx_products_name (name)
) ENGINE=InnoDB;

INSERT INTO users (name,email,phone,role,status) VALUES
('Admin Koperasi','admin@sumbermakmur.desa','081234567890','ADMIN','ACTIVE'),
('Warga Sumber Makmur','warga@sumbermakmur.desa','081234567891','USER','ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), role=VALUES(role), status=VALUES(status);

INSERT IGNORE INTO categories (name,description) VALUES
('Beras','Pilihan beras untuk kebutuhan keluarga'),('Gula','Gula pasir dan pemanis kebutuhan dapur'),('Minyak','Minyak goreng pilihan untuk dapur'),('Tepung','Tepung untuk memasak dan membuat kue'),('Telur','Telur segar untuk kebutuhan harian'),('Mie Instan','Mie instan berbagai pilihan rasa'),('Minuman','Minuman untuk keluarga'),('Kebutuhan Rumah Tangga','Kebutuhan sehari-hari untuk rumah'),('Lainnya','Produk kebutuhan lain');

INSERT INTO products (category_id,name,description,image,price,unit,stock,active)
SELECT c.id,'Beras Premium','Beras pulen berkualitas untuk hidangan keluarga setiap hari.','https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85',75000,'5 Kg',50,1 FROM categories c WHERE c.name='Beras' AND NOT EXISTS (SELECT 1 FROM products WHERE name='Beras Premium');
INSERT INTO products (category_id,name,description,image,price,unit,stock,active)
SELECT c.id,'Beras Pulen Harum','Beras pulen dengan aroma harum, cocok untuk menu sehari-hari.','https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=85',68000,'5 Kg',24,1 FROM categories c WHERE c.name='Beras' AND NOT EXISTS (SELECT 1 FROM products WHERE name='Beras Pulen Harum');
INSERT INTO products (category_id,name,description,image,price,unit,stock,active)
SELECT c.id,'Minyak Goreng Kita','Minyak goreng jernih untuk masakan rumahan yang lezat.','https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=85',18500,'1 Liter',8,1 FROM categories c WHERE c.name='Minyak' AND NOT EXISTS (SELECT 1 FROM products WHERE name='Minyak Goreng Kita');
INSERT INTO products (category_id,name,description,image,price,unit,stock,active)
SELECT c.id,'Sabun Cuci Piring','Membersihkan peralatan makan dengan cepat dan wangi segar.','https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=85',12500,'800 ml',0,1 FROM categories c WHERE c.name='Kebutuhan Rumah Tangga' AND NOT EXISTS (SELECT 1 FROM products WHERE name='Sabun Cuci Piring');
