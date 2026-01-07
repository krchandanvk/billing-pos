import { useState } from "react";
import { menu } from "../data/menu";
import BillSummary from "../components/BillSummary";

export default function BillingPage() {
  const [cart, setCart] = useState([]);

  const addItem = (item) => {
    setCart([...cart, item]);
  };

  return (
    <div className="page">
      <h2>Billing</h2>

      {menu.map((cat) => (
        <div key={cat.category}>
          <h3>{cat.category}</h3>
          {cat.items.map((item) => (
            <button key={item.name} onClick={() => addItem(item)}>
              {item.name} ₹{item.price}
            </button>
          ))}
        </div>
      ))}

      <BillSummary cart={cart} />
    </div>
  );
}
