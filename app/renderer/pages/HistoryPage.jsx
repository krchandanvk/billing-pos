import { useState, useEffect } from "react";

export default function HistoryPage() {
    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchBills();
    }, [showAll]);

    const fetchBills = async () => {
        if (!window.api) {
            setBills([
                { id: 1, bill_no: "B-001", customer_name: "John Doe", total: 1250, payment_mode: "Cash", created_at: new Date().toISOString() },
                { id: 2, bill_no: "B-002", customer_name: "Jane Smith", total: 850, payment_mode: "UPI", created_at: new Date().toISOString() }
            ]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await window.api.getBills(showAll ? 500 : 100);
            setBills(data || []);
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
                reprint: true
            };

            if (window.api && window.api.printBill) {
                await window.api.printBill(billData);
            }
        } catch (err) {
            console.error("Reprint failed:", err);
        }
    };

    const filtered = bills.filter(b => {
        const isMatch = b.bill_no.includes(search) || (b.customer_name?.toLowerCase().includes(search.toLowerCase()));
        if (showAll) return isMatch;
        const billDate = new Date(b.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return isMatch && billDate >= thirtyDaysAgo;
    });

    return (
        <div style={{ padding: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "2px" }}>Transaction Ledger</h1>
                    <p style={{ color: "var(--text-dim)", fontSize: "12px" }}>Historical record of all issued invoices</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        className="btn-secondary"
                        onClick={() => setShowAll(!showAll)}
                        style={{ fontSize: "12px", padding: "8px 12px" }}
                    >
                        {showAll ? "🕰️ Recent" : "📁 Archive"}
                    </button>
                    <button className="btn-primary" onClick={fetchBills} style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: "14px" }}>🔄</span>
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: "0", overflow: "hidden", border: "1px solid var(--border-glass-bright)" }}>
                <div style={{ padding: "12px", background: "rgba(15, 23, 42, 0.4)", display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: "12px" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Universal search..."
                            style={{ width: "100%", paddingLeft: "32px", height: "36px", fontSize: "13px" }}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Bill ID</th>
                                <th>Date & Timestamp</th>
                                <th>Customer Entity</th>
                                <th>Revenue</th>
                                <th>Method</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: "60px", textAlign: "center" }}>
                                    <div style={{ width: "24px", height: "24px", border: "2px solid rgba(56, 189, 248, 0.1)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", display: "inline-block" }}></div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: "60px", textAlign: "center", color: "var(--text-dim)" }}>No matching records found in the {showAll ? 'archive' : 'recent ledger'}.</td></tr>
                            ) : filtered.map((b, idx) => (
                                <tr key={b.id} style={{ animation: "fadeIn 0.3s ease-out forwards", animationDelay: `${idx * 0.05}s`, opacity: 0 }}>
                                    <td style={{ fontWeight: "600", color: "var(--accent-primary)" }}>#{b.bill_no}</td>
                                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{new Date(b.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                    <td>{b.customer_name || <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>Guest Customer</span>}</td>
                                    <td style={{ fontWeight: "700" }}>₹{(b.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td>
                                        <span style={{
                                            background: b.payment_mode === 'Cash' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                            color: b.payment_mode === 'Cash' ? 'var(--accent-success)' : 'var(--accent-primary)',
                                            padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase"
                                        }}>
                                            {b.payment_mode || 'Cash'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            className="btn-secondary"
                                            style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "8px" }}
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
            
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
