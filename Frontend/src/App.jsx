import { useMemo, useState } from "react";
import { api, setBasicAuth } from "./api";
import Layout from "./components/Layout";
import SchoolsPage from "./pages/SchoolsPage";
import AlumnosPage from "./pages/AlumnosPage";
import PadresPage from "./pages/PadresPage"; //Importamos la página de Padres
import DashboardPage from "./pages/DashboardPage"; //NUEVO
import ReportesPage from "./pages/ReportesPage";


export default function App() {
  const [auth, setAuth] = useState({
    isAuth: false,
    username: "admin",
    password: "1234",
    user: null,
  });

  const [ui, setUi] = useState({ loading: false, error: "" });
  const [view, setView] = useState("dashboard");

  const roleLabel = useMemo(() => auth.user?.tipo || "Usuario", [auth.user]);

  //Login usando Basic Auth directamente a /me
  async function handleLogin(e) {
    e.preventDefault();
    setUi({ loading: true, error: "" });

    try {
      //Setea las credenciales Basic Auth en axios
      setBasicAuth(auth.username, auth.password);

      //Hacemos GET a /me (ya protege con basic.auth)
      const me = await api.get("/me");

      setAuth((p) => ({
        ...p,
        isAuth: true,
        user: me.data.user,
      }));

      setUi({ loading: false, error: "" });
    } catch (err) {
      setAuth((p) => ({ ...p, isAuth: false, user: null }));
      setUi({
        loading: false,
        error: err?.response?.data?.message || "Credenciales inválidas",
      });
    }
  }

  function handleLogout() {
    setAuth({ isAuth: false, username: "", password: "", user: null });
    setUi({ loading: false, error: "" });
    setView("dashboard");
  }

  
  // LOGIN
  if (!auth.isAuth) {
    return (
      <div className="loginScene">
        <div className="loginCard">
          <div className="loginTop">
            <div className="loginBrand">
              <div className="loginBrandIcon">🏫</div>
              <div>
                <div className="loginBrandTitle">Sistema de Escuelas</div>
                <div className="loginBrandSub">Panel administrativo</div>
              </div>
            </div>
            <span className="loginChip">SECURE</span>
          </div>

          <h1 className="loginTitle">Bienvenido</h1>
          <p className="loginSubtitle">
            Iniciá sesión para gestionar <b>escuelas</b> y <b>alumnos</b>.
          </p>

          <form className="loginForm" onSubmit={handleLogin}>
            <label className="fieldLabel">Usuario</label>
            <div className="fieldInput">
              <span className="fieldIcon">👤</span>
              <input
                value={auth.username}
                onChange={(e) =>
                  setAuth((p) => ({ ...p, username: e.target.value }))
                }
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <label className="fieldLabel">Contraseña</label>
            <div className="fieldInput">
              <span className="fieldIcon">🔒</span>
              <input
                type="password"
                value={auth.password}
                onChange={(e) =>
                  setAuth((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {ui.error && <div className="loginAlert">{ui.error}</div>}

            <button className="loginBtn" type="submit" disabled={ui.loading}>
              {ui.loading ? "Entrando..." : "Entrar"}
              <span className="loginBtnArrow">→</span>
            </button>

            <div className="loginFooter">
              <span className="liveDot" />
              Backend: <b>http://127.0.0.1:8000</b>
            </div>
          </form>
        </div>
      </div>
    );
  }

  
  // PANEL PRINCIPAL
  return (
    <Layout
      userLabel={auth.user?.nombre || auth.username}
      roleLabel={roleLabel}
      onLogout={handleLogout}
      view={view}
      onNavigate={setView}
    >
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <button
          className={view === "dashboard" ? "btnPrimarySmall" : "btnSoft"}
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={view === "schools" ? "btnPrimarySmall" : "btnSoft"}
          onClick={() => setView("schools")}
        >
          Escuelas
        </button>

        <button
          className={view === "alumnos" ? "btnPrimarySmall" : "btnSoft"}
          onClick={() => setView("alumnos")}
        >
          Alumnos
        </button>
        <button
          className={view === "reportes" ? "btnPrimarySmall" : "btnSoft"}
          onClick={() => setView("reportes")}
        >
          Reportes
        </button>
      </div>
      {view === "dashboard" && <DashboardPage />}
      {view === "schools" && <SchoolsPage user={auth.user} />} 
      {view === "padres" && <PadresPage />}
      {view === "alumnos" && <AlumnosPage />}
      {view === "reportes" && <ReportesPage />}
  
    </Layout>
  );
}