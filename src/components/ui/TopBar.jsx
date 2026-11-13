import { Link, NavLink } from "react-router-dom"
import Logo from "./Logo"

// children = navigatielinks (TopBarLink, verborgen op mobiel → gebruik BottomNav), actions = knoppen rechts
export default function TopBar({ logoTo = "/", children, actions }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-page">
      <div className="mx-auto flex min-h-16 w-full max-w-shell items-center gap-6 px-4 sm:px-6">
        <Link to={logoTo} className="no-underline">
          <Logo />
        </Link>
        {children && (
          <nav className="ml-auto hidden items-center gap-5 md:flex">{children}</nav>
        )}
        {actions && (
          <div className={`ml-auto flex items-center gap-3 ${children ? "md:ml-0" : ""}`}>{actions}</div>
        )}
      </div>
    </header>
  )
}

// Actieve pagina krijgt het blauwe accent (geselecteerde navigatie)
export function TopBarLink({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "whitespace-nowrap text-sm font-bold transition " +
        (isActive ? "text-link" : "text-muted hover:text-ink")
      }
    >
      {children}
    </NavLink>
  )
}
