import { useState, useEffect } from "react";

export default function MenuPage() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCatId, setSelectedCatId] = useState(null);
    const [showItemForm, setShowItemForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", emoji: "🥘", prices: { half: "", full: "" } });
    const [newCat, setNewCat] = useState({ name: "", emoji: "📂" });

    const loadData = async () => {
        const cats = await window.api.getCategories();
        const allItems = await window.api.getMenuItems();
        setCategories(cats);
        setItems(allItems.map(i => ({ ...i, prices: JSON.parse(i.prices) })));
        if (cats.length > 0 && !selectedCatId) setSelectedCatId(cats[0].id);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddCategory = async () => {
        if (!newCat.name) return;
        await window.api.addCategory(newCat);
        setNewCat({ name: "", emoji: "📂" });
        loadData();
    };

    const handleAddItem = async () => {
        if (!newItem.name || !selectedCatId) return;
        // Clean prices (remove empty)
        const cleanedPrices = {};
        Object.entries(newItem.prices).forEach(([k, v]) => {
            if (v) cleanedPrices[k] = parseFloat(v);
        });

        await window.api.addMenuItem({
            category_id: selectedCatId,
            name: newItem.name,
            emoji: newItem.emoji,
            prices: cleanedPrices
        });
        setNewItem({ name: "", emoji: "🥘", prices: { half: "", full: "" } });
        setShowItemForm(false);
        loadData();
    };

    const handleDeleteItem = async (id) => {
        if (confirm("Delete this item?")) {
            await window.api.deleteMenuItem(id);
            loadData();
        }
    };

    const handleDeleteCategory = async (id) => {
        if (confirm("Delete this category and all its items?")) {
            await window.api.deleteCategory(id);
            loadData();
        }
    };

    return (
        <div style={{ padding: "24px", color: "var(--text-main)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px" }}>📋 Menu Management</h1>
                    <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>Manage your restaurant menu and pricing</p>
                </div>
                <button onClick={() => setShowItemForm(true)} className="btn-primary" style={{ padding: "10px 20px" }}>
                    + Add New Item
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "24px" }}>
                {/* Categories Sidebar */}
                <div className="glass-panel" style={{ padding: "16px" }}>
                    <h3 style={{ marginTop: 0, fontSize: "16px", marginBottom: "16px" }}>Categories</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {categories.map(cat => (
                            <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                    onClick={() => setSelectedCatId(cat.id)}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        textAlign: "left",
                                        background: selectedCatId === cat.id ? "rgba(14, 165, 233, 0.15)" : "transparent",
                                        border: "none",
                                        borderRadius: "6px",
                                        color: selectedCatId === cat.id ? "var(--accent-primary)" : "var(--text-muted)",
                                        cursor: "pointer"
                                    }}
                                >
                                    {cat.emoji} {cat.name}
                                </button>
                                <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: "transparent", color: "#f43f5e", border: "none", cursor: "pointer" }}>✕</button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <input 
                            placeholder="New Category Name" 
                            value={newCat.name}
                            onChange={e => setNewCat({...newCat, name: e.target.value})}
                            style={inputStyle}
                        />
                        <button onClick={handleAddCategory} className="btn-secondary" style={{ width: "100%", marginTop: "8px" }}>Add Category</button>
                    </div>
                </div>

                {/* Items List */}
                <div className="glass-panel" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ margin: 0, fontSize: "18px" }}>
                            {categories.find(c => c.id === selectedCatId)?.name || "Select Category"} Items
                        </h3>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                <th style={{ padding: "12px" }}>Item</th>
                                <th style={{ padding: "12px" }}>Prices</th>
                                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.filter(i => i.category_id === selectedCatId).map(item => (
                                <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <td style={{ padding: "12px" }}>
                                        <span style={{ fontSize: "20px", marginRight: "10px" }}>{item.emoji}</span>
                                        {item.name}
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        {Object.entries(item.prices).map(([type, price]) => (
                                            <span key={type} style={{ marginRight: "10px", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                                                {type}: ₹{price}
                                            </span>
                                        ))}
                                    </td>
                                    <td style={{ padding: "12px", textAlign: "right" }}>
                                        <button onClick={() => handleDeleteItem(item.id)} className="btn-icon btn-danger">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for adding/editing item */}
            {showItemForm && (
                <div style={modalOverlayStyle}>
                    <div className="glass-panel" style={{ width: "400px", padding: "24px" }}>
                        <h2 style={{ marginTop: 0 }}>Add New Item</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Item Name</label>
                            <input 
                                value={newItem.name}
                                onChange={e => setNewItem({...newItem, name: e.target.value})}
                                style={inputStyle}
                            />
                            
                            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Emoji/Icon</label>
                            <input 
                                value={newItem.emoji}
                                onChange={e => setNewItem({...newItem, emoji: e.target.value})}
                                style={inputStyle}
                            />

                            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Prices</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <input placeholder="Half Price" type="number" value={newItem.prices.half} onChange={e => setNewItem({...newItem, prices: {...newItem.prices, half: e.target.value}})} style={inputStyle} />
                                <input placeholder="Full Price" type="number" value={newItem.prices.full} onChange={e => setNewItem({...newItem, prices: {...newItem.prices, full: e.target.value}})} style={inputStyle} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <input placeholder="Plate Price" type="number" value={newItem.prices.plate} onChange={e => setNewItem({...newItem, prices: {...newItem.prices, plate: e.target.value}})} style={inputStyle} />
                                <input placeholder="Pc Price" type="number" value={newItem.prices.pc} onChange={e => setNewItem({...newItem, prices: {...newItem.prices, pc: e.target.value}})} style={inputStyle} />
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button onClick={handleAddItem} className="btn-primary" style={{ flex: 1 }}>Save</button>
                                <button onClick={() => setShowItemForm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.2)",
    color: "white",
    fontSize: "14px",
    outline: "none"
};

const modalOverlayStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(5px)"
};
