import { useEffect, useState } from "react";
import { api } from "../api";
import MapPicker from "../components/MapPicker";

export default function DashboardPage() {
  const [schools, setSchools] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const backendBase = import.meta.env.VITE_API_BASE_URL;

  async function fetchData() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/dashboard-data"); //Endpoint
      setSchools(res.data.schools || []);
      setAlumnos(res.data.alumnos || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Si hay escuelas/alumnos, centramos el mapa
  const firstLocation =
    schools[0] || alumnos[0] || { latitud: 13.700, longitud: -88.780 };

  const mapCenter = [Number(firstLocation.latitud), Number(firstLocation.longitud)];

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Dashboard</h1>
          <p className="pageSubtitle">Mapa de escuelas y alumnos</p>
        </div>
        <div className="pageActions">
          <button className="btnSoft" onClick={fetchData} disabled={loading}>
            {loading ? "Cargando..." : "Refrescar"}
          </button>
        </div>
      </div>

      {err && <div className="alert error">{err}</div>}

      <div className="card" style={{ padding: 10 }}>
        <MapPicker
          center={mapCenter}
          zoom={12}
          markers={[
            ...schools.map((s) => ({
              position: { lat: Number(s.latitud), lng: Number(s.longitud) },
              label: `Escuela: ${s.nombre}`,
              iconColor: "blue",
            })),
            ...alumnos.map((a) => {
              // Buscar la escuela del alumno
              const escuela = schools.find((s) => s.id_school === a.id_school);
              return {
                position: { lat: Number(a.latitud), lng: Number(a.longitud) },
                label: `Alumno: ${a.nombre_completo}${escuela ? ` | Escuela: ${escuela.nombre}` : ""}`,
                iconColor: "red",
              };
            }),
          ]}
          height={500}
        />
      </div>
    </div>
  );
}