import { useState } from "react";
import BillingPage from "./pages/BillingPage";
import CustomerPage from "./pages/CustomerPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";
import MenuPage from "./pages/MenuPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("billing");

  // Safety check for browser mode
  const isElectron = window.api !== undefined;
  console.log("App initializing... isElectron:", isElectron);

  const menuItems = [
    { id: "billing", label: "Billing", icon: "🛒" },
    { id: "menu", label: "Menu", icon: "📋" },
    { id: "history", label: "History", icon: "📚" },
    { id: "customers", label: "Customers", icon: "👤" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "reports", label: "Reports", icon: "📈" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "billing": return <BillingPage />;
      case "menu": return <MenuPage />;
      case "history": return <HistoryPage />;
      case "customers": return <CustomerPage />;
      case "analytics": return <DashboardPage />;
      case "reports": return <ReportsPage />;
      default: return <BillingPage />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-app)" }}>
      {!isElectron && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "var(--accent-danger)", color: "white", padding: "8px", textAlign: "center", zIndex: 9999, fontSize: "12px", fontWeight: "600", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          ⚠️ Running in Browser Mode. Database features will not work. Please open the Desktop App.
        </div>
      )}
      
      {/* Sidebar Navigation */}
      <div className="glass-panel" style={{ width: "200px", borderRadius: "0", borderTop: "none", borderLeft: "none", borderBottom: "none", display: "flex", flexDirection: "column", padding: "20px 0", background: "rgba(15, 23, 42, 0.4)" }}>
        <div style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ width: "36px", height: "36px", background: "var(--grad-primary)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "var(--shadow-glow)" }}>🏪</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text-main)", letterSpacing: "-0.5px" }}>Veg Restaurant</h1>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>Pure Veg POS</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              style={{
                width: "100%",
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: activeTab === item.id ? "600" : "400",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "var(--transition-base)"
              }}
            >
              <span style={{ fontSize: "18px", opacity: activeTab === item.id ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid var(--border-glass)" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-glass)" }}>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--text-dim)", fontWeight: "500" }}>VERSION</p>
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--accent-primary)", fontWeight: "600" }}>v2.4.0 Arctic</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, height: "100vh", overflowY: "hidden", position: "relative" }}>
        <div className="page-container" style={{ height: "100%", padding: "12px", overflowY: "auto" }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
