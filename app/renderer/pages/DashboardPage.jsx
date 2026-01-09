import { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

try {
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);
} catch (e) {
    console.error("Chart registration failed:", e);
}

export default function DashboardPage() {
    const [analyticsData, setAnalyticsData] = useState({ daily: {}, weekly: {}, monthly: {}, yearly: {} });
    const [activePeriod, setActivePeriod] = useState("daily");
    const [hourlySales, setHourlySales] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!window.api) {
                // Mock for browser
                setAnalyticsData({
                    daily: { count: 12, total_sales: 4500, cash_sales: 2000, upi_sales: 2500 },
                    weekly: { count: 80, total_sales: 32000, cash_sales: 15000, upi_sales: 17000 },
                    monthly: { count: 320, total_sales: 125000, cash_sales: 60000, upi_sales: 65000 },
                    yearly: { count: 320, total_sales: 125000, cash_sales: 60000, upi_sales: 65000 },
                });
                setLoading(false);
                return;
            }
            try {
                const [advStats, hourly, top] = await Promise.all([
                    window.api.getAdvancedAnalytics(),
                    window.api.getHourlySales(),
                    window.api.getTopSellingItems(5)
                ]);
                if (advStats) setAnalyticsData(advStats);
                setHourlySales(hourly || []);
                setTopItems(top || []);
            } catch (err) {
                console.error("Dashboard data load failed:", err);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    const currentStats = analyticsData[activePeriod] || {};

    const lineData = {
        labels: hourlySales.map(h => `${h.hour}:00`),
        datasets: [{
            label: 'Revenue',
            data: hourlySales.map(h => h.amount),
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#38bdf8'
        }]
    };

    return (
        <div style={{ padding: "8px" }}>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "2px" }}>Arctic Dashboard</h1>
                    <p style={{ color: "var(--text-dim)", fontSize: "12px" }}>Real-time business performance overview</p>
                </div>
                
                {/* Period Selector */}
                <div className="glass-panel" style={{ padding: "4px", borderRadius: "12px", display: "flex", gap: "4px", background: "rgba(15, 23, 42, 0.6)" }}>
                    {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
                        <button 
                            key={p}
                            onClick={() => setActivePeriod(p)}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "8px",
                                border: "none",
                                background: activePeriod === p ? "var(--grad-primary)" : "transparent",
                                color: activePeriod === p ? "white" : "var(--text-dim)",
                                fontSize: "12px",
                                fontWeight: "600",
                                textTransform: "capitalize",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid rgba(56, 189, 248, 0.1)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                        <div className="stat-card">
                            <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>Total Orders ({activePeriod})</span>
                            <div className="stat-value">{currentStats.count || 0}</div>
                            <div style={{ fontSize: "11px", color: "var(--accent-success)", display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ fontSize: "14px" }}>🛒</span> Volumetric
                            </div>
                        </div>
                        <div className="stat-card">
                            <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>Net Revenue ({activePeriod})</span>
                            <div className="stat-value">₹{(currentStats.total_sales || 0).toLocaleString()}</div>
                            <div style={{ fontSize: "11px", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ fontSize: "14px" }}>⚡</span> Gross Sales
                            </div>
                        </div>
                        <div className="stat-card">
                            <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>Cash Flow ({activePeriod})</span>
                            <div className="stat-value">₹{(currentStats.cash_sales || 0).toLocaleString()}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>In-hand currency</div>
                        </div>
                        <div className="stat-card">
                            <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>Digital Sales ({activePeriod})</span>
                            <div className="stat-value">₹{(currentStats.online_sales || currentStats.upi_sales || 0).toLocaleString()}</div>
                            <div style={{ fontSize: "11px", color: "var(--accent-secondary)" }}>UPI & Cards</div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className="glass-panel" style={{ padding: "16px" }}>
                            <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "600" }}>Revenue Trend</h3>
                            <div style={{ height: "320px" }}>
                                <Line data={lineData} options={{ 
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { 
                                        y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "var(--text-dim)", font: { family: 'Outfit', size: 10 } } },
                                        x: { grid: { display: false }, ticks: { color: "var(--text-dim)", font: { family: 'Outfit', size: 10 } } }
                                    }
                                }} />
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: "24px" }}>
                            <h2 style={{ fontSize: "18px", marginBottom: "24px" }}>Top Performance</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {topItems.length > 0 ? topItems.map((item, idx) => (
                                    <div key={idx} style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: "14px", 
                                        background: "rgba(255,255,255,0.02)", 
                                        padding: "14px", 
                                        borderRadius: "16px",
                                        border: "1px solid rgba(255,255,255,0.03)",
                                        animation: "fadeIn 0.4s ease-out forwards",
                                        animationDelay: `${idx * 0.1}s`,
                                        opacity: 0
                                    }}>
                                        <div style={{ 
                                            width: "36px", 
                                            height: "36px", 
                                            background: idx === 0 ? "var(--accent-primary)" : "rgba(56, 189, 248, 0.1)", 
                                            borderRadius: "10px", 
                                            display: "flex", 
                                            alignItems: "center", 
                                            justifyContent: "center", 
                                            fontWeight: "700", 
                                            color: idx === 0 ? "white" : "var(--accent-primary)",
                                            fontSize: "14px"
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{item.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{item.sold_count} units moved</div>
                                        </div>
                                        <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", position: "relative" }}>
                                            <div style={{ 
                                                position: "absolute", 
                                                left: 0, 
                                                top: 0, 
                                                height: "100%", 
                                                width: `${(item.sold_count / (topItems[0].sold_count || 1)) * 100}%`, 
                                                background: "var(--grad-primary)",
                                                borderRadius: "2px"
                                            }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)", fontSize: "13px" }}>No data points available</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
            `}</style>
        </div>
    );
}
