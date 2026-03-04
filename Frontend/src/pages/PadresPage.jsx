import { useEffect, useMemo, useState } from "react";
import { api } from "../api";


const emptyForm = {
  id_padre: null,
  nombre: "",
  direccion: "",
  telefono: "",
  // Alumnos asignados se maneja por separado en selectedAlumnos
};

export default function PadresPage() {
  const [padres, setPadres] = useState([]);
  const [alumnos, setAlumnos] = useState([]); // Lista para asignar
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  //Para Buscar Estudiantes
  const [searchAlumno, setSearchAlumno] = useState("");

  const alumnosFiltrados = alumnos.filter((a) =>
    a.nombre_completo?.toLowerCase().includes(searchAlumno.toLowerCase())
  );

  // selectedAlumnos: { id_alumno: number, parentesco: string }
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Limpiar alertas automáticamente
  useEffect(() => {
    if (msg || err) {
      const timer = setTimeout(() => {
        setMsg("");
        setErr("");
      }, 4000); // desaparece a los 4 segundos
      return () => clearTimeout(timer);
    }
  }, [msg, err]);

  const isEditing = useMemo(() => Boolean(editing), [editing]);

  const backendBase = import.meta.env.VITE_API_BASE_URL;

  async function fetchData() {
    setLoading(true);
    setErr("");
    try {
      const [resPadres, resAlumnos] = await Promise.all([
        api.get("/padres"),
        api.get("/alumnos"),
      ]);

      setPadres(resPadres.data || []);
      setAlumnos(resAlumnos.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setSelectedAlumnos([]);
    setOpenForm(true);
  }

  function openEdit(padre) {
    setEditing(padre);
    setForm({
      id_padre: padre.id_padre ?? null,
      nombre: padre.nombre ?? "",
      direccion: padre.direccion ?? "",
      telefono: padre.telefono ?? "",
    });

    // Preparar selectedAlumnos desde la relación 'alumnos' que devuelve el backend
    const sel = (padre.alumnos || []).map((a) => ({
      id_alumno: a.id_alumno,
      parentesco: a.pivot?.parentesco ?? "",
    }));
    setSelectedAlumnos(sel);
    setOpenForm(true);
  }

  // Toggle selección de alumno en modal
  function toggleAlumnoSelection(id_alumno) {
    const exists = selectedAlumnos.find((s) => s.id_alumno === id_alumno);
    if (exists) {
      setSelectedAlumnos((prev) =>
        prev.filter((s) => s.id_alumno !== id_alumno)
      );
    } else {
      setSelectedAlumnos((prev) => [...prev, { id_alumno, parentesco: "" }]);
    }
  }

  // Cambiar parentesco de un alumno ya seleccionado
  function changeParentesco(id_alumno, value) {
    setSelectedAlumnos((prev) =>
      prev.map((s) =>
        s.id_alumno === id_alumno ? { ...s, parentesco: value } : s
      )
    );
  }

  // Comprobar si un alumno está seleccionado
  function isAlumnoSelected(id_alumno) {
    return selectedAlumnos.some((s) => s.id_alumno === id_alumno);
  }

  async function saveForm(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const payload = {
        nombre: form.nombre,
        direccion: form.direccion || null,
        telefono: form.telefono || null,
        alumnos: selectedAlumnos.map((s) => ({
          id_alumno: s.id_alumno,
          parentesco: s.parentesco || "Responsable",
        })),
      };

      if (isEditing) {
        await api.put(`/padres/${editing.id_padre}`, payload);
        setMsg("Padre actualizado ✅");
      } else {
        await api.post("/padres", payload);
        setMsg("Padre creado ✅");
      }

      setOpenForm(false);
      await fetchData();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  async function removePadre(id) {
    if (!confirm("¿Seguro que deseas eliminar este padre?")) return;

    try {
      await api.delete(`/padres/${id}`);
      setMsg("Padre eliminado ✅");
      await fetchData();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Padres / Responsables</h1>
          <p className="pageSubtitle">Gestioná los responsables y su vínculo con alumnos.</p>
        </div>

        <div className="pageActions">
          <button className="btnSoft" onClick={fetchData} disabled={loading}>
            {loading ? "Cargando..." : "Refrescar"}
          </button>
          <button
            className="btnPrimarySmall"
            onClick={() => openCreate()}
          >
            + Agregar
          </button>
        </div>
      </div>

      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert error">{err}</div>}

      <div className="card">
        <div className="cardHead">
          <div className="cardTitle">Listado de padres</div>
          <div className="cardHint">
            Total: <b>{padres.length}</b>
          </div>
        </div>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th style={{ width: 160 }}>Alumnos asignados</th>
                <th style={{ width: 170 }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {padres.length === 0 ? (
                <tr>
                  <td colSpan={6} className="tdEmpty">No hay registros.</td>
                </tr>
              ) : (
                padres.map((p) => (
                  <tr key={p.id_padre}>
                    <td className="mono">{p.id_padre}</td>
                    <td className="tdStrong">{p.nombre}</td>
                    <td>{p.direccion || "-"}</td>
                    <td>{p.telefono || "-"}</td>
                    <td>
                      {p.alumnos && p.alumnos.length > 0 ? (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {p.alumnos.map((a) => (
                            <div key={a.id_alumno} className="badgeAlumno">
                              <span>
                                {a.nombre_completo ?? `ID ${a.id_alumno}`}
                              </span>

                              <span className="badgeParentesco">
                                {a.pivot?.parentesco ?? "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="muted">Sin alumnos</span>
                      )}
                    </td>
                    <td>
                      <div className="rowActions">
                        <button className="btnRow" onClick={() => openEdit(p)}>Editar</button>
                        <button className="btnRow danger" onClick={() => removePadre(p.id_padre)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA PADRES */}
      {openForm && (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modalHead">
              <div>
                <div className="modalTitle">{isEditing ? "Editar padre" : "Crear padre"}</div>
                <div className="modalSub">Completá los datos y asigná alumnos responsables.</div>
              </div>

              <button className="iconClose" onClick={() => setOpenForm(false)} aria-label="Cerrar">✕</button>
            </div>

            <form className="modalBody" onSubmit={saveForm}>
              <div className="grid2">
                <div>
                  <label className="fieldLabel">Nombre</label>
                  <input
                    className="input"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="fieldLabel">Teléfono</label>
                  <input
                    className="input"
                    value={form.telefono}
                    onChange={(e) => {
                      const valor = e.target.value;
                      // solo permite números y un guion
                      if (/^[0-9-]*$/.test(valor) && valor.length <= 9) {
                        setForm({ ...form, telefono: valor });
                      }
                    }}
                    placeholder="0000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="fieldLabel">Dirección</label>
                <input
                  className="input"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
              </div>

              {/* ASIGNAR ALUMNOS */}
              <div className="asignarWrapper">
                <label className="fieldLabel white">Asignar alumnos</label>

                {/* Buscador */}
                <input
                  type="text"
                  placeholder="Buscar alumno por nombre..."
                  className="input searchInput"
                  value={searchAlumno}
                  onChange={(e) => setSearchAlumno(e.target.value)}
                />

                <div className="alumnosList">
                  {alumnosFiltrados.length === 0 ? (
                    <div className="mutedWhite">No se encontraron alumnos.</div>
                  ) : (
                    alumnosFiltrados.map((a) => {
                      const checked = isAlumnoSelected(a.id_alumno);
                      return (
                        <div key={a.id_alumno} className="alumnoItem">
                          <div className="alumnoLeft">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAlumnoSelection(a.id_alumno)}
                            />

                            <div>
                              <div className="alumnoNombre">
                                {a.nombre_completo || `ID ${a.id_alumno}`}
                              </div>
                              <div className="alumnoSub">
                                {a.email || a.telefono || ""}
                              </div>
                            </div>
                          </div>

                          {checked && (
                            <input
                              className="input parentescoInput"
                              placeholder="Ej: Hijo, Nieta..."
                              value={
                                selectedAlumnos.find(
                                  (s) => s.id_alumno === a.id_alumno
                                )?.parentesco || ""
                              }
                              onChange={(e) =>
                                changeParentesco(a.id_alumno, e.target.value)
                              }
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <p className="helperText">
                  Asigna los alumnos correspondientes e indica el parentesco con cada uno.
                </p>
              </div>

              <div className="modalActions">
                <button className="btnSoft" type="button" onClick={() => setOpenForm(false)}>Cancelar</button>
                <button className="btnPrimarySmall" type="submit">{isEditing ? "Guardar cambios" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}