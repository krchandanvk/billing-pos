import React, { useState, useEffect } from "react";

export default function SettingsPage() {
    const [status, setStatus] = useState("");
    const [startingNo, setStartingNo] = useState("");

    useEffect(() => {
        const fetchOffset = async () => {
            if (window.api?.getBillOffset) {
                const offset = await window.api.getBillOffset();
                setStartingNo(offset.toString());
            }
        };
        fetchOffset();
    }, []);

    const handleBackup = async () => {
        setStatus("Creating backup...");
        if (window.api) {
            const res = await window.api.backupData();
            if (res.success) {
                setStatus(`✅ Backup created at: ${res.path}`);
            } else {
                setStatus(`❌ Error: ${res.error}`);
            }
        }
    };

    const handleExport = async () => {
        if (window.api) {
            const res = await window.api.exportSalesCSV();
            if (res.success) {
                setStatus(`✅ Export saved to: ${res.path}`);
            } else if (res.error) {
                setStatus(`❌ Error: ${res.error}`);
            }
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px" }}>System Management</h1>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ fontSize: "32px" }}>💾</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>Backup Data</h3>
                            <p style={{ margin: "5px 0 0 0", color: "var(--text-dim)", fontSize: "12px" }}>
                                Secure your business data. Creates a copy of your database and invoices.
                            </p>
                        </div>
                    </div>
                    <button onClick={handleBackup} style={{ padding: "12px", background: "var(--grad-primary)", border: "none", borderRadius: "8px", color: "white", fontWeight: "600", cursor: "pointer", display: "flex", justifyContent: "flex-start" }}>
                        Create Backup Now
                    </button>
                </div>

                <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ fontSize: "32px" }}>📊</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>Export Sales Data</h3>
                            <p style={{ margin: "5px 0 0 0", color: "var(--text-dim)", fontSize: "12px" }}>
                                Download complete sales history as CSV for Excel/Numbers.
                            </p>
                        </div>
                    </div>
                    <button onClick={handleExport} style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-main)", fontWeight: "600", cursor: "pointer", display: "flex", justifyContent: "flex-start" }}>
                        Export to CSV
                    </button>
                </div>

                {/* Starting Bill Number Setting */}
                <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ fontSize: "32px" }}>🔢</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>Bill Sequence</h3>
                            <p style={{ margin: "5px 0 0 0", color: "var(--text-dim)", fontSize: "12px" }}>
                                Set the number to start billing from (e.g., 501).
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <input 
                            type="number" 
                            placeholder="e.g. 101" 
                            id="startingBillInput"
                            key={startingNo}
                            defaultValue={startingNo}
                            style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} 
                        />
                        <button 
                            onClick={async () => {
                                const val = document.getElementById('startingBillInput').value;
                                if (val && window.api?.setBillOffset) {
                                    await window.api.setBillOffset(val);
                                    setStatus(`✅ Next bill will start from: ${val}`);
                                }
                            }}
                            className="btn-primary" 
                            style={{ padding: "8px 16px" }}
                        >
                            Set Starting No.
                        </button>
                    </div>
                </div>
            </div>

            {status && (
                <div style={{ marginTop: "30px", padding: "15px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "var(--accent-primary)", fontFamily: "monospace" }}>
                    {status}
                </div>
            )}

            <div style={{ marginTop: "40px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>Data Location</h3>
                <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "15px" }}>
                    <div>
                        <div style={{ fontSize: "12px", color: "var(--text-dim)", textAlign: "left" }}>Backups Folder</div>
                        <div style={{ fontSize: "14px", fontWeight: "600", textAlign: "left" }}>Documents / BillingBackups</div>
                    </div>
                    <button onClick={() => window.api?.openDataFolder()} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "6px", color: "white", cursor: "pointer", display: "flex", justifyContent: "flex-start" }}>
                        Open Folder
                    </button>
                </div>
            </div>


        </div>
    );
}
