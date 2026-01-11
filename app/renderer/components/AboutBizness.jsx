import React from "react";

export default function AboutBizness() {
    return (
        <div style={{ padding: "20px", color: "white", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ textAlign: "left", marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "10px", background: "var(--grad-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Help & Support
                </h1>
                <p style={{ color: "var(--text-dim)", fontSize: "16px" }}>Complete guidance and technical support for your POS system</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "40px" }}>
                {/* Contact Cards */}
                <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "15px", border: "1px solid rgba(0, 255, 136, 0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ fontSize: "30px" }}>💬</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "18px", color: "#00ff88" }}>WhatsApp Support</h3>
                            <p style={{ margin: "4px 0 0 0", color: "var(--text-dim)", fontSize: "12px" }}>Fastest response (under 5 mins)</p>
                        </div>
                    </div>
                    <a 
                        href="https://wa.me/918722744085" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                            padding: "12px", 
                            background: "rgba(37, 211, 102, 0.15)", 
                            border: "1px solid #25D366", 
                            borderRadius: "8px", 
                            color: "#25D366", 
                            fontWeight: "700", 
                            textAlign: "center",
                            textDecoration: "none"
                        }}
                    >
                        Chat on WhatsApp
                    </a>
                </div>

                <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "15px", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ fontSize: "30px" }}>📞</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "18px", color: "var(--accent-primary)" }}>Direct Call</h3>
                            <p style={{ margin: "4px 0 0 0", color: "var(--text-dim)", fontSize: "12px" }}>Mon - Sat, 9 AM - 6 PM</p>
                        </div>
                    </div>
                    <a 
                        href="tel:+916123109636" 
                        style={{ 
                            padding: "12px", 
                            background: "rgba(56, 189, 248, 0.15)", 
                            border: "1px solid #38bdf8", 
                            borderRadius: "8px", 
                            color: "#38bdf8", 
                            fontWeight: "700", 
                            textAlign: "center",
                            textDecoration: "none"
                        }}
                    >
                        +91 612 3109636
                    </a>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "25px" }}>
                <div className="glass-panel" style={{ padding: "30px" }}>
                    <h3 style={{ fontSize: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-primary)" }}>
                        <span>✨</span> Core Features
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                        {[
                            { icon: "🏪", title: "Table Sync", desc: "Live sync across 21 active table sessions." },
                            { icon: "🧾", title: "Thermal JPG", desc: "Auto-saves fiscal bills as high-quality JPGs." },
                            { icon: "📂", title: "Dynamic Catalog", desc: "Manage clusters, items, and multiple price variants." },
                            { icon: "👨‍🍳", title: "KOT Prints", desc: "Send Kitchen Order Tokens instantly to the kitchen." },
                            { icon: "📈", title: "Analytics", desc: "Visualize revenue, top items, and hourly trends." },
                            { icon: "👤", title: "Smart CRM", desc: "Track guest spending, visits, and last seen data." },
                            { icon: "🔢", title: "Custom Series", desc: "Start billing from any specific number (e.g. 501)." }
                        ].map((feat, i) => (
                            <div key={i} style={{ padding: "15px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ fontSize: "20px", marginBottom: "8px" }}>{feat.icon}</div>
                                <h4 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{feat.title}</h4>
                                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-dim)" }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: "30px", borderLeft: "4px solid #00ff88" }}>
                    <h3 style={{ fontSize: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>📖</span> How to Use (User Guide)
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {[
                            { step: "1", title: "Activate Table", text: "Select an active table (T-1 to T-21) from the top selector in the Billing page." },
                            { step: "2", title: "Add Inventory", text: "Choose a Cluster, then click '+' on products to add items to your Bill Manifest." },
                            { step: "3", title: "Send KOT", text: "Once items are added, click 'SEND KOT TO KITCHEN' to alert the chef." },
                            { step: "4", title: "Link Guest", text: "Use the 'Link Guest' search bar to search and attach an existing customer to the bill." },
                            { step: "5", title: "Finalize & Print", text: "Click 'PRINT FINAL BILL' to generate the receipt, save the JPG, and update guest spending stats." },
                            { step: "6", title: "Adjust Series", text: "Go to Settings → Bill Sequence to set a custom starting number for your invoices." }
                        ].map((guide, i) => (
                            <div key={i} style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                                <div style={{ minWidth: "24px", height: "24px", background: "#00ff88", color: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "12px" }}>{guide.step}</div>
                                <div>
                                    <h4 style={{ margin: "0 0 2px 0", fontSize: "14px" }}>{guide.title}</h4>
                                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{guide.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: "30px" }}>
                    <h3 style={{ fontSize: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>🚀</span> Our Services
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <h4 style={{ color: "var(--accent-primary)", margin: "0 0 8px 0" }}>Professional Websites</h4>
                            <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: 0 }}>Modern, SEO-optimized solutions to grow your online presence.</p>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <h4 style={{ color: "var(--accent-primary)", margin: "0 0 8px 0" }}>Mobile Applications</h4>
                            <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: 0 }}>High-performance Android & iOS apps with offline capabilities.</p>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <h4 style={{ color: "var(--accent-primary)", margin: "0 0 8px 0" }}>AI & Automation</h4>
                            <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: 0 }}>Smart WhatsApp bots and workflow automation to save time.</p>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <h4 style={{ color: "var(--accent-primary)", margin: "0 0 8px 0" }}>Software Solutions</h4>
                            <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: 0 }}>Tailored software for Retail, Healthcare, and Manufacturing.</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: "24px", textAlign: "left", background: "rgba(0, 255, 136, 0.05)" }}>
                    <p style={{ fontSize: "14px", color: "var(--text-main)", margin: "0 0 10px 0" }}>Developed & Maintained by</p>
                    <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#00ff88", margin: "0 0 5px 0" }}>BIZNES SOFTWARE</h2>
                    <a href="https://www.biznessoftware.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-dim)", fontSize: "12px", textDecoration: "none" }}>www.biznessoftware.com</a>
                </div>
            </div>

            <div style={{ marginTop: "30px", textAlign: "left", fontSize: "12px", color: "var(--text-dim)" }}>
                © 2026 Biznes Software. All rights reserved. | Bangalore, India
            </div>
        </div>
    );
}
