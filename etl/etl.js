const {db, dw} = require('../db_config');

async function etl() {
    const oltp = await db.getConnection();
    const warehouses = await dw.getConnection();

    try {
        console.log("ETL begin");
        await oltp.query('USE bakery_db');
        await warehouses.query('USE bakery_dw');

        console.log("ETL dim_item");
        const [items] = await oltp.query(`
            SELECT i.item_id, i.item_name, i.category, i.base_price, r.recipe_name, r.description
            FROM item i
            LEFT JOIN recipe r
            ON i.item_id = r.item_id
        `);
        
        for (const i of items) {
            await warehouses.query(`
                INSERT INTO dim_item (item_key, item_name, item_category, item_base_price, recipe_name, recipe_description)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [i.item_id, i.item_name, i.category, i.base_price, i.recipe_name, i.description]);
        }

        console.log("ETL dim_ingredient");
        const [ingredients] = await oltp.query(`
            SELECT ingredient_id, name, type, unit
            FROM ingredient
        `);

        for (const i of ingredients) {
            await warehouses.query(`
                INSERT INTO dim_ingredient (ingredient_key, ingredient_name, ingredient_type, ingredient_unit)
                VALUES (?, ?, ?, ?)
            `, [i.ingredient_id, i.name, i.type, i.unit]);
        }

        console.log("ETL dim_supplier");
        const [suppliers] = await oltp.query(`
            SELECT supplier_id, company_name, company_number, address, region, city, postal_code
            FROM supplier
        `);

        for (const i of suppliers) {
            await warehouses.query(`
                INSERT INTO dim_supplier (supplier_key, company_name, company_number, company_address, company_region, company_city, company_postal_code)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [i.supplier_id, i.company_name, i.company_number, i.address, i.region, i.city, i.postal_code]);
        }

        console.log("ETL dim_date");
        const [unique_dates] = await oltp.query(`
            SELECT DISTINCT a.date AS full_date FROM (
            SELECT DATE(created_at) AS date FROM customer_order
                UNION
            SELECT DATE(created_at) AS date FROM supply_order
        ) a
    `);

for (const i of unique_dates) {
    const date = new Date(i.full_date);
    const day_names = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const month_names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    await warehouses.query(`
        INSERT INTO dim_date (date_key, full_date, day_number, day_name, week_number, day_of_week, month_number, month_name, quarter_number, year)
        VALUES (?, ?, ?, ?, WEEK(?), ?, ?, ?, QUARTER(?), ?)
    `, [
        parseInt(date.toISOString().slice(0,10).replace(/-/g,'')), 
        date,
        date.getDate(),
        day_names[date.getDay()],
        date, 
        date.getDay(),
        date.getMonth() + 1,
        month_names[date.getMonth()],
        date,
        date.getFullYear()
    ]);
}

        console.log("ETL fact_sales");
        const [sales] = await oltp.query(`
            SELECT o.order_id,
            DATE(o.created_at) AS order_date,
            oi.item_id,
            oi.quantity,
            oi.unit_price,
            (oi.quantity * oi.unit_price) AS item_sub_total,
            o.sub_total AS order_sub_total,
            o.discount AS order_discount,
            o.tax AS order_tax,
            o.grand_total AS order_grand_total
            FROM customer_order o
            JOIN order_item oi 
            ON o.order_id = oi.order_id
        `);

        for (const i of sales) {
            const date_key = parseInt(i.order_date.toISOString().slice(0,10).replace(/-/g,''));
            const item_key = i.item_id;
    
            let temp = 0; 
            if(i.order_sub_total > 0){
                temp = i.item_sub_total / i.order_sub_total;
            }
    
            const item_discount = i.order_discount * temp;
            const item_tax = i.order_tax * temp;
            const item_grand_total = i.item_sub_total - item_discount + item_tax;

            await warehouses.query(`
                INSERT INTO fact_sales (date_key, item_key, quantity, unit_price, sub_total, discount, tax, grand_total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [date_key, item_key, i.quantity, i.unit_price, i.item_sub_total, item_discount, item_tax, item_grand_total]);
        }

        console.log("ETL fact_supply");
        const [supplies] = await oltp.query(`
            SELECT
            s.supplier_id,
            DATE(s.created_at) AS supply_date,
            sd.ingredient_id,
            sd.quantity,
            sd.unit_price,
            (sd.quantity * sd.unit_price) AS total_price
            FROM supply_order s
            JOIN supply_order_detail sd
            ON s.supply_order_id = sd.supply_order_id
        `);

        for (const i of supplies) {
            const date_key = parseInt(i.supply_date.toISOString().slice(0,10).replace(/-/g,''));
            const supplier_key = i.supplier_id;
            const ingredient_key = i.ingredient_id;

            await warehouses.query(`
                INSERT INTO fact_supply (date_key, supplier_key, ingredient_key, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [date_key, supplier_key, ingredient_key, i.quantity, i.unit_price, i.total_price]);
        }

        console.log("ETL complete");
    } catch (error) {
        console.error("ETL error:", error);
    } finally {
        if (oltp) oltp.release();
        if (warehouses) warehouses.release();
        console.log("ETL end");
        process.exit();
    }
}

etl();