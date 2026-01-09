import { useState } from "react";
import BillingPage from "./pages/BillingPage";
import CustomerPage from "./pages/CustomerPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";
import MenuPage from "./pages/MenuPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AboutBizness from "./components/AboutBizness";
import hotelLogo from "./assets/hotel_logo.png";

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
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "help", label: "Help", icon: "❓" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "billing": return <BillingPage />;
      case "menu": return <MenuPage />;
      case "history": return <HistoryPage />;
      case "customers": return <CustomerPage />;
      case "analytics": return <DashboardPage />;
      case "reports": return <ReportsPage />;
      case "settings": return <SettingsPage />;
      case "help": return <AboutBizness />;
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
      {/* Sidebar Navigation */}
      <div className="glass-panel" style={{ width: "200px", borderRadius: "0", borderTop: "none", borderLeft: "none", borderBottom: "none", display: "flex", flexDirection: "column", padding: "20px 0", background: "rgba(15, 23, 42, 0.4)" }}>
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px", marginBottom: "24px", textAlign: "left" }}>
          <img src={hotelLogo} alt="Logo" style={{ width: "60px", height: "60px", objectFit: "contain", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px", lineHeight: "1.2" }}>Kallo's Tandon</h1>
            <p style={{ margin: "5px 0 0 0", fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "700" }}>Veg Restaurant</p>
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
                padding: "12px 20px",
                fontSize: "13px",
                fontWeight: activeTab === item.id ? "600" : "400",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "12px",
                transition: "var(--transition-base)"
              }}
            >
              <div style={{ width: "24px", display: "flex", justifyContent: "flex-start", opacity: activeTab === item.id ? 1 : 0.6 }}>
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
              </div>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid var(--border-glass)" }}>
          <div style={{ 
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: "12px", 
              padding: "12px", 
              backdropFilter: "blur(5px)"
          }}>
              <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", fontWeight: "900", marginBottom: "3px" }}>DEVELOPED BY</div>
              <a 
                  href="https://www.biznessoftware.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                      fontSize: "11px", 
                      color: "#00ff88", 
                      fontWeight: "900", 
                      marginBottom: "6px",
                      textDecoration: "none",
                      cursor: "pointer",
                      display: "block",
                      transition: "var(--transition-base)"
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.target.style.textDecoration = "none"}
              >BIZNES SOFTWARE</a>
              
              <div style={{ fontSize: "10px", color: "#00ff88", fontWeight: "900", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "10px" }}>💬</span> 8722744085
              </div>

              <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "8px 0" }}></div>

              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", fontWeight: "800" }}>
                  VERSION <span style={{ color: "#ffff00" }}>v4.2 PRO</span>
              </div>
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
