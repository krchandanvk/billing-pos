import React, { useState, useEffect } from "react";

export default function MenuPage() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCatId, setSelectedCatId] = useState(null);
    const [showItemForm, setShowItemForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", emoji: "🥘", prices: { half: "", full: "" } });
    const [newCat, setNewCat] = useState({ name: "", emoji: "📂" });

    const loadData = async () => {
        if (!window.api) {
            // MOCK DATA FOR WEB BROWSER MODE
            const mockCats = [
                { id: 1, name: "Chinese Veg", emoji: "🥢" },
                { id: 2, name: "Snacks", emoji: "🍟" }
            ];
            const mockItems = [
                { id: 101, category_id: 1, name: "Veg Chowmein", emoji: "🍜", prices: { half: 60, full: 120 } },
                { id: 102, category_id: 1, name: "Veg Fried Rice", emoji: "🍚", prices: { half: 60, full: 120 } },
                { id: 201, category_id: 2, name: "Paneer Pakora", emoji: "🧀", prices: { plate: 180 } }
            ];
            setCategories(mockCats);
            setItems(mockItems);
            setSelectedCatId(1);
            return;
        }
        const cats = await window.api.getCategories();
        const allItems = await window.api.getMenuItems();
        setCategories(cats || []);
        setItems((allItems || []).map(i => ({ ...i, prices: typeof i.prices === 'string' ? JSON.parse(i.prices) : i.prices })));
        if (cats && cats.length > 0) setSelectedCatId(cats[0].id);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddCategory = async (e) => {
        if (e) e.preventDefault();
        console.log("Attempting to add category:", newCat);
        if (!newCat.name) {
            alert("Please enter a group name");
            return;
        }
        
        try {
            if (window.api) {
                await window.api.addCategory(newCat);
            } else {
                console.log("Mock adding category:", newCat);
                setCategories([...categories, { id: Date.now(), ...newCat }]);
            }
            setNewCat({ name: "", emoji: "📂" });
            loadData();
        } catch (err) {
            console.error(err);
            alert("Failed to add category. Name might be duplicate.");
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name.trim()) {
            alert("Please enter a product name.");
            return;
        }
        if (!selectedCatId) {
            alert("Please select or create a category first.");
            return;
        }

        const cleanedPrices = {};
        Object.entries(newItem.prices).forEach(([k, v]) => {
            if (v && v.trim() !== "") {
                const p = parseFloat(v);
                if (!isNaN(p)) cleanedPrices[k] = p;
            }
        });

        if (Object.keys(cleanedPrices).length === 0) {
            alert("Please enter at least one price (e.g. Full: 120).");
            return;
        }

        try {
            if (window.api) {
                await window.api.addMenuItem({
                    category_id: selectedCatId,
                    name: newItem.name.trim(),
                    emoji: newItem.emoji,
                    prices: cleanedPrices
                });
                alert("✅ Product added to catalog!");
            } else {
                setItems([...items, { id: Date.now(), category_id: selectedCatId, ...newItem, prices: cleanedPrices }]);
            }
            setNewItem({ name: "", emoji: "🥘", prices: { half: "", full: "" } });
            setShowItemForm(false);
            loadData();
        } catch (err) {
            console.error(err);
            alert("❌ Failed to add product: " + err.message);
        }
    };

    const handleDeleteItem = async (id) => {
        if (confirm("Permanently archive this product?")) {
            await window.api.deleteMenuItem(id);
            loadData();
        }
    };

    const handleDeleteCategory = async (id) => {
        if (confirm("Archiving this category will hide all associated catalog items. Proceed?")) {
            await window.api.deleteCategory(id);
            loadData();
        }
    };

    return (
        <div style={{ padding: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px", marginBottom: "24px" }}>
                <div style={{ textAlign: "left" }}>
                    <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "2px" }}>Product Catalog</h1>
                    <p style={{ color: "var(--text-dim)", fontSize: "12px" }}>Manage menu clusters and pricing variants</p>
                </div>
                <button onClick={() => setShowItemForm(true)} className="btn-primary" style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", justifyContent: "flex-start" }}>
                    <span>➕</span> Register Product
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "12px", height: "calc(100vh - 120px)" }}>
                {/* Categories Navigation */}
                <div className="glass-panel" style={{ display: "flex", flexDirection: "column", background: "rgba(15, 23, 42, 0.4)" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-glass)" }}>
                        <h3 style={{ margin: 0, fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>Clusters</h3>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {categories.map(cat => (
                                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <button
                                        onClick={() => setSelectedCatId(cat.id)}
                                        className={`nav-item ${selectedCatId === cat.id ? 'active' : ''}`}
                                        style={{
                                            flex: 1,
                                            padding: "10px 14px",
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-start",
                                            gap: "12px",
                                            fontSize: "14px"
                                        }}
                                    >
                                        <div style={{ width: "24px", display: "flex", justifyContent: "flex-start", fontSize: "16px" }}>{cat.emoji}</div>
                                        <span style={{ fontWeight: selectedCatId === cat.id ? "700" : "500", textAlign: "left" }}>{cat.name}</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCategory(cat.id)} 
                                        style={{ background: "transparent", color: "var(--text-dim)", padding: "10px", borderRadius: "10px" }}
                                        className="btn-icon"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: "20px", borderTop: "1px solid var(--border-glass)", background: "rgba(0,0,0,0.2)" }}>
                        <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "var(--text-muted)" }}>Manual Entry</p>
                        <form onSubmit={handleAddCategory} style={{ display: "flex", gap: "8px" }}>
                            <input 
                                placeholder="Group Name..." 
                                value={newCat.name}
                                onChange={e => setNewCat({...newCat, name: e.target.value})}
                                style={{ flex: 1, padding: "8px 12px", fontSize: "13px", color: "white", background: "rgba(255,255,255,0.1)" }}
                            />
                            <button type="submit" className="btn-secondary" style={{ padding: "8px", borderRadius: "8px" }}>➕</button>
                        </form>
                    </div>
                </div>

                {/* Items Manifest */}
                <div className="glass-panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-glass)", background: "rgba(15, 23, 42, 0.4)" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-main)" }}>
                            {categories.find(c => c.id === selectedCatId)?.name || "Primary"} Inventory
                        </h3>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left" }}>Article Name</th>
                                    <th style={{ textAlign: "left" }}>Unit Valuation</th>
                                    <th style={{ textAlign: "left" }}>Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.filter(i => i.category_id === selectedCatId).map((item, idx) => (
                                    <tr key={item.id} style={{ animation: "fadeIn 0.3s ease-out forwards", animationDelay: `${idx * 0.05}s`, opacity: 0 }}>
                                        <td style={{ textAlign: "left" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "flex-start", fontSize: "18px" }}>{item.emoji}</div>
                                                <div style={{ fontWeight: "600", textAlign: "left" }}>{item.name}</div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "left" }}>
                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-start" }}>
                                                {Object.entries(item.prices || {}).map(([type, price]) => (
                                                    <div key={type} style={{ background: "rgba(56, 189, 248, 0.1)", color: "var(--accent-primary)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", textAlign: "left" }}>
                                                        <span style={{ opacity: 0.6, textTransform: "uppercase" }}>{type}</span>: ₹{price}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "left" }}>
                                            <button onClick={() => handleDeleteItem(item.id)} className="btn-icon btn-danger" style={{ borderRadius: "10px", justifyContent: "center" }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for adding/editing item */}
            {showItemForm && (
                <div style={modalOverlayStyle}>
                    <div className="glass-panel" style={{ width: "460px", padding: "32px", border: "1px solid var(--border-glass-bright)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "24px" }}>New Inventory Entry</h2>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={labelStyle}>Article Official Name</label>
                                <input 
                                    placeholder="e.g. Arctic Berry Fusion"
                                    value={newItem.name}
                                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                                    style={{ width: "100%", marginTop: "6px" }}
                                />
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "12px" }}>
                                <div>
                                    <label style={labelStyle}>Icon</label>
                                    <input value={newItem.emoji} onChange={e => setNewItem({...newItem, emoji: e.target.value})} style={{ width: "100%", marginTop: "6px", textAlign: "center", fontSize: "20px" }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Parent Cluster</label>
                                    <select 
                                        value={selectedCatId} 
                                        onChange={e => setSelectedCatId(parseInt(e.target.value))}
                                        style={{ width: "100%", marginTop: "6px" }}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Pricing Structure (variants)</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "6px" }}>
                                    <input placeholder="Half (₹)" type="number" value={newItem.prices.half} onChange={e => setNewItem({...newItem, prices: {...newItem.prices, half: e.target.value}})} />
                                    <input placeholder="Full (₹)" type="number" value={newItem.prices.full} onChange={e => setNewItem({...newItem, prices: {...newItem.prices, full: e.target.value}})} />
                                    <input placeholder="Plate (₹)" type="number" value={newItem.prices.plate} onChange={e => setNewItem({...newItem, prices: {...newItem.prices, plate: e.target.value}})} />
                                    <input placeholder="Piece (₹)" type="number" value={newItem.prices.pc} onChange={e => setNewItem({...newItem, prices: {...newItem.prices, pc: e.target.value}})} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                                <button onClick={handleAddItem} className="btn-primary" style={{ flex: 1, padding: "14px" }}>Register Product</button>
                                <button onClick={() => setShowItemForm(false)} className="btn-secondary" style={{ flex: 0.5 }}>Dismiss</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

const labelStyle = {
    fontSize: "11px",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "600"
};

const modalOverlayStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(12px)"
};
