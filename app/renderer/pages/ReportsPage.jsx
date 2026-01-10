import { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

try {
    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
} catch (e) {
    console.error("Chart registration failed:", e);
}

export default function ReportsPage() {
    const [salesData, setSalesData] = useState([]);
    const [categorySales, setCategorySales] = useState([]);
    const [period, setPeriod] = useState('daily');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!window.api) {
                setSalesData([
                    { date: "2024-01-01", amount: 1200 }, { date: "2024-01-02", amount: 1500 },
                    { date: "2024-01-03", amount: 1100 }, { date: "2024-01-04", amount: 1900 }
                ]);
                setCategorySales([
                    { category: "Chinese", amount: 5000 },
                    { category: "South Indian", amount: 3000 },
                    { category: "Snacks", amount: 1500 }
                ]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [sales, cats] = await Promise.all([
                    window.api.getSalesData(period),
                    window.api.getCategorySales()
                ]);
                setSalesData((sales || []).reverse());
                setCategorySales(cats || []);
            } catch (err) {
                console.error("Reports data load failed:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [period]);

    const barData = {
        labels: salesData.map(d => d.date),
        datasets: [{
            label: 'Revenue',
            data: salesData.map(d => d.amount),
            backgroundColor: 'rgba(56, 189, 248, 0.4)',
            hoverBackgroundColor: '#38bdf8',
            borderRadius: 6,
            borderSkipped: false
        }]
    };

    const catData = {
        labels: categorySales.map(d => d.category),
        datasets: [{
            label: 'Revenue',
            data: categorySales.map(d => d.amount),
            backgroundColor: 'rgba(34, 211, 238, 0.4)',
            hoverBackgroundColor: '#22d3ee',
            borderRadius: 6,
            borderSkipped: false
        }]
    };

    return (
        <div style={{ padding: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px", marginBottom: "24px" }}>
                <div style={{ textAlign: "left" }}>
                    <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "2px" }}>Business Intelligence</h1>
                    <p style={{ color: "var(--text-dim)", fontSize: "12px" }}>Deep dive into sales and category trends</p>
                </div>
                <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-glass)", justifyContent: "flex-start" }}>
                    <button 
                        onClick={() => setPeriod('daily')}
                        style={{ 
                            padding: "6px 16px", 
                            fontSize: "12px", 
                            borderRadius: "6px",
                            background: period === 'daily' ? 'var(--grad-primary)' : 'transparent',
                            color: period === 'daily' ? 'white' : 'var(--text-muted)',
                            justifyContent: "center"
                        }}
                    >
                        Daily
                    </button>
                    <button 
                        onClick={() => setPeriod('monthly')}
                        style={{ 
                            padding: "6px 16px", 
                            fontSize: "12px", 
                            borderRadius: "6px",
                            background: period === 'monthly' ? 'var(--grad-primary)' : 'transparent',
                            color: period === 'monthly' ? 'white' : 'var(--text-muted)',
                            justifyContent: "center"
                        }}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                <div className="glass-panel" style={{ padding: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "15px", margin: 0, textAlign: "left" }}>
                            {period === 'daily' ? '30-Day Performance' : '12-Month Performance'}
                        </h3>
                        <div style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "left" }}>
                            Avg: <span style={{ color: "var(--text-main)", fontWeight: "600" }}>₹{(salesData.reduce((a, b) => a + b.amount, 0) / (salesData.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                    
                    <div style={{ height: "350px" }}>
                        {loading ? (
                             <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                                <div style={{ width: "30px", height: "30px", border: "2px solid rgba(56, 189, 248, 0.1)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                            </div>
                        ) : salesData.length > 0 ? (
                            <Bar 
                                data={barData} 
                                options={{ 
                                    maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { display: false },
                                        tooltip: { enabled: true }
                                    },
                                    scales: { 
                                        y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "var(--text-dim)", font: { family: 'Outfit', size: 10 } } },
                                        x: { grid: { display: false }, ticks: { color: "var(--text-dim)", font: { family: 'Outfit', size: 10 } } }
                                    }
                                }} 
                                plugins={[{
                                    id: 'valueLabel',
                                    afterDatasetsDraw(chart) {
                                        const { ctx, data } = chart;
                                        ctx.save();
                                        data.datasets.forEach((dataset, i) => {
                                            const meta = chart.getDatasetMeta(i);
                                            meta.data.forEach((bar, index) => {
                                                const value = dataset.data[index];
                                                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                                                ctx.font = 'bold 10px Outfit';
                                                ctx.textAlign = 'center';
                                                ctx.fillText(`₹${value}`, bar.x, bar.y - 10);
                                            });
                                        });
                                        ctx.restore();
                                    }
                                }]}
                            />
                        ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-start", color: "var(--text-dim)", fontSize: "14px", textAlign: "left" }}>
                                No transactions recorded for this period.
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: "15px", marginBottom: "20px", margin: 0 }}>Categorical Revenue Distribution</h3>
                    <div style={{ height: "400px" }}>
                        {loading ? (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: "30px", height: "30px", border: "2px solid rgba(56, 189, 248, 0.1)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                            </div>
                        ) : categorySales.length > 0 ? (
                            <Bar 
                                data={catData} 
                                options={{ 
                                    maintainAspectRatio: false, 
                                    indexAxis: 'y',
                                    plugins: { 
                                        legend: { display: false }
                                    },
                                    scales: { 
                                        x: { 
                                            grid: { color: "rgba(255,255,255,0.03)" }, 
                                            ticks: { color: "var(--text-dim)", font: { family: 'Outfit', size: 10 } },
                                            suggestedMax: Math.max(...categorySales.map(d => d.amount)) * 1.2
                                        },
                                        y: { grid: { display: false }, ticks: { color: "var(--text-main)", font: { family: 'Outfit', size: 11, weight: '500' } } }
                                    }
                                }}
                                plugins={[{
                                    id: 'catValueLabel',
                                    afterDatasetsDraw(chart) {
                                        const { ctx, data } = chart;
                                        ctx.save();
                                        data.datasets.forEach((dataset, i) => {
                                            const meta = chart.getDatasetMeta(i);
                                            meta.data.forEach((bar, index) => {
                                                const value = dataset.data[index];
                                                const label = data.labels[index];
                                                
                                                // Draw Text
                                                ctx.fillStyle = '#ffffff';
                                                ctx.font = 'bold 12px Outfit';
                                                ctx.textAlign = 'left';
                                                // Position text slightly inside the start of the bar for consistent look
                                                ctx.fillText(`${label} - ₹${value.toLocaleString()}`, 25, bar.y + 5);
                                            });
                                        });
                                        ctx.restore();
                                    }
                                }]}
                            />
                        ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "14px" }}>
                                Waiting for category data...
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
