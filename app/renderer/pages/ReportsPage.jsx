import { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportsPage() {
    const [salesData, setSalesData] = useState([]);
    const [categorySales, setCategorySales] = useState([]);
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sales, cats] = await Promise.all([
                    window.api.getSalesData(period),
                    window.api.getCategorySales()
                ]);
                setSalesData(sales.reverse());
                setCategorySales(cats);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchData();
    }, [period]);

    const barData = {
        labels: salesData.map(d => d.date),
        datasets: [{
            label: 'Sales (₹)',
            data: salesData.map(d => d.amount),
            backgroundColor: 'rgba(14, 165, 233, 0.6)',
            borderColor: '#0ea5e9',
            borderWidth: 1
        }]
    };

    const catData = {
        labels: categorySales.map(d => d.category),
        datasets: [{
            label: 'Total Revenue (₹)',
            data: categorySales.map(d => d.amount),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: '#10b981',
            borderWidth: 1
        }]
    };

    return (
        <div style={{ padding: "24px", color: "var(--text-main)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px" }}>📊 Reports & Insights</h1>
                    <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0" }}>Detailed sales performance analysis</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                        onClick={() => setPeriod('daily')}
                        className={period === 'daily' ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: "8px 16px", fontSize: "12px" }}
                    >
                        Daily
                    </button>
                    <button 
                        onClick={() => setPeriod('monthly')}
                        className={period === 'monthly' ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: "8px 16px", fontSize: "12px" }}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
                <div className="glass-panel" style={{ padding: "20px" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "16px" }}>
                        {period === 'daily' ? 'Last 30 Days' : 'Last 12 Months'} Revenue
                    </h3>
                    <div style={{ height: "300px" }}>
                        {salesData.length > 0 ? (
                            <Bar data={barData} options={{ maintainAspectRatio: false }} />
                        ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                                No sales data available for this period.
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: "20px" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "16px" }}>Sales by Category</h3>
                    <div style={{ height: "300px" }}>
                        {categorySales.length > 0 ? (
                            <Bar data={catData} options={{ maintainAspectRatio: false, indexAxis: 'y' }} />
                        ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                                No category data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
