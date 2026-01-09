import React, { useState, useEffect, useMemo } from "react";

export default function BillingPage() {
    const [billItems, setBillItems] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [customerList, setCustomerList] = useState([]);
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [searchQuery, setSearchQuery] = useState("");

    const [categories, setCategories] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        const loadInitialData = async () => {
            if (!window.api) {
                const mockCats = [{ id: 1, name: "Chinese Veg", emoji: "🥢" }];
                const mockItems = [{ id: 101, category_id: 1, name: "Veg Chowmein", emoji: "🍜", prices: { half: 60, full: 120 } }];
                setCategories(mockCats);
                setAllItems(mockItems);
                setSelectedCategory("Chinese Veg");
                setLoading(false);
                return;
            }
            try {
                const [customers, cats, items] = await Promise.all([
                    window.api.getCustomers(),
                    window.api.getCategories(),
                    window.api.getMenuItems()
                ]);
                setCustomerList(customers || []);
                setCategories(cats || []);
                
                const parsedItems = (items || []).map(item => ({
                    ...item,
                    prices: (typeof item.prices === 'string' && item.prices) ? JSON.parse(item.prices) : (item.prices || {})
                }));
                setAllItems(parsedItems);
                
                if (cats && cats.length > 0) setSelectedCategory(cats[0].name);
            } catch (err) {
                console.error("Initial data load failed:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const addItem = (itemName, price, qtyType, emoji) => {
        try {
            if (isLocked) return;
            const existing = billItems.find(
                (i) => i.name === itemName && i.qtyType === qtyType
            );

            if (existing) {
                setBillItems(prev =>
                    prev.map((i) =>
                        i === existing ? { ...i, qty: i.qty + 1 } : i
                    )
                );
            } else {
                setBillItems(prev => [
                    ...prev,
                    { name: itemName, price, qtyType, qty: 1, emoji },
                ]);
            }
        } catch (err) {
            console.error("Error adding item:", err);
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
        setBillNo("");
    };

    const [billNo, setBillNo] = useState("");

    const handlePrint = async () => {
        const bNo = billNo || "B-" + Date.now().toString().slice(-6);
        if (!billNo) setBillNo(bNo);
        
        const billData = {
            items: billItems,
            subtotal,
            cgst,
            sgst,
            total: grandTotal,
            billNo: bNo,
            customerId: selectedCustomer?.id || null,
            customerName: selectedCustomer?.name || "CASH",
            paymentMode: paymentMode
        };
        if (window.api && window.api.printBill) await window.api.printBill(billData);
        else window.print();
        setIsLocked(true);
    };

    const [showPreview, setShowPreview] = useState(false);

    const subtotal = billItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const grandTotal = subtotal + cgst + sgst;

    const currentCategoryObj = useMemo(() => 
        categories.find(c => c.name === selectedCategory) || (categories.length > 0 ? categories[0] : { name: "", emoji: "🍽️", id: null })
    , [categories, selectedCategory]);

    const filteredItems = useMemo(() => {
        let baseItems = searchQuery 
            ? allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : allItems.filter(item => item.category_id === currentCategoryObj.id);
        return baseItems;
    }, [allItems, currentCategoryObj, searchQuery]);

    return (
        <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "12px", height: "calc(100vh - 24px)", overflow: "hidden" }}>
                
                {/* INVENTORY BROWSER */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", opacity: isLocked ? 0.4 : 1, transition: "0.3s", position: "relative" }}>
                    {isLocked && (
                        <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "all" }}>
                            <button onClick={resetBill} className="btn-primary" style={{ padding: "12px 24px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                                🔒 Session Locked - Click for New Bill
                            </button>
                        </div>
                    )}
                    <div className="glass-panel" style={{ padding: "6px 8px", display: "flex", gap: "8px", alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>🔍</span>
                            <input 
                                placeholder="Universal product search..." 
                                style={{ width: "100%", paddingLeft: "36px", border: "none", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.name); setSearchQuery(""); }}
                                    style={{
                                        padding: "4px 10px",
                                        whiteSpace: "nowrap",
                                        borderRadius: "6px",
                                        fontSize: "11px",
                                        background: selectedCategory === cat.name && !searchQuery ? "var(--grad-primary)" : "rgba(255,255,255,0.05)",
                                        color: selectedCategory === cat.name && !searchQuery ? "white" : "var(--text-muted)",
                                        border: "1px solid " + (selectedCategory === cat.name && !searchQuery ? "transparent" : "var(--border-glass)")
                                    }}
                                >
                                    {cat.emoji} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ flex: 1, overflowY: "auto", padding: "0", background: "rgba(0,0,0,0.1)" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-app)" }}>
                                <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                                    <th style={{ padding: "8px 12px", width: "40px" }}></th>
                                    <th style={{ padding: "8px 12px" }}>Product Name</th>
                                    <th style={{ padding: "8px 12px", width: "80px" }}>Variant</th>
                                    <th style={{ padding: "8px 12px", width: "80px", textAlign: "right" }}>Price</th>
                                    <th style={{ padding: "8px 12px", width: "50px" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    Object.entries(item.prices || {}).map(([type, price]) => (
                                        <tr 
                                            key={item.id + type} 
                                            onClick={() => addItem(item.name, price, type, item.emoji)}
                                            style={{ borderBottom: "1px solid var(--border-glass)", cursor: "pointer", transition: "0.2s" }}
                                            className="menu-row-hover"
                                        >
                                            <td style={{ padding: "6px 12px", fontSize: "18px" }}>{item.emoji}</td>
                                            <td style={{ padding: "6px 12px" }}>
                                                <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-main)" }}>{item.name}</div>
                                            </td>
                                            <td style={{ padding: "6px 12px" }}>
                                                <span style={{ fontSize: "10px", color: "var(--accent-primary)", fontWeight: "700", textTransform: "uppercase", background: "rgba(56, 189, 248, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>{type}</span>
                                            </td>
                                            <td style={{ padding: "6px 12px", textAlign: "right", fontWeight: "700", color: "var(--accent-success)", fontSize: "14px" }}>
                                                ₹{price}
                                            </td>
                                            <td style={{ padding: "6px 12px", textAlign: "center" }}>
                                                <button style={{ background: "var(--grad-primary)", width: "24px", height: "24px", borderRadius: "6px", color: "white", fontSize: "14px" }}>+</button>
                                            </td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BILL MANIFEST */}
                <div className="glass-panel" style={{ display: "flex", flexDirection: "column", background: "var(--bg-glass-heavy)", border: "1px solid var(--border-glass-bright)" }}>
                    <div style={{ padding: "12px", borderBottom: "1px solid var(--border-glass)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>Session</h3>
                        {billItems.length > 0 && (
                            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--accent-primary)", background: "rgba(99, 102, 241, 0.1)", padding: "2px 8px", borderRadius: "10px" }}>
                                {billNo || "DRAFT #..."}
                            </span>
                        )}
                    </div>
                        
                    <div style={{ padding: "12px", borderBottom: "1px solid var(--border-glass)" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            {selectedCustomer ? (
                                <div style={{ flex: 1, background: "rgba(56, 189, 248, 0.1)", padding: "10px 14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                                    <div>
                                        <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent-primary)" }}>{selectedCustomer.name}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{selectedCustomer.mobile}</div>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>✕</button>
                                </div>
                            ) : (
                                <div style={{ position: "relative", flex: 1 }}>
                                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>👤</span>
                                    <input 
                                        placeholder="Guest Identification..." 
                                        style={{ width: "100%", paddingLeft: "36px", background: "rgba(0,0,0,0.2)", borderRadius: "10px", fontSize: "13px" }}
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            const found = customerList.find(c => c.mobile.includes(e.target.value));
                                            if (found && e.target.value.length >= 10) setSelectedCustomer(found);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                        {billItems.length === 0 ? (
                            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
                                <div style={{ fontSize: "48px" }}>🧊</div>
                                <p style={{ fontSize: "14px", fontWeight: "500" }}>Manifest Empty</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {billItems.map((item, i) => (
                                    <div key={i} style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: "8px", 
                                        background: "rgba(255,255,255,0.02)", 
                                        padding: "8px", 
                                        borderRadius: "10px",
                                        border: "1px solid rgba(255,255,255,0.03)",
                                        animation: "slideInRight 0.2s ease-out"
                                    }}>
                                        <div style={{ width: "32px", fontSize: "20px" }}>{item.emoji}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "13px", fontWeight: "600" }}>{item.name}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{(item.qtyType || 'pc').toUpperCase()} • ₹{item.price}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "8px" }}>
                                            <button onClick={() => updateQty(i, -1)} style={{ width: "24px", height: "24px", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer" }}>-</button>
                                            <span style={{ minWidth: "20px", textAlign: "center", fontSize: "13px", fontWeight: "700" }}>{item.qty}</span>
                                            <button onClick={() => updateQty(i, 1)} style={{ width: "24px", height: "24px", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer" }}>+</button>
                                        </div>
                                        <button onClick={() => removeItem(i)} style={{ color: "var(--accent-danger)", opacity: 0.6, background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: "16px", background: "rgba(0,0,0,0.3)", borderTop: "1px solid var(--border-glass-bright)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-dim)" }}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-dim)" }}>
                                <span>Taxes (5% GST)</span>
                                <span>₹{(cgst + sgst).toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginTop: "2px" }}>
                                <span>Grand Total</span>
                                <span style={{ color: "var(--accent-success)" }}>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                            {["Cash", "UPI", "Card"].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setPaymentMode(mode)}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "10px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        background: paymentMode === mode ? "var(--grad-primary)" : "rgba(255,255,255,0.05)",
                                        color: paymentMode === mode ? "white" : "var(--text-muted)",
                                        border: "1px solid " + (paymentMode === mode ? "transparent" : "var(--border-glass)"),
                                        cursor: "pointer"
                                    }}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {!isLocked ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <button
                                    onClick={() => setShowPreview(true)}
                                    style={{ width: "100%", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", color: "white", cursor: "pointer" }}
                                    disabled={billItems.length === 0}
                                >
                                    🔍 Live Preview
                                </button>
                                <button
                                    className="btn-primary"
                                    style={{ width: "100%", padding: "16px", borderRadius: "14px", fontSize: "16px", fontWeight: "700" }}
                                    onClick={handlePrint}
                                    disabled={billItems.length === 0}
                                >
                                    Execute Print & Seal
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={resetBill}
                                className="btn-primary"
                                style={{ width: "100%", padding: "16px", borderRadius: "14px", fontSize: "16px", fontWeight: "700", background: "var(--accent-success)" }}
                            >
                                ✨ Initialize New Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* PRINT RECEIPT (HIDDEN) */}
            <div className="printable-bill" style={{ display: "none" }}>
                <center>
                    <h2 style={{ margin: 0, fontSize: "20px" }}>KALLU S TONDON</h2>
                    <div style={{ fontSize: "11px" }}>NEAR SATI CHAURA MANDIR</div>
                    <div style={{ fontSize: "11px" }}>GURU GOVIND SINGH LINK PATH PATNA CITY</div>
                    <div style={{ fontSize: "11px" }}>GST NO. 10APHPK4168H2Z2</div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>MOB-9234287770</div>
                </center>
                
                <div style={{ borderTop: "1.5px dashed black", margin: "10px 0" }}></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>BILL NO : {billNo}</span>
                    <span>DT : {new Date().toLocaleDateString("en-GB")} TM: {new Date().toLocaleTimeString("en-GB", { hour12: false })}</span>
                </div>
                
                <div style={{ borderTop: "1.5px dashed black", margin: "10px 0" }}></div>
                
                <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left" }}>
                            <th style={{ width: "10%" }}>SR</th>
                            <th style={{ width: "40%" }}>ITEM</th>
                            <th style={{ width: "15%", textAlign: "center" }}>QTY</th>
                            <th style={{ width: "17%", textAlign: "right" }}>PRICE</th>
                            <th style={{ width: "18%", textAlign: "right" }}>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billItems.map((item, i) => (
                            <React.Fragment key={i}>
                                <tr style={{ fontWeight: "bold" }}>
                                    <td>{i + 1}</td>
                                    <td colSpan="4">{item.name.toUpperCase()}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td style={{ textAlign: "center" }}>{item.qty}</td>
                                    <td style={{ textAlign: "right" }}>{item.price.toFixed(2)}</td>
                                    <td style={{ textAlign: "right" }}>{(item.price * item.qty).toFixed(2)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                
                <div style={{ borderTop: "1.5px dashed black", margin: "10px 0" }}></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px" }}>
                    <div>ITEM: {billItems.length} QTY: {billItems.reduce((a, b) => a + b.qty, 0)}</div>
                    <div>AMOUNT: {subtotal.toFixed(2)}</div>
                </div>

                <div style={{ borderTop: "1.5px dashed black", margin: "10px 0" }}></div>
                
                <table style={{ width: "100%", fontSize: "13px" }}>
                    <tbody>
                        <tr><td>SGST @ 2.5%</td><td>:</td><td style={{ textAlign: "right" }}>{cgst.toFixed(2)}</td></tr>
                        <tr><td>CGST @ 2.5%</td><td>:</td><td style={{ textAlign: "right" }}>{sgst.toFixed(2)}</td></tr>
                        <tr style={{ fontSize: "17px", fontWeight: "bold" }}>
                            <td>GRAND TOTAL</td>
                            <td>: ₹</td>
                            <td style={{ textAlign: "right" }}>{grandTotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* LIVE PREVIEW MODAL */}
            {showPreview && (
                <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div className="glass-panel" style={{ width: "100%", maxWidth: "300px", background: "white", color: "black", padding: "20px", borderRadius: "4px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "15px", borderBottom: "1px dashed #ccc", paddingBottom: "10px" }}>
                            <h2 style={{ margin: 0, fontSize: "18px" }}>KALLU S TONDON</h2>
                            <div style={{ fontSize: "10px" }}>NEAR SATI CHAURA MANDIR, LAKHIMPUR KHERI</div>
                            <div style={{ fontSize: "10px", marginTop: "4px" }}>PH: 9838042456</div>
                        </div>
                        
                        <div style={{ fontSize: "10px", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                            <span>Bill: {billNo || "DRAFT"}</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>

                        <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse", marginBottom: "10px" }}>
                            <thead style={{ borderBottom: "1px solid black" }}>
                                <tr>
                                    <th style={{ textAlign: "left", padding: "4px 0" }}>Item</th>
                                    <th style={{ textAlign: "right", padding: "4px 0" }}>Qty</th>
                                    <th style={{ textAlign: "right", padding: "4px 0" }}>Amt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billItems.map((it, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: "4px 0" }}>{it.name} ({it.qtyType})</td>
                                        <td style={{ textAlign: "right" }}>{it.qty}</td>
                                        <td style={{ textAlign: "right" }}>₹{(it.price * it.qty).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ borderTop: "1px dashed #ccc", paddingTop: "10px", fontSize: "11px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>GST (5%)</span>
                                <span>₹{(cgst + sgst).toFixed(2)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>
                                <span>Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px", borderTop: "1px solid black", paddingTop: "10px" }}>
                            THANK YOU • VISIT AGAIN
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                            <button onClick={() => setShowPreview(false)} style={{ flex: 1, padding: "8px", background: "#eee", border: "1px solid #ccc", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>Close</button>
                            <button onClick={() => { handlePrint(); setShowPreview(false); }} style={{ flex: 1, padding: "8px", background: "black", color: "white", borderRadius: "4px", fontSize: "12px", border: "none", cursor: "pointer" }}>Print Now</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
                .menu-row-hover:hover { background: rgba(255,255,255,0.05) !important; }
                .menu-row-hover:active { background: rgba(56, 189, 248, 0.2) !important; transform: scale(0.995); }
                @media print {
                    body * { visibility: hidden; }
                    .printable-bill, .printable-bill * { visibility: visible; }
                    .printable-bill { position: absolute; left: 0; top: 0; width: 300px; padding: 10px; color: black; background: white; }
                }
            `}</style>
        </>
    );
}
