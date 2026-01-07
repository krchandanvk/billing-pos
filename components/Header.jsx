export default function Header({ setPage }) {
  return (
    <nav className="nav">
      <button onClick={() => setPage("billing")}>Billing</button>
      <button onClick={() => setPage("menu")}>Menu</button>
      <button onClick={() => setPage("reports")}>Reports</button>
    </nav>
  );
}
