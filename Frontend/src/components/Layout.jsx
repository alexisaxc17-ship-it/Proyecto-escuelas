export default function Layout({
  children,
  userLabel,
  roleLabel,
  onLogout,
  view,
  onNavigate,
}) {
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandLogo">🏫</div>
          <div className="brandText">
            <div className="brandTitle">Sistema</div>
            <div className="brandSub">Centro educativo</div>
          </div>
        </div>

        <nav className="nav">
          <button
            className={`navItem ${view === "dashboard" ? "active" : ""}`}
            onClick={() => onNavigate("dashboard")}
          >
            <span className="navDot" /> Dashboard
          </button>

          <button
            className={`navItem ${view === "schools" ? "active" : ""}`}
            onClick={() => onNavigate("schools")}
          >
            <span className="navDot" /> Escuelas
          </button>

          <button
            className={`navItem ${view === "padres" ? "active" : ""}`}
            onClick={() => onNavigate("padres")}
          >
            <span className="navDot" /> Padres
          </button>

          <button
            className={`navItem ${view === "alumnos" ? "active" : ""}`}
            onClick={() => onNavigate("alumnos")}
          >
            <span className="navDot" /> Alumnos
          </button>

          <button
            className={`navItem ${view === "reportes" ? "active" : ""}`}
            onClick={() => onNavigate("reportes")}
          >
            <span className="navDot" /> Reportes
          </button>
        </nav>

        {/* 🔥 SOLO BOTÓN SALIR */}
        <div className="sidebarFooter">
          <button className="btnGhost" onClick={onLogout}>
            Salir
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumbs">
            <span className="crumbMuted">Panel</span>
            <span className="crumbSep">/</span>
            <b>
              {view === "schools" && "Escuelas"}
              {view === "alumnos" && "Alumnos"}
              {view === "padres" && "Padres"}
              {view === "dashboard" && "Dashboard"}
              {view === "reportes" && "Reportes"}
            </b>
          </div>

          {/* 🔥 ADMIN ARRIBA DERECHA */}
          <div className="adminTopBox">
            <div className="adminAvatar">
              {(userLabel || "U").slice(0, 1).toUpperCase()}
            </div>

            <div className="adminText">
              <div className="adminName">
                {userLabel || "Usuario"}
              </div>
              <div className="adminRole">
                {roleLabel || "Rol"}
              </div>
            </div>
          </div>
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}