const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Store DB in user data folder
const dbPath = path.join(app.getPath('userData'), 'pos_system.db');
const db = new Database(dbPath);

// Initialize Tables
function initDb() {
    // Customers Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Bills Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_no TEXT NOT NULL,
            customer_id INTEGER,
            subtotal REAL NOT NULL,
            cgst REAL NOT NULL,
            sgst REAL NOT NULL,
            total REAL NOT NULL,
            payment_mode TEXT DEFAULT 'Cash',
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Bill Items (for deeper analytics)
    db.exec(`
        CREATE TABLE IF NOT EXISTS bill_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            qty INTEGER NOT NULL,
            price REAL NOT NULL,
            qty_type TEXT,
            FOREIGN KEY (bill_id) REFERENCES bills(id)
        )
    `);

    console.log('Database initialized at:', dbPath);
}

// IPC Helper Functions
const dbFunctions = {
    // Customer CRUD
    getCustomers: () => db.prepare('SELECT * FROM customers ORDER BY name ASC').all(),
    getCustomerByMobile: (mobile) => db.prepare('SELECT * FROM customers WHERE mobile = ?').get(mobile),
    addCustomer: (customer) => {
        const stmt = db.prepare('INSERT INTO customers (name, mobile, notes) VALUES (?, ?, ?)');
        return stmt.run(customer.name, customer.mobile, customer.notes);
    },

    // Bill CRUD
    addBill: (bill, items) => {
        const insertBill = db.prepare(`
            INSERT INTO bills (bill_no, customer_id, subtotal, cgst, sgst, total, payment_mode, image_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertItem = db.prepare(`
            INSERT INTO bill_items (bill_id, name, qty, price, qty_type)
            VALUES (?, ?, ?, ?, ?)
        `);

        const transaction = db.transaction((billData, itemsData) => {
            const info = insertBill.run(
                billData.bill_no,
                billData.customer_id,
                billData.subtotal,
                billData.cgst,
                billData.sgst,
                billData.total,
                billData.payment_mode,
                billData.image_path
            );
            const billId = info.lastInsertRowid;
            for (const item of itemsData) {
                insertItem.run(billId, item.name, item.qty, item.price, item.qty_type);
            }
            return billId;
        });

        return transaction(bill, items);
    },

    getBillItems: (billId) => db.prepare('SELECT * FROM bill_items WHERE bill_id = ?').all(),

    getBills: (limit = 100) => db.prepare(`
        SELECT bills.*, customers.name as customer_name 
        FROM bills 
        LEFT JOIN customers ON bills.customer_id = customers.id 
        ORDER BY bills.created_at DESC LIMIT ?
    `).all(),

    // Analytics
    getDailyStats: () => {
        return db.prepare(`
            SELECT 
                COUNT(*) as count, 
                SUM(total) as total_sales,
                SUM(CASE WHEN payment_mode = 'Cash' THEN total ELSE 0 END) as cash_sales,
                SUM(CASE WHEN payment_mode = 'UPI' THEN total ELSE 0 END) as upi_sales
            FROM bills 
            WHERE date(created_at) = date('now')
        `).get();
    }
};

module.exports = { initDb, dbFunctions };
