const {db} = require('../db_config');

async function seed() {
    const connection = await db.getConnection();
    try {
        console.log("seed database begin"); 
        await connection.query('USE bakery_db');

        const ingredients_query = `
        INSERT INTO ingredient (name, quantity, unit, type, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())`;

        const ingredients_dummy = [
            ['Tepung Terigu', 10000, 'gram', 'Bahan Kering'],
            ['Gula Pasir', 5000, 'gram', 'Bahan Kering'],
            ['Telur Ayam', 100, 'butir', 'Produk Susu & Telur'],
            ['Mentega Tawar', 2000, 'gram', 'Produk Susu & Telur'],
            ['Oreo', 1500, 'gram', 'Bahan Kue'],
            ['Ragi Kering Aktif', 500, 'gram', 'Bahan Kue'],
            ['Garam Laut', 1000, 'gram', 'Bumbu'],
            ['Susu Cair UHT', 4000, 'ml', 'Produk Susu & Telur'],
            ['Ekstrak Vanila', 500, 'ml', 'Bahan Kue'],
            ['Buah Strawberry', 1000, 'gram', 'Buah-buahan'],
        ];
        for (const i of ingredients_dummy) await connection.execute(ingredients_query, i);

        const items_query = `
        INSERT INTO item (item_name, category, base_price, quantity, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())`;

        const items_dummy = [
            ['Oreo Bread', 'Kue Kering', 15000.00, 200],
            ['Sourdough', 'Roti', 50000.00, 50],
            ['Croissant', 'Pastry', 25000.00, 100],
            ['Strawberry Muffin', 'Muffin', 22000.00, 80],
            ['Baguette', 'Roti', 30000.00, 60],
        ];
        for (const i of items_dummy) await connection.execute(items_query, i);

        const suppliers_query = `
        INSERT INTO supplier (company_name, company_number, address, region, city, postal_code, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;

        const suppliers_dummy = [
            ['PT Sinar Jaya Pangan', '081555123490', 'Jl. Pemasok No. 67', 'Kalimantan Tengah', 'Palangka Raya', '11730'],
            ['CV Dapur Bersinar', '081555567812', 'Jl. Koki Hebat No. 23', 'Kalimantan Selatan', 'Banjarmasin', '60241'],
        ];
        for (const i of suppliers_dummy) await connection.execute(suppliers_query, i);

        const recipe_query = `
        INSERT INTO recipe (item_id, recipe_name, description)
        VALUES (?, ?, ?)`;

        const recipes_dummy = [
            [1, 'Resep Oreo Bread', 'Resep klasik untuk Oreo yang lezat dan kenyal.'],
            [2, 'Resep Roti Sourdough Artisan', 'Roti rustik dengan rasa asam khas dan kulit yang renyah.'],
            [3, 'Resep Croissant Mentega Klasik', 'Pastry ringan dan berlapis dari Prancis.'],
            [4, 'Resep Jumbo Strawberry Muffin', 'Muffin lembut dengan buah strawberry segar.'],
            [5, 'Resep Roti Baguette Prancis', 'Roti sederhana namun elegan dengan kerak renyah.'],
        ];
        for (const i of recipes_dummy) await connection.execute(recipe_query, i);

        const recipe_detail_query = `
        INSERT INTO recipe_detail (recipe_id, ingredient_id, quantity, unit)
        VALUES (?, ?, ?, ?)`;

        const recipe_detail_dummy = [
            [1, 1, 150, 'gram'],
            [1, 2, 75, 'gram'],
            [1, 3, 1, 'butir'],
            [1, 4, 100, 'gram'],
            [1, 5, 50, 'gram'],
            [2, 1, 500, 'gram'],
            [2, 6, 5, 'gram'],
            [2, 7, 10, 'gram'],
            [3, 1, 250, 'gram'],
            [3, 2, 25, 'gram'],
            [3, 4, 150, 'gram'],
            [3, 6, 7, 'gram'],
            [3, 8, 125, 'ml'],
        ];
        for (const i of recipe_detail_dummy) await connection.execute(recipe_detail_query, i);

        const supply_order_query = `
        INSERT INTO supply_order (supplier_id, total_price, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())`;

        const supply_order_dummy = [
            [1, 1500000.00],
            [2, 950000.00],
        ];
        for (const i of supply_order_dummy) await connection.execute(supply_order_query, i);

        const supply_detail_query = `
        INSERT INTO supply_order_detail (supply_order_id, ingredient_id, quantity, unit_price, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())`;
        const supply_details_dummy = [
            [1, 1, 50, 12000.00],
            [1, 2, 50, 18000.00],
            [2, 4, 10, 80000.00],
            [2, 5, 5, 30000.00],
        ];
        for (const i of supply_details_dummy) await connection.execute(supply_detail_query, i);

        const customer_order_query = `
        INSERT INTO customer_order (grand_total, sub_total, discount, tax, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())`;

        const customer_order_dummy = [
            [82500.00, 75000.00, 0.00, 7500.00],
            [99000.00, 100000.00, 10000.00, 9000.00],
            [74000.00, 74000.00, 0.00, 0.00],
        ];
        for (const i of customer_order_dummy) await connection.execute(customer_order_query, i);

        const order_item_query = `
        INSERT INTO order_item (order_id, item_id, quantity, unit_price, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())`;
        const order_item_dummy = [
            [1, 1, 2, 15000.00],
            [1, 5, 1, 45000.00],
            [2, 3, 4, 25000.00],
            [3, 2, 1, 50000.00],
            [3, 4, 1, 24000.00],
        ];
        for (const item of order_item_dummy) await connection.execute(order_item_query, item);

        console.log("seed database complete");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        connection.release();
        console.log("seed database end");
        process.exit();
    }
}

seed();