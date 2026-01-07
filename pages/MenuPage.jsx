import { menu } from "../data/menu";

export default function MenuPage() {
  return (
    <div className="page">
      <h2>Menu Management</h2>

      {menu.map((cat) => (
        <div key={cat.category}>
          <h3>{cat.category}</h3>
          <ul>
            {cat.items.map((i) => (
              <li key={i.name}>
                {i.name} — ₹{i.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
