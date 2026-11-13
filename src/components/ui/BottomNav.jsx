import { NavLink } from "react-router-dom"

// Vaste tabbalk onderaan, alleen op smalle schermen (vanaf md staan de links in de TopBar)
export default function BottomNav({ label, children }) {
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-page pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto flex h-[var(--height-bottom-nav)] max-w-md">{children}</div>
    </nav>
  )
}

// Actieve tab krijgt het blauwe accent (geselecteerde navigatie)
export function BottomNavLink({ to, end, icon, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold transition " +
        (isActive ? "text-link" : "text-muted hover:text-ink")
      }
    >
      {icon}
      {children}
    </NavLink>
  )
}
