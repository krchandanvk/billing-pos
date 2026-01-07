import { useState, useEffect } from "react";

export default function HistoryPage() {
    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false); // Toggle the 30-day hide rule

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const data = await window.api.getBills(showAll ? 500 : 100);
            setBills(data);
        } catch (err) {
            console.error("Failed to fetch bills:", err);
        }
        setLoading(false);
    };

    const handleReprint = async (bill) => {
        try {
            const items = await window.api.getBillItems(bill.id);
            const billData = {
                items: items,
                subtotal: bill.subtotal,
                cgst: bill.cgst,
                sgst: bill.sgst,
                total: bill.total,
                billNo: bill.bill_no,
                customerId: bill.customer_id,
                paymentMode: bill.payment_mode,
                reprint: true // Optional flag for UI
            };

            if (window.api && window.api.printBill) {
                await window.api.printBill(billData);
            } else {
                alert("Print API not available");
            }
        } catch (err) {
            console.error("Reprint failed:", err);
            alert("Failed to reconstruct bill for reprint.");
        }
    };

    // Filter logic for the UI search
    const filtered = bills.filter(b => {
        const isMatch = b.bill_no.includes(search) || (b.customer_name?.toLowerCase().includes(search.toLowerCase()));

        if (showAll) return isMatch;

        // 30-day hide rule
        const billDate = new Date(b.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return isMatch && billDate >= thirtyDaysAgo;
    });

    return (
        <div style={{ padding: "24px", color: "var(--text-main)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px" }}>📚 Bill History</h1>
                    <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>View and reprint past transactions</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        className="btn-secondary"
                        onClick={() => { setShowAll(!showAll); fetchBills(); }}
                    >
                        {showAll ? "Show Recent (30 Days)" : "Show Archived (All)"}
                    </button>
                    <button className="btn-primary" onClick={fetchBills}>🔄 Refresh</button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by Bill No..."
                        style={{ width: "100%", padding: "12px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "white", outline: "none" }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ textAlign: "left", background: "rgba(255,255,255,0.02)", color: "var(--text-muted)" }}>
                                <th style={{ padding: "16px" }}>Bill No</th>
                                <th style={{ padding: "16px" }}>Date & Time</th>
                                <th style={{ padding: "16px" }}>Amount</th>
                                <th style={{ padding: "16px" }}>Payment</th>
                                <th style={{ padding: "16px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center" }}>Loading History...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No bills found</td></tr>
                            ) : filtered.map(b => (
                                <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="table-row-hover">
                                    <td style={{ padding: "16px", fontWeight: "600" }}>#{b.bill_no}</td>
                                    <td style={{ padding: "16px" }}>{new Date(b.created_at).toLocaleString()}</td>
                                    <td style={{ padding: "16px", color: "#4ade80", fontWeight: "bold" }}>₹{b.total.toFixed(2)}</td>
                                    <td style={{ padding: "16px" }}>
                                        <span style={{
                                            background: b.payment_mode === 'Cash' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                            color: b.payment_mode === 'Cash' ? '#4ade80' : '#60a5fa',
                                            padding: "4px 8px", borderRadius: "4px", fontSize: "11px"
                                        }}>
                                            {b.payment_mode || 'Cash'}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px" }}>
                                        <button
                                            className="btn-secondary"
                                            style={{ fontSize: "11px", padding: "6px 12px" }}
                                            onClick={() => handleReprint(b)}
                                        >
                                            🖨️ Reprint
                                        </button>
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
