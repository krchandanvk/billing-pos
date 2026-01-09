import React, { useState, useEffect, useMemo } from "react";

export default function BillingPage() {
    // MULTI-TABLE STATE
    const [tables, setTables] = useState(() => {
        const initial = {};
        for (let i = 1; i <= 21; i++) {
            initial[i] = { items: [], billNo: "", isLocked: false };
        }
        return initial;
    });
    const [activeTable, setActiveTable] = useState(1);

    // PERSISTENCE STATE (Shared)
    const [categories, setCategories] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);

    // Load Data
    useEffect(() => {
        const loadInitialData = async () => {
            if (!window.api) {
                const mockCats = [{ id: 1, name: "Tandoor & Breads", emoji: "🫓" }];
                const mockItems = [{ id: 101, category_id: 1, name: "Roti", emoji: "🫓", prices: { pc: 10 } }];
                setCategories(mockCats);
                setAllItems(mockItems);
                setSelectedCategory("Tandoor & Breads");
                setLoading(false);
                return;
            }
            try {
                const [cats, items] = await Promise.all([
                    window.api.getCategories(),
                    window.api.getMenuItems()
                ]);
                setCategories(cats || []);
                const parsedItems = (items || []).map(item => ({
                    ...item,
                    prices: (typeof item.prices === 'string' && item.prices) ? JSON.parse(item.prices) : (item.prices || {})
                }));
                setAllItems(parsedItems);
                if (cats && cats.length > 0) setSelectedCategory(cats[0].name);
            } catch (err) {
                console.error("Data load failed:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Current Table Helpers
    const currentTableData = tables[activeTable];
    const billItems = currentTableData.items;
    const isLocked = currentTableData.isLocked;
    const billNo = currentTableData.billNo;

    const updateCurrentTable = (updates) => {
        setTables(prev => ({
            ...prev,
            [activeTable]: { ...prev[activeTable], ...updates }
        }));
    };

    const addItem = async (itemName, price, qtyType, emoji) => {
        if (isLocked) return;
        
        // Safety check for active table
        if (!tables[activeTable]) {
            console.error("Invalid active table:", activeTable);
            return;
        }

        let newItems = [...billItems];
        const existing = newItems.find(i => i.name === itemName && i.qtyType === qtyType);
        if (existing) {
            newItems = newItems.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i);
        } else {
            newItems.push({ name: itemName, price, qtyType, qty: 1, emoji });
        }
        
        // We do NOT generate a Bill Number here anymore. 
        // Bill Numbers are fiscal documents and should only be generated at Checkout.
        updateCurrentTable({ items: newItems });
    };

    const updateQty = (index, delta) => {
        if (isLocked) return;
        const newItems = billItems.map((item, i) => 
            i === index ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        );
        updateCurrentTable({ items: newItems });
    };

    const removeItem = (index) => {
        if (isLocked) return;
        const newItems = billItems.filter((_, i) => i !== index);
        updateCurrentTable({ items: newItems });
    };

    const resetBill = () => {
        updateCurrentTable({ items: [], billNo: "", isLocked: false });
    };

    const handleKOT = async () => {
        try {
            console.log("handleKOT triggered", billItems);
            if (billItems.length === 0) return;
            
            if (window.api?.printKOT) {
                await window.api.printKOT({ items: billItems, tableNo: activeTable });
            } else {
                alert(`KOT Sent for Table ${activeTable} (Simulated)`);
            }
        } catch (error) {
            console.error("KOT Error:", error);
            alert("Error sending KOT: " + error.message);
        }
    };

    const handlePrintFinal = async () => {
        try {
            console.log("handlePrintFinal triggered");
            // GENERATE BILL NUMBER HERE (AT CHECKOUT)
            let finalBillNo = billNo;
            if (!finalBillNo) {
                if (window.api?.getNextBillNo) {
                    try {
                        finalBillNo = await window.api.getNextBillNo();
                        console.log("Generated Bill No:", finalBillNo);
                    } catch (e) {
                        console.error("Error generating bill no", e);
                        finalBillNo = "ERR";
                    }
                } else {
                    finalBillNo = "01"; 
                }
            }

            const billData = { items: billItems, subtotal, cgst, sgst, total: grandTotal, billNo: finalBillNo, customerName: "CASH", paymentMode: "Cash" };
            console.log("Sending Bill Data:", billData);
            
            if (window.api?.printBill) {
                const result = await window.api.printBill(billData);
                if (result && result.success && result.path) {
                    alert(`✅ Bill saved successfully!\nLocation: ${result.path}`);
                }
            } else {
                window.print();
            }
            
            // Clear the table after printing final bill
            resetBill();
        } catch (error) {
            console.error("Print Final Error:", error);
            alert("Error printing bill: " + error.message);
        }
    };


    // Calculations (INCLUSIVE TAX LOGIC)
    const grandTotal = billItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    const taxableValue = grandTotal / 1.05;
    const totalTax = grandTotal - taxableValue;
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const subtotal = grandTotal; // For display purposes, Subtotal = Grand Total in inclusive mode

    const currentCategoryObj = useMemo(() => categories.find(c => c.name === selectedCategory) || { id: null }, [categories, selectedCategory]);
    const filteredItems = useMemo(() => searchQuery ? allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) : allItems.filter(item => item.category_id === currentCategoryObj.id), [allItems, currentCategoryObj, searchQuery]);

    return (
        <div style={{ position: "fixed", inset: 0, paddingLeft: "210px", background: "var(--bg-app)", color: "white" }}>
            
            {/* TOP TABLE SELECTOR */}
            <div style={{ padding: "10px", background: "#000", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", maxHeight: "120px", overflowY: "auto" }}>
                <span style={{ fontSize: "12px", fontWeight: "900", color: "#666", marginRight: "10px", width: "100%" }}>ACTIVE TABLES (1-21):</span>
                {Object.keys(tables).map(id => (
                    <button 
                        key={id} 
                        onClick={() => setActiveTable(parseInt(id))}
                        style={{ 
                            padding: "8px 16px", 
                            borderRadius: "8px", 
                            background: activeTable === parseInt(id) ? "var(--grad-primary)" : (tables[id].items.length > 0 ? "rgba(255,165,0,0.2)" : "rgba(255,255,255,0.05)"),
                            border: tables[id].items.length > 0 ? "1px solid orange" : "1px solid rgba(255,255,255,0.1)",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: "900",
                            transition: "0.2s"
                        }}
                    >
                        T-{id} {tables[id].items.length > 0 ? `(₹${tables[id].items.reduce((s,i) => s + i.price*i.qty, 0)})` : ""}
                    </button>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 350px", gap: "10px", height: "calc(100vh - 60px)", padding: "10px" }}>
                
                {/* LEFT: PRODUCTS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
                    {isLocked && (
                        <div style={{ position: "absolute", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "20px", backdropFilter: "blur(5px)" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "80px" }}>🔒</div>
                                <h2>TABLE {activeTable} SEALED</h2>
                                <button onClick={resetBill} style={{ marginTop: "20px", padding: "15px 40px", background: "var(--accent-success)", border: "none", borderRadius: "10px", color: "white", fontWeight: "900", cursor: "pointer" }}>CLEAR TABLE</button>
                            </div>
                        </div>
                    )}

                    <div className="glass-panel" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <input placeholder="🔍 Search products..." style={{ width: "100%", padding: "12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white" }} onChange={e => setSearchQuery(e.target.value)} />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setSearchQuery(""); }} style={{ padding: "8px 12px", borderRadius: "8px", background: selectedCategory === cat.name ? "var(--grad-primary)" : "rgba(255,255,255,0.05)", border: "none", color: "white", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}>{cat.emoji} {cat.name}</button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ flex: 1, overflowY: "auto", padding: 0 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ position: "sticky", top: 0, background: "#111", zIndex: 10 }}>
                                <tr>
                                    <th style={{ padding: "15px", textAlign: "left", fontSize: "12px", opacity: 0.5 }}>ITEM</th>
                                    <th style={{ padding: "15px", textAlign: "right", fontSize: "12px", opacity: 0.5 }}>PRICE</th>
                                    <th style={{ padding: "15px", width: "50px" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    Object.entries(item.prices || {}).map(([type, price]) => (
                                        <tr key={`${item.id}-${type}`} onClick={() => addItem(item.name, price, type, item.emoji)} className="menu-row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                                            <td style={{ padding: "15px" }}>{item.emoji} {item.name} <span style={{ fontSize: "10px", color: "var(--accent-primary)", fontWeight: "900" }}>{type.toUpperCase()}</span></td>
                                            <td style={{ padding: "15px", textAlign: "right", color: "var(--accent-success)", fontWeight: "800" }}>₹{price}</td>
                                            <td style={{ padding: "15px", textAlign: "center" }}><button style={{ background: "var(--grad-primary)", border: "none", borderRadius: "5px", color: "white", width: "28px", height: "28px" }}>+</button></td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: BILL SIDEBAR */}
                <div style={{ display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.3)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ padding: "15px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "900" }}>TABLE {activeTable} MANIFEST</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                             {billNo ? (
                                <span style={{ background: "var(--accent-primary)", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "900" }}>{billNo}</span>
                             ) : (
                                <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", color: "#888" }}>NEW</span>
                             )}
                             <button 
                                onClick={async () => {
                                    if(confirm("Confirm: Reset bill numbering sequence to 01? This will not delete history.")) {
                                        if (window.api?.resetBillSequence) {
                                            await window.api.resetBillSequence();
                                            window.location.reload();
                                        }
                                    }
                                }}
                                title="Reset Bill Numbering"
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: 0.5, padding: "4px" }}
                             >
                                 🔄
                             </button>
                        </div>
                    </div>

                    <div style={{ padding: "10px" }}>
                        <button onClick={handleKOT} disabled={billItems.length === 0} style={{ width: "100%", padding: "15px", background: "rgba(168, 85, 247, 0.2)", border: "2px solid #a855f7", color: "#d8b4fe", borderRadius: "10px", fontWeight: "900", cursor: "pointer", fontSize: "14px" }}>
                            👨‍🍳 ORDER TO KITCHEN
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                        {billItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: "10px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", marginBottom: "5px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "13px", fontWeight: "700" }}>{item.name}</div>
                                    <div style={{ fontSize: "10px", opacity: 0.5 }}>{item.qtyType} • ₹{item.price}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <button onClick={(e) => { e.stopPropagation(); updateQty(i, -1); }} disabled={isLocked} style={{ color: "white", background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>-</button>
                                    <span style={{ fontWeight: "900" }}>{item.qty}</span>
                                    <button onClick={(e) => { e.stopPropagation(); updateQty(i, 1); }} disabled={isLocked} style={{ color: "white", background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>+</button>
                                </div>
                                {!isLocked && <button onClick={() => removeItem(i)} style={{ color: "var(--accent-danger)", background: "none", border: "none", cursor: "pointer" }}>🗑️</button>}
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: "15px", background: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#888", marginBottom: "4px" }}><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--accent-primary)", marginBottom: "10px" }}><span>GST (5% Included)</span><span>₹{totalTax.toFixed(2)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", fontWeight: "900", fontSize: "22px", color: "var(--accent-success)" }}>
                            <span>TOTAL</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                        <button onClick={handlePrintFinal} disabled={billItems.length === 0} style={{ width: "100%", padding: "18px", background: "var(--grad-primary)", border: "none", borderRadius: "12px", color: "white", fontSize: "16px", fontWeight: "900", cursor: "pointer" }}>PRINT FINAL BILL</button>
                    </div>
                </div>
            </div>

            {/* Sidebar padding accounted for by App.jsx layout */}
            <style>{`
                .menu-row-hover:hover { background: rgba(255,255,255,0.05) !important; }
                @media print { body * { visibility: hidden !important; } }
            `}</style>
        </div>
    );
}
