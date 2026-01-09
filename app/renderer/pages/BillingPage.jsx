import { useState, useEffect, useMemo } from "react";

export default function BillingPage() {
    const [billItems, setBillItems] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [customerList, setCustomerList] = useState([]);
    const [paymentMode, setPaymentMode] = useState("Cash");

    const [categories, setCategories] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [customers, cats, items] = await Promise.all([
                    window.api.getCustomers(),
                    window.api.getCategories(),
                    window.api.getMenuItems()
                ]);
                setCustomerList(customers);
                setCategories(cats);
                
                // Parse prices from JSON string
                const parsedItems = items.map(item => ({
                    ...item,
                    prices: JSON.parse(item.prices)
                }));
                setAllItems(parsedItems);
                
                if (cats.length > 0) setSelectedCategory(cats[0].name);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const [selectedCategory, setSelectedCategory] = useState("");

    const addItem = (itemName, price, qtyType) => {
        if (isLocked) return;
        const existing = billItems.find(
            (i) => i.name === itemName && i.qtyType === qtyType
        );

        if (existing) {
            setBillItems(
                billItems.map((i) =>
                    i === existing ? { ...i, qty: i.qty + 1 } : i
                )
            );
        } else {
            setBillItems([
                ...billItems,
                { name: itemName, price, qtyType, qty: 1 },
            ]);
        }
    };

    const removeItem = (index) => {
        if (isLocked) return;
        setBillItems(billItems.filter((_, i) => i !== index));
    };

    const updateQty = (index, delta) => {
        if (isLocked) return;
        setBillItems(
            billItems
                .map((item, i) =>
                    i === index ? { ...item, qty: Math.max(1, item.qty + delta) } : item
                )
        );
    };

    const resetBill = () => {
        setBillItems([]);
        setIsLocked(false);
        setSelectedCustomer(null);
        setCustomerSearch("");
    };

    const handlePrint = () => {
        const billData = {
            items: billItems,
            subtotal,
            cgst,
            sgst,
            total: grandTotal,
            billNo: "23", // Could be dynamic via DB count
            customerId: selectedCustomer?.id || null,
            paymentMode: paymentMode
        };
        if (window.api && window.api.printBill) window.api.printBill(billData);
        else window.print();
        setIsLocked(true);
    };

    const subtotal = billItems.reduce(
        (sum, i) => sum + i.price * i.qty,
        0
    );

    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const grandTotal = subtotal + cgst + sgst;

    const currentCategoryObj = useMemo(() => 
        categories.find(c => c.name === selectedCategory) || (categories.length > 0 ? categories[0] : { name: "", emoji: "🍽️" })
    , [categories, selectedCategory]);

    const currentCategoryItems = useMemo(() => 
        allItems.filter(item => item.category_id === currentCategoryObj.id)
    , [allItems, currentCategoryObj]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return currentCategoryItems;
        return allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allItems, currentCategoryItems, searchQuery]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "12px", padding: "12px", height: "100vh" }}>
            {/* MENU SECTION */}
            <div className="glass-panel" style={{ padding: "0", overflow: "hidden", display: "flex", opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? "none" : "auto" }}>

                {/* SIDEBAR */}
                <div style={{ width: "150px", background: "rgba(0,0,0,0.2)", borderRight: "1px solid rgba(255,255,255,0.1)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    <h2 style={{ padding: "12px 0 12px 12px", margin: 0, fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Menu
                    </h2>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.name); setSearchQuery(""); }}
                            style={{
                                padding: "10px 12px",
                                textAlign: "left",
                                background: selectedCategory === cat.name && !searchQuery ? "rgba(6, 182, 212, 0.15)" : "transparent",
                                borderLeft: selectedCategory === cat.name && !searchQuery ? "3px solid var(--accent-secondary)" : "3px solid transparent",
                                color: selectedCategory === cat.name && !searchQuery ? "#fff" : "var(--text-muted)",
                                cursor: "pointer",
                                borderRight: "none",
                                borderTop: "none",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                fontSize: "12px",
                                fontWeight: selectedCategory === cat.name && !searchQuery ? "600" : "400",
                                outline: "none",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            <span style={{ fontSize: "16px" }}>{cat.emoji}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* ITEMS GRID */}
                <div style={{ flex: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column" }}>

                    {/* Search Bar */}
                    <div style={{ marginBottom: "12px", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)" }}>
                        <input
                            type="text"
                            placeholder="🔍 Search items (e.g. 'Paneer', 'Roti')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: "1px solid var(--border-glass)",
                                background: "rgba(0,0,0,0.3)",
                                color: "var(--text-main)",
                                fontSize: "14px",
                                outline: "none",
                                fontFamily: "Outfit"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "var(--accent-secondary)"}
                            onBlur={(e) => e.target.style.borderColor = "var(--border-glass)"}
                        />
                    </div>

                    <h2 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
                        {searchQuery ? (
                            <>
                                <span style={{ fontSize: "24px" }}>🔍</span>
                                <span style={{ color: "var(--accent-secondary)" }}>Search Results</span>
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: "24px" }}>{currentCategoryObj.emoji}</span>
                                <span style={{ background: "linear-gradient(to right, #0ea5e9, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    {currentCategoryObj.name}
                                </span>
                            </>
                        )}
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px", alignContent: "start" }}>
                        {filteredItems.length === 0 ? (
                            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                No items found
                            </div>
                        ) : (
                            filteredItems.map((item) =>
                                Object.entries(item.prices).map(([type, price]) => (
                                    <button
                                        key={item.id + type}
                                        className="btn-secondary"
                                        disabled={isLocked}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "2px",
                                            padding: "8px",
                                            height: "80px",
                                            width: "100%",
                                            backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            justifyContent: "space-between",
                                            position: "relative"
                                        }}
                                        onClick={() => { addItem(item.name, price, type); if (searchQuery) setSearchQuery(""); }}
                                    >
                                        <div style={{ fontSize: "28px", marginBottom: "-4px" }}>{item.emoji}</div>
                                        <span style={{ fontWeight: 600, fontSize: "11px", wordBreak: "break-word", lineHeight: "1.1", textAlign: "center", color: "var(--text-main)" }}>{item.name}</span>

                                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                                            <span className="text-muted" style={{ fontSize: "9px", background: "rgba(255,255,255,0.1)", padding: "1px 4px", borderRadius: "3px" }}>{type}</span>
                                            <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: "12px" }}>₹{price}</span>
                                        </div>
                                    </button>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* BILL SECTION */}
            <div className="glass-panel" style={{ padding: "12px", display: "flex", flexDirection: "column" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "var(--radius-md)", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                        <span>Customer Selection</span>
                        {!selectedCustomer && (
                            <span
                                onClick={() => alert("Go to Customers tab to add new guests")}
                                style={{ color: "var(--accent-primary)", cursor: "pointer" }}
                            >
                                + New
                            </span>
                        )}
                    </div>
                    {selectedCustomer ? (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: "600" }}>{selectedCustomer.name}</div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{selectedCustomer.mobile}</div>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                style={{ background: "transparent", color: "var(--accent-danger)", fontSize: "14px", padding: "4px" }}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <input
                            type="text"
                            placeholder="Search by Mobile..."
                            value={customerSearch}
                            onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                const found = customerList.find(c => c.mobile.includes(e.target.value));
                                if (found && e.target.value.length >= 10) setSelectedCustomer(found);
                            }}
                            style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-glass)", borderRadius: "4px", padding: "6px", color: "white", fontSize: "13px" }}
                        />
                    )}
                </div>

                <div style={{ flex: 1, overflowY: "auto", marginBottom: "12px", paddingRight: "4px" }}>
                    {billItems.length === 0 ? (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexDirection: "column" }}>
                            <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.5 }}>🛒</div>
                            <p style={{ fontSize: "14px" }}>No items</p>
                        </div>
                    ) : (
                        billItems.map((item, i) => (
                            <div key={i} style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "6px 8px",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: "var(--radius-sm)",
                                marginBottom: "4px",
                                opacity: isLocked ? 0.7 : 1
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, fontSize: "13px" }}>{item.name} <span className="text-muted" style={{ fontSize: "11px" }}>({item.qtyType})</span></div>
                                    <div style={{ fontSize: "11px", marginTop: "2px", color: "var(--text-muted)" }}>
                                        ₹{item.price} × {item.qty} = <span style={{ color: "var(--text-main)" }}>₹{item.price * item.qty}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <button className="btn-icon" style={{ width: "24px", height: "24px", fontSize: "12px" }} onClick={() => updateQty(i, -1)} disabled={isLocked || item.qty <= 1}>➖</button>
                                    <span style={{ width: "16px", textAlign: "center", fontWeight: "600", fontSize: "13px" }}>{item.qty}</span>
                                    <button className="btn-icon" style={{ width: "24px", height: "24px", fontSize: "12px" }} onClick={() => updateQty(i, 1)} disabled={isLocked}>➕</button>
                                    <button className="btn-icon btn-danger" style={{ width: "24px", height: "24px", fontSize: "12px" }} onClick={() => removeItem(i)} disabled={isLocked}>🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                        <span className="text-muted">Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
                        <span className="text-muted">CGST (2.5%)</span>
                        <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
                        <span className="text-muted">SGST (2.5%)</span>
                        <span>₹{sgst.toFixed(2)}</span>
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid var(--border-glass)",
                        paddingTop: "8px",
                        marginBottom: "12px"
                    }}>
                        <span style={{ fontSize: "16px", fontWeight: "bold" }}>Grand Total</span>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "var(--accent-primary)" }}>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                        {["Cash", "UPI", "Card"].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setPaymentMode(mode)}
                                style={{
                                    flex: 1,
                                    fontSize: "11px",
                                    padding: "6px",
                                    background: paymentMode === mode ? "var(--accent-primary)" : "rgba(255,255,255,0.05)",
                                    color: paymentMode === mode ? "white" : "var(--text-muted)",
                                    borderRadius: "4px"
                                }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {!isLocked ? (
                        <button
                            className="btn-primary"
                            style={{ width: "100%", fontSize: "14px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                            onClick={handlePrint}
                            disabled={billItems.length === 0}
                        >
                            🖨️ Print Receipt
                        </button>
                    ) : (
                        <button
                            className="btn-secondary"
                            style={{ width: "100%", fontSize: "14px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#10b981", color: "white" }}
                            onClick={resetBill}
                        >
                            ✨ New Bill
                        </button>
                    )}
                </div>
            </div>

            {/* PRINT RECEIPT (Hidden on screen, visible on print) - KEEPING EXACTLY AS VERIFIED */}
            <div className="printable-bill">
                <center>
                    <h2 style={{ margin: 0 }}>KALLO'S TANDON</h2>
                    <div style={{ fontSize: 12 }}>NEAR SATI CHAURA MANDIR</div>
                    <div style={{ fontSize: 12 }}>GURU GOVIND SINGH LINK PATH PATNA CITY</div>
                    <div style={{ fontSize: 12 }}>GST NO. 10APHPK4168H2Z2</div>
                    <div style={{ fontSize: 12, fontWeight: "bold" }}>MOB-9234287770</div>
                </center>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 10 }}>
                    <span>BILL NO: 23</span>
                    <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ borderBottom: "1px dashed #000", margin: "5px 0" }}></div>
                <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #000" }}>
                            <th style={{ textAlign: "left" }}>ITEM</th>
                            <th style={{ textAlign: "center" }}>QTY</th>
                            <th style={{ textAlign: "right" }}>AMT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billItems.map((item, i) => (
                            <tr key={i}>
                                <td style={{ padding: "2px 0" }}>
                                    {item.name.toUpperCase()} <span style={{ fontSize: 8 }}>({item.qtyType})</span>
                                </td>
                                <td style={{ textAlign: "center" }}>{item.qty}</td>
                                <td style={{ textAlign: "right" }}>{(item.price * item.qty).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ borderBottom: "1px dashed #000", margin: "5px 0" }}></div>
                <div style={{ fontSize: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>CGST (2.5%)</span>
                        <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>SGST (2.5%)</span>
                        <span>₹{sgst.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 12, marginTop: 5 }}>
                        <span>Grand Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <center style={{ marginTop: 10, fontSize: 12 }}>
                    FREE HOME DELIVERY MINIMUM<br />
                    300 RS ONLY
                    <div style={{ fontSize: 10, maxWidth: "250px", lineHeight: "1.2", margin: "8px 0", fontWeight: "bold", borderTop: "1px dashed black", paddingTop: "5px" }}>😋 हर निवाले में घर जैसा स्वाद,<br /> परंपरागत रेसिपी आधुनिक अंदाज़ के साथ।</div>
                </center>
                <div style={{ borderBottom: "1px solid black", marginTop: 5 }}></div>
            </div>
        </div >
    );
}
