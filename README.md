# ETL Bakery
Proyek sederhana tentang ETL (Extract, Transform, Load) dari OLTP ( online transaction processing) database ke data warehouse untuk studi kasus bakery

## Deskripsi
Proyek ini adalah proses ETL dari OLTP database ke data warehouse menggunakan MySQL. OLTP bakery  mencakup transaksi penjualan, pembelian supply, bahan baku, resep, dan juga item dalam bisnis bakery. Data warehouse menggunakan galaxy schema yang mana terdapat 2 fakta tabel untuk menganalisis transaksi pelanggan, dan pembelian supply untuk bahan baku.

## Struktur Folder
```
├── data_warehouses/
│   └── warehouse_migrate.js  # script migrasi data warehouse
├── diagram/
│   ├── bakery dimensional model.png
│   └── bakery oltp.png
├── etl/
│   └── etl.js  # script ETL
├── oltp/
│   ├── oltp-migrate.js # script migrasi OLTP 
│   └── oltp-seed.js  # script isi data dummy ke OLTP
├── package-lock.json
├── package.json
└── README.md
```

## Skema Diagram OLTP
![Diagram OLTP](./diagram/bakery%20oltp.png)

## Skema Data Warehouses
![Diagram Galaxy Schema](./diagram/bakery%20dimensional%20model.png)

## Tools
* Laragon (MySQL)
* Node.js
* npm