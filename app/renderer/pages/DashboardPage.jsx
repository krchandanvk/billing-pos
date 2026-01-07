import { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
    const [stats, setStats] = useState({ count: 0, total_sales: 0, cash_sales: 0, upi_sales: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await window.api.getDailyStats();
                if (data) setStats(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    const chartData = {
        labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
        datasets: [{
            label: 'Sales Trend',
            data: [0, 450, 1200, 800, 2500, 1800], // Mock for now, would pull from DB group by hour
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.2)',
            fill: true,
            tension: 0.4
        }]
    };

    const paymentData = {
        labels: ['Cash', 'UPI', 'Card'],
        datasets: [{
            data: [stats.cash_sales || 0, stats.upi_sales || 0, (stats.total_sales - stats.cash_sales - stats.upi_sales) || 0],
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
                <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "16px" }}>Top Selling Items (Mock)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
                    {["Paneer Tikka", "Roti", "Dal Makhani", "Chilli Potato", "Chicken Roll"].map((item, i) => (
                        <div key={i} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{item}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{20 - i * 3} sold today</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
