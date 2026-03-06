CREATE DATABASE automarket;
USE automarket;

CREATE TABLE person (
    id_person INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    phone     VARCHAR(20)  NOT NULL,
    CONSTRAINT uq_person_phone UNIQUE (phone)
);

CREATE TABLE car (
    id_car             INT AUTO_INCREMENT PRIMARY KEY,
    plate              VARCHAR(20)  NOT NULL,
    brand              VARCHAR(40)  NOT NULL,
    color              VARCHAR(40)  NOT NULL,
    kilometers         VARCHAR(40)  DEFAULT '0',
    car_state          VARCHAR(40)  NOT NULL,
    operational_status VARCHAR(40)  DEFAULT 'available',
    CONSTRAINT uq_car_plate UNIQUE (plate)
);

CREATE TABLE purchase (
    id_purchase    INT AUTO_INCREMENT PRIMARY KEY,
    car_id         INT            NOT NULL,
    seller_id      INT            NOT NULL,
    entry_date     DATE           NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_purchase_car
        FOREIGN KEY (car_id)    REFERENCES car(id_car)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_seller
        FOREIGN KEY (seller_id) REFERENCES person(id_person)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE  sale (
    id_sale    INT AUTO_INCREMENT PRIMARY KEY,
    car_id     INT            NOT NULL,
    buyer_id   INT            NOT NULL,
    sale_date  DATE           NOT NULL,
    sale_price DECIMAL(12, 2) NOT NULL,
    CONSTRAINT uq_sale_car UNIQUE (car_id),
    CONSTRAINT fk_sale_car
        FOREIGN KEY (car_id)   REFERENCES car(id_car)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sale_buyer
        FOREIGN KEY (buyer_id) REFERENCES person(id_person)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

DELIMITER $$

CREATE TRIGGER trg_validate_sale
BEFORE INSERT ON sale
FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM purchase
        WHERE car_id = NEW.car_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: El auto no tiene registro de compra. No puede venderse.';
    END IF;
END$$

DELIMITER ;
