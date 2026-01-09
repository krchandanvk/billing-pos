const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");

// Store DB in user data folder
const dbPath = path.join(app.getPath("userData"), "pos_system.db");
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

  // Categories Table
  db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            emoji TEXT
        )
    `);

  // Menu Items Table
  db.exec(`
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT NOT NULL,
            emoji TEXT,
            prices TEXT, -- JSON string of {type: price}
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);

  // App Settings Table (for Bill Sequence Reset)
  db.exec(`
        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
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

  console.log("Database initialized at:", dbPath);
}

// IPC Helper Functions
const dbFunctions = {
  // Customer CRUD
  getCustomers: () =>
    db.prepare("SELECT * FROM customers ORDER BY name ASC").all(),
  getCustomerByMobile: (mobile) =>
    db.prepare("SELECT * FROM customers WHERE mobile = ?").get(mobile),
  addCustomer: (customer) => {
    const stmt = db.prepare(
      "INSERT INTO customers (name, mobile, notes) VALUES (?, ?, ?)"
    );
    return stmt.run(customer.name, customer.mobile, customer.notes);
  },

  // Menu CRUD
  getCategories: () => db.prepare("SELECT * FROM categories").all(),
  addCategory: (cat) =>
    db
      .prepare("INSERT INTO categories (name, emoji) VALUES (?, ?)")
      .run(cat.name, cat.emoji),
  updateCategory: (id, cat) =>
    db
      .prepare("UPDATE categories SET name = ?, emoji = ? WHERE id = ?")
      .run(cat.name, cat.emoji, id),
  deleteCategory: (id) =>
    db.prepare("DELETE FROM categories WHERE id = ?").run(id),

  getMenuItems: (categoryId) => {
    if (categoryId) {
      return db.prepare("SELECT * FROM menu_items WHERE category_id = ?").all();
    }
    return db.prepare("SELECT * FROM menu_items").all();
  },
  addMenuItem: (item) => {
    const stmt = db.prepare(
      "INSERT INTO menu_items (category_id, name, emoji, prices) VALUES (?, ?, ?, ?)"
    );
    return stmt.run(
      item.category_id,
      item.name,
      item.emoji,
      JSON.stringify(item.prices)
    );
  },
  updateMenuItem: (id, item) => {
    const stmt = db.prepare(
      "UPDATE menu_items SET category_id = ?, name = ?, emoji = ?, prices = ? WHERE id = ?"
    );
    return stmt.run(
      item.category_id,
      item.name,
      item.emoji,
      JSON.stringify(item.prices),
      id
    );
  },
  deleteMenuItem: (id) =>
    db.prepare("DELETE FROM menu_items WHERE id = ?").run(id),

  // Seed Menu if empty
  seedMenu: (menuData, force = false) => {
    if (force) {
      db.prepare("DELETE FROM bill_items").run();
      db.prepare("DELETE FROM bills").run();
      db.prepare("DELETE FROM menu_items").run();
      db.prepare("DELETE FROM categories").run();
      console.log("Database cleared for re-seeding.");
    }
    const count = db.prepare("SELECT COUNT(*) as count FROM categories").get().count;
    if (count > 0 && !force) return;

    console.log("Seeding database with default menu...");
    menuData.forEach((cat) => {
      const { lastInsertRowid: catId } = db
        .prepare("INSERT INTO categories (name, emoji) VALUES (?, ?)")
        .run(cat.category, cat.emoji || "📂");

      cat.items.forEach((item) => {
        db.prepare(
          "INSERT INTO menu_items (category_id, name, emoji, prices) VALUES (?, ?, ?, ?)"
        ).run(catId, item.name, item.emoji || "🍽️", JSON.stringify(item.prices));
      });
    });
  },

  // Bill CRUD
  getNextBillNo: () => {
    // Check if we have a reset point
    let startId = 0;
    try {
        const setting = db.prepare("SELECT value FROM app_settings WHERE key = 'bill_sequence_start_id'").get();
        if (setting) startId = parseInt(setting.value);
    } catch (e) {
        // Table might not exist yet if initDb hasn't run fully or old DB, default 0
    }

    const row = db.prepare("SELECT COUNT(*) as count FROM bills WHERE id > ?").get(startId);
    return (row.count + 1).toString().padStart(2, '0');
  },
  resetBillSequence: () => {
    // Set the current max ID as the start point for the new sequence
    const maxRow = db.prepare("SELECT MAX(id) as maxId FROM bills").get();
    const currentMaxId = maxRow.maxId || 0;
    
    db.prepare(`
        INSERT INTO app_settings (key, value) VALUES ('bill_sequence_start_id', ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `).run(currentMaxId.toString());
    
    return true;
  },
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
        insertItem.run(billId, item.name, item.qty, item.price, item.qtyType || item.qty_type);
      }
      return billId;
    });

    return transaction(bill, items);
  },

  getBillItems: (billId) =>
    db.prepare("SELECT * FROM bill_items WHERE bill_id = ?").all(billId),

  getBills: (limit = 100) =>
    db
      .prepare(
        `
        SELECT bills.*, customers.name as customer_name 
        FROM bills 
        LEFT JOIN customers ON bills.customer_id = customers.id 
        ORDER BY bills.created_at DESC LIMIT ?
    `
      )
      .all(limit),

  // Analytics
  getDailyStats: () => {
    return db
      .prepare(
        `
            SELECT 
                COUNT(*) as count, 
                SUM(total) as total_sales,
                SUM(CASE WHEN payment_mode = 'Cash' THEN total ELSE 0 END) as cash_sales,
                SUM(CASE WHEN payment_mode = 'UPI' THEN total ELSE 0 END) as upi_sales
            FROM bills 
            WHERE date(created_at) = date('now')
        `
      )
      .get();
  },

  getSalesData: (period = "daily") => {
    let query = "";
    if (period === "daily") {
      query =
        "SELECT date(created_at) as date, SUM(total) as amount FROM bills GROUP BY date(created_at) ORDER BY date DESC LIMIT 30";
    } else if (period === "monthly") {
      query =
        "SELECT strftime('%Y-%m', created_at) as date, SUM(total) as amount FROM bills GROUP BY date ORDER BY date DESC LIMIT 12";
    }
    return db.prepare(query).all();
  },

  getCategorySales: () => {
    return db
      .prepare(
        `
            SELECT c.name as category, SUM(bi.qty * bi.price) as amount
            FROM bill_items bi
            JOIN menu_items mi ON bi.name = mi.name
            JOIN categories c ON mi.category_id = c.id
            GROUP BY c.name
            ORDER BY amount DESC
        `
      )
      .all();
  },

  getTopSellingItems: (limit = 5) => {
    return db
      .prepare(
        `
            SELECT name, SUM(qty) as sold_count
            FROM bill_items
            GROUP BY name
            ORDER BY sold_count DESC
            LIMIT ?
        `
      )
      .all(limit);
  },

  getHourlySales: () => {
    return db
      .prepare(
        `
            SELECT strftime('%H', created_at) as hour, SUM(total) as amount
            FROM bills
            WHERE date(created_at) = date('now')
            GROUP BY hour
            ORDER BY hour ASC
        `
      )
      .all();
  },
};

module.exports = { initDb, dbFunctions };
