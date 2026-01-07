import { useState, useEffect } from "react";

export default function CustomerPage() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");
    const [newCustomer, setNewCustomer] = useState({ name: "", mobile: "", notes: "" });
    const [showAdd, setShowAdd] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await window.api.getCustomers();
            setCustomers(data);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCustomer.name || !newCustomer.mobile) return alert("Name and Mobile are required");
        try {
            await window.api.addCustomer(newCustomer);
            setNewCustomer({ name: "", mobile: "", notes: "" });
            setShowAdd(false);
            fetchCustomers();
        } catch (err) {
            alert("Error adding customer (Mobile might be duplicate)");
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search)
    );

    return (
        <div style={{ padding: "24px", color: "var(--text-main)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px" }}>👤 Customer Database</h1>
                    <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>Manage your regular guests and their preferences</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowAdd(!showAdd)}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    {showAdd ? "Close" : "+ Add New Customer"}
                </button>
            </div>

            {showAdd && (
                <form className="glass-panel" onSubmit={handleAdd} style={{ padding: "20px", marginBottom: "24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                    <div>
                        <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Name</label>
                        <input
                            type="text"
                            className="btn-secondary"
                            style={{ width: "100%", textAlign: "left", marginTop: "4px", background: "rgba(0,0,0,0.2)" }}
                            value={newCustomer.name}
                            onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Mobile Number</label>
                        <input
                            type="text"
                            className="btn-secondary"
                            style={{ width: "100%", textAlign: "left", marginTop: "4px", background: "rgba(0,0,0,0.2)" }}
                            value={newCustomer.mobile}
                            onChange={e => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                            placeholder="9876543210"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Notes (Optional)</label>
                        <input
                            type="text"
                            className="btn-secondary"
                            style={{ width: "100%", textAlign: "left", marginTop: "4px", background: "rgba(0,0,0,0.2)" }}
                            value={newCustomer.notes}
                            onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                            placeholder="Prefers less spicy"
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ height: "38px" }}>Save</button>
                </form>
            )}

            <div className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <input
                        type="text"
                        placeholder="🔍 Search customers by name or mobile..."
                        style={{ width: "100%", padding: "12px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "white", outline: "none" }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ textAlign: "left", background: "rgba(255,255,255,0.02)", color: "var(--text-muted)" }}>
                                <th style={{ padding: "16px" }}>Name</th>
                                <th style={{ padding: "16px" }}>Mobile</th>
                                <th style={{ padding: "16px" }}>Notes</th>
                                <th style={{ padding: "16px" }}>Visited</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ padding: "40px", textAlign: "center" }}>Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No customers found</td></tr>
                            ) : filtered.map(c => (
                                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "0.2s" }} className="table-row-hover">
                                    <td style={{ padding: "16px", fontWeight: "500" }}>{c.name}</td>
                                    <td style={{ padding: "16px", color: "var(--accent-primary)" }}>{c.mobile}</td>
                                    <td style={{ padding: "16px", color: "var(--text-muted)" }}>{c.notes || "-"}</td>
                                    <td style={{ padding: "16px" }}>
                                        <span style={{ background: "rgba(6, 182, 212, 0.1)", color: "var(--accent-secondary)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                                            Primary Member
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
