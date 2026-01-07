export default function Header({ onNavigate }) {
    return (
        <div style={styles.header}>
            <div style={styles.logo}>
                ✅ <b>Bizness Billing POS</b>
            </div>

            <div style={styles.nav}>
                <button onClick={() => onNavigate("billing")}>Billing</button>
                <button onClick={() => onNavigate("menu")}>Menu</button>
                <button onClick={() => onNavigate("reports")}>Reports</button>
            </div>
        </div>
    );
}

const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid #ccc",
        background: "#f9f9f9",
    },
    logo: {
        fontSize: 18,
    },
    nav: {
        display: "flex",
        gap: 10,
    },
};
