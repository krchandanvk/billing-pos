export default function BillSummary({ cart }) {
  const total = cart.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="bill">
      <h3>Bill Summary</h3>

      {cart.map((i, idx) => (
        <div key={idx}>
          {i.name} — ₹{i.price}
        </div>
      ))}

      <hr />
      <b>Total: ₹{total}</b>
    </div>
  );
}
