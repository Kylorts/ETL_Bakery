const {dw} = require('../db_config');

async function migrate_dw() {
    const connection = await dw.getConnection();
    try {
        console.log("migrate dw begin");
        await connection.query('CREATE DATABASE IF NOT EXISTS bakery_dw');
        await connection.query('USE bakery_dw');
        
        const query_tables = [
            `CREATE TABLE IF NOT EXISTS dim_item (
                item_key INT AUTO_INCREMENT PRIMARY KEY,
                item_name VARCHAR(50),
                item_category VARCHAR(50),
                item_base_price DECIMAL(10,2),
                recipe_name VARCHAR(50),
                recipe_description TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS dim_ingredient (
                ingredient_key INT AUTO_INCREMENT PRIMARY KEY,
                ingredient_name VARCHAR(50),
                ingredient_type VARCHAR(50),
                ingredient_unit VARCHAR(20)
            )`,
            `CREATE TABLE IF NOT EXISTS dim_supplier (
                supplier_key INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(100),
                company_number VARCHAR(20),
                company_address VARCHAR(100),
                company_region VARCHAR(50),
                company_city VARCHAR(50),
                company_postal_code VARCHAR(20)
            )`,
            `CREATE TABLE IF NOT EXISTS dim_date (
                date_key INT AUTO_INCREMENT PRIMARY KEY,
                full_date DATE,
                day_number INT,
                day_name VARCHAR(20),
                week_number INT,
                day_of_week INT,
                month_number INT,
                month_name VARCHAR(20),
                quarter_number INT,
                year INT
            )`,
            `CREATE TABLE IF NOT EXISTS fact_sales (
                sales_key INT AUTO_INCREMENT PRIMARY KEY,
                date_key INT,
                item_key INT,
                quantity INT,
                unit_price DECIMAL(10,2),
                sub_total DECIMAL(10,2),
                discount DECIMAL(10,2),
                tax DECIMAL(10,2),
                grand_total DECIMAL(10,2)
            )`,
            `CREATE TABLE IF NOT EXISTS fact_supply (
                supply_key INT AUTO_INCREMENT PRIMARY KEY,
                date_key INT,
                supplier_key INT,
                ingredient_key INT,
                quantity INT,
                unit_price DECIMAL(10,2),
                total_price DECIMAL(10,2)
            )`,
        ];

        for (const query of query_tables) {
            await connection.query(query);
        }
        console.log("all tables complete");

        const query_fk = [
            "ALTER TABLE fact_sales ADD FOREIGN KEY (date_key) REFERENCES dim_date(date_key)",
            "ALTER TABLE fact_sales ADD FOREIGN KEY (item_key) REFERENCES dim_item(item_key)",
            "ALTER TABLE fact_supply ADD FOREIGN KEY (date_key) REFERENCES dim_date(date_key)",
            "ALTER TABLE fact_supply ADD FOREIGN KEY (ingredient_key) REFERENCES dim_ingredient(ingredient_key)",
            "ALTER TABLE fact_supply ADD FOREIGN KEY (supplier_key) REFERENCES dim_supplier(supplier_key)"
        ];

        for (const query of query_fk) { 
            await connection.query(query);
        }
        console.log("all fk complete");
    } catch (error) { 
        console.error("migrate dw error:", error);
    } finally {
        connection.release();
        console.log("migrate dw end");
        process.exit();
    }
}

migrate_dw();