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
        if (!window.api) {
            setCustomers([
                { id: 1, name: "John Doe", mobile: "9876543210", notes: "Regular customer" },
                { id: 2, name: "Jane Smith", mobile: "9988776655", notes: "Prefers UPI" }
            ]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await window.api.getCustomers();
            setCustomers(data || []);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCustomer.name || !newCustomer.mobile) return;
        try {
            await window.api.addCustomer(newCustomer);
            setNewCustomer({ name: "", mobile: "", notes: "" });
            setShowAdd(false);
            fetchCustomers();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search)
    );

    return (
        <div style={{ padding: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "4px" }}>Guest Management</h1>
                    <p style={{ color: "var(--text-dim)", fontSize: "14px" }}>CRM and loyalty engagement for your regular clientele</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowAdd(!showAdd)}
                    style={{ padding: "12px 24px", borderRadius: "12px" }}
                >
                    {showAdd ? "Close Panel" : "➕ Enroll New Guest"}
                </button>
            </div>

            {showAdd && (
                <div className="glass-panel" style={{ animation: "slideInRight 0.3s ease-out", padding: "24px", marginBottom: "32px", background: "rgba(56, 189, 248, 0.05)", border: "1px solid var(--accent-primary)" }}>
                    <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr auto", gap: "20px", alignItems: "end" }}>
                        <div>
                            <label style={labelStyle}>Full Legal Name</label>
                            <input
                                placeholder="e.g. Alexander Frost"
                                style={{ width: "100%", marginTop: "6px" }}
                                value={newCustomer.name}
                                onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Contact Identity (Mobile)</label>
                            <input
                                placeholder="+91 XXXXX XXXXX"
                                style={{ width: "100%", marginTop: "6px" }}
                                value={newCustomer.mobile}
                                onChange={e => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Service Preferences / Notes</label>
                            <input
                                placeholder="Likes dairy-free, allergic to nuts"
                                style={{ width: "100%", marginTop: "6px" }}
                                value={newCustomer.notes}
                                onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ height: "42px", padding: "0 30px" }}>Save Dossier</button>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "20px", background: "rgba(15, 23, 42, 0.4)", display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Identify guest by name or verification number..."
                            style={{ width: "100%", paddingLeft: "40px", borderRadius: "12px" }}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Contact Number</th>
                                <th>Preference Profile</th>
                                <th style={{ textAlign: "right" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ padding: "60px", textAlign: "center" }}>
                                    <div style={{ width: "24px", height: "24px", border: "2px solid rgba(56, 189, 248, 0.1)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }}></div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: "60px", textAlign: "center", color: "var(--text-dim)" }}>No guest records found matching these criteria.</td></tr>
                            ) : filtered.map((c, idx) => (
                                <tr key={c.id} style={{ animation: "fadeIn 0.3s ease-out forwards", animationDelay: `${idx * 0.05}s`, opacity: 0 }}>
                                    <td style={{ fontWeight: "600" }}>{c.name}</td>
                                    <td style={{ color: "var(--accent-primary)", fontWeight: "500" }}>{c.mobile}</td>
                                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{c.notes || <span style={{ opacity: 0.4 }}>No recorded preferences</span>}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <span style={{ 
                                            background: "rgba(16, 185, 129, 0.1)", 
                                            color: "var(--accent-success)", 
                                            padding: "4px 10px", 
                                            borderRadius: "20px", 
                                            fontSize: "11px", 
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>
                                            Active Member
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
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
