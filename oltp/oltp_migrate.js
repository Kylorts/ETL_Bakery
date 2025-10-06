const {db} = require('../db_config');

async function migrate() {
    const connection = await db.getConnection();
    try {
        console.log("migrate database begin");
        await connection.query('CREATE DATABASE IF NOT EXISTS bakery_db');
        await connection.query('USE bakery_db');

        const query_tables = [
            `CREATE TABLE IF NOT EXISTS ingredient (
                ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50),
                quantity INT,
                unit VARCHAR(20),
                type VARCHAR(50),
                created_at DATETIME,
                updated_at DATETIME
            )`,
            `CREATE TABLE IF NOT EXISTS item (
                item_id INT AUTO_INCREMENT PRIMARY KEY,
                item_name VARCHAR(50),
                category VARCHAR(50),
                base_price DECIMAL(10,2),
                quantity INT,
                created_at DATETIME,
                updated_at DATETIME
            )`,
            `CREATE TABLE IF NOT EXISTS recipe (
                recipe_id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT UNIQUE,
                recipe_name VARCHAR(50),
                description TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS recipe_detail (
                recipe_detail_id INT AUTO_INCREMENT PRIMARY KEY,
                recipe_id INT,
                ingredient_id INT,
                quantity INT,
                unit VARCHAR(20)
            )`,
            `CREATE TABLE IF NOT EXISTS supplier (
                supplier_id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(100),
                company_number VARCHAR(20),
                address VARCHAR(100),
                region VARCHAR(50),
                city VARCHAR(50),
                postal_code VARCHAR(20),
                created_at DATETIME,
                updated_at DATETIME
            )`,
            `CREATE TABLE IF NOT EXISTS supply_order (
                supply_order_id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT,
                total_price DECIMAL(10,2),
                created_at DATETIME,
                updated_at DATETIME
            )`,
            `CREATE TABLE IF NOT EXISTS supply_order_detail (
                supply_detail_id INT AUTO_INCREMENT PRIMARY KEY,
                supply_order_id INT,
                ingredient_id INT,
                quantity INT,
                unit_price DECIMAL(10,2),
                created_at DATETIME,
                updated_at DATETIME
            )`,
            `CREATE TABLE IF NOT EXISTS customer_order (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                grand_total DECIMAL(10,2),
                sub_total DECIMAL(10,2),
                discount DECIMAL(10,2),
                tax DECIMAL(10,2),
                created_at DATETIME,
                updated_at DATETIME
            )`,
            `CREATE TABLE IF NOT EXISTS order_item (
                order_item_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                item_id INT,
                quantity INT,
                unit_price DECIMAL(10,2),
                created_at DATETIME,
                updated_at DATETIME
            )`,
        ];

        for (const query of query_tables) {
            await connection.query(query);
        }

        console.log("all table complete");

        const query_fk = [
            "ALTER TABLE recipe_detail ADD FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id)",
            "ALTER TABLE recipe_detail ADD FOREIGN KEY (ingredient_id) REFERENCES ingredient (ingredient_id)",
            "ALTER TABLE recipe ADD FOREIGN KEY (item_id) REFERENCES item (item_id)",
            "ALTER TABLE supply_order ADD FOREIGN KEY (supplier_id) REFERENCES supplier (supplier_id)",
            "ALTER TABLE supply_order_detail ADD FOREIGN KEY (supply_order_id) REFERENCES supply_order (supply_order_id)",
            "ALTER TABLE supply_order_detail ADD FOREIGN KEY (ingredient_id) REFERENCES ingredient (ingredient_id)",
            "ALTER TABLE order_item ADD FOREIGN KEY (order_id) REFERENCES customer_order (order_id)",
            "ALTER TABLE order_item ADD FOREIGN KEY (item_id) REFERENCES item (item_id)",
        ];

        for (const query of query_fk) {
            await connection.query(query);
        }
        console.log("all fk complete");
    } catch (error) {
        console.error("Error in migration:", error);
    } finally {
        connection.release();
        console.log("migrate database end");
        process.exit();
    }
}

migrate();