import { menuData } from "../data/menu";

export default function MenuPage() {
    return (
        <div>
            <h2>📋 Menu Management</h2>

            {menuData.map((cat) => (
                <div key={cat.category} style={styles.category}>
                    <h3>{cat.category}</h3>

                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th align="left">Item</th>
                                <th>Price (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cat.items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td align="center">{item.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

const styles = {
    category: {
        marginBottom: 30,
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
};
