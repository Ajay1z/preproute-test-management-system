import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tests/create", label: "Create Test" }
];

const Sidebar = () => (
  <aside className="border-b border-slate-200 bg-white lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-r">
    <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:flex-col lg:px-4 lg:py-6">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${
              isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
