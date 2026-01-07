import { useState } from "react";
import brandLogo from "./assets/brand_logo.png";
import BillingPage from "./pages/BillingPage";
import CustomerPage from "./pages/CustomerPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("billing");

  const menuItems = [
    { id: "billing", label: "Billing", icon: "🛒" },
    { id: "history", label: "History", icon: "📚" },
    { id: "customers", label: "Customers", icon: "👤" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "billing": return <BillingPage />;
      case "history": return <HistoryPage />;
      case "customers": return <CustomerPage />;
      case "analytics": return <DashboardPage />;
      default: return <BillingPage />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar Navigation */}
      <div className="glass-panel" style={{ width: "220px", borderRadius: "0 20px 20px 0", borderLeft: "none", display: "flex", flexDirection: "column", padding: "20px 0" }}>
        <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
          <img src={brandLogo} alt="Logo" style={{ height: "40px" }} />
          <h1 style={{ margin: 0, fontSize: "20px", color: "var(--accent-primary)", letterSpacing: "1px" }}>POS</h1>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: "100%",
                padding: "16px 24px",
                textAlign: "left",
                background: activeTab === item.id ? "rgba(14, 165, 233, 0.15)" : "transparent",
                border: "none",
                borderLeft: activeTab === item.id ? "4px solid var(--accent-primary)" : "4px solid transparent",
                color: activeTab === item.id ? "var(--text-main)" : "var(--text-muted)",
                fontSize: "15px",
                fontWeight: activeTab === item.id ? "600" : "400",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              className="nav-item"
            >
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "20px", fontSize: "11px", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          &copy; 2026 Bizness Software<br />Offline POS v1.0
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, height: "100vh", overflowY: "auto", background: "rgba(0,0,0,0.1)" }}>
        {renderContent()}
      </main>
    </div>
  );
}
