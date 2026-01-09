import { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
    const [stats, setStats] = useState({ count: 0, total_sales: 0, cash_sales: 0, upi_sales: 0 });
    const [hourlySales, setHourlySales] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [basicStats, hourly, top] = await Promise.all([
                    window.api.getDailyStats(),
                    window.api.getHourlySales(),
                    window.api.getTopSellingItems(5)
                ]);
                if (basicStats) setStats(basicStats);
                setHourlySales(hourly);
                setTopItems(top);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    const chartData = {
        labels: hourlySales.map(h => `${h.hour}:00`),
        datasets: [{
            label: 'Sales Today',
            data: hourlySales.map(h => h.amount),
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.2)',
            fill: true,
            tension: 0.4
        }]
    };

    const paymentData = {
        labels: ['Cash', 'UPI', 'Other'],
        datasets: [{
            data: [
                stats.cash_sales || 0, 
                stats.upi_sales || 0, 
                (stats.total_sales - (stats.cash_sales || 0) - (stats.upi_sales || 0)) || 0
            ],
            backgroundColor: ['#10b981', '#0ea5e9', '#f43f5e'],
            borderWidth: 0
        }]
    };

    return (
        <div style={{ padding: "24px", color: "var(--text-main)" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ margin: 0, fontSize: "24px" }}>📊 Analytics Dashboard</h1>
                <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>Business overview and sales trends</p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Today's Sales", val: `₹${(stats.total_sales || 0).toFixed(2)}`, color: "#0ea5e9", icon: "💰" },
                    { label: "Bills Generated", val: stats.count || 0, color: "#10b981", icon: "🧾" },
                    { label: "Avg Bill Value", val: `₹${(stats.total_sales / (stats.count || 1)).toFixed(2)}`, color: "#f59e0b", icon: "📈" },
                    { label: "Active Counter", val: "Main", color: "#8b5cf6", icon: "🏪" }
                ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ fontSize: "32px" }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.label}</div>
                            <div style={{ fontSize: "20px", fontWeight: "bold", color: s.color }}>{s.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                <div className="glass-panel" style={{ padding: "20px" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "16px" }}>Hourly Sales Trend</h3>
                    <div style={{ height: "300px" }}>
                        <Line data={chartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: "20px" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "16px" }}>Payment Split</h3>
                    <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={paymentData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: "20px", marginTop: "24px" }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "16px" }}>Top Selling Items</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
                    {topItems.length > 0 ? topItems.map((item, i) => (
                        <div key={i} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{item.name}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.sold_count} sold</div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>No items sold yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
