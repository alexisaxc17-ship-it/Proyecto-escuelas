import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import MapPicker from "../components/MapPicker";

const emptyForm = {
  id_alumno: null,
  nombre_completo: "",
  direccion: "",
  telefono: "",
  email: "",
  foto: "", // ruta guardada (alumnos/xxx.jpg) o ""
  genero: "",
  latitud: "",
  longitud: "",
  id_grado: "",
  id_seccion: "",
  id_school: "",
};

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fotoFile, setFotoFile] = useState(null);

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
      const [resAlumnos, resSchools] = await Promise.all([
        api.get("/alumnos"),
        api.get("/schools"),
      ]);

      setAlumnos(resAlumnos.data || []);
      setSchools(resSchools.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFotoFile(null);
    setOpenForm(true);
  }

  function openEdit(a) {
    setEditing(a);
    setForm({
      id_alumno: a.id_alumno ?? null,
      nombre_completo: a.nombre_completo ?? "",
      direccion: a.direccion ?? "",
      telefono: a.telefono ?? "",
      email: a.email ?? "",
      foto: a.foto ?? "",
      genero: a.genero ?? "",
      latitud: a.latitud ?? "",
      longitud: a.longitud ?? "",
      id_grado: a.id_grado ?? "",
      id_seccion: a.id_seccion ?? "",
      id_school: a.id_school ?? "",
    });
    setFotoFile(null);
    setOpenForm(true);
  }

  async function saveForm(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      // Si hay archivo => multipart/form-data (subida de imagen)
      if (fotoFile) {
        const fd = new FormData();

        fd.append("nombre_completo", form.nombre_completo);
        fd.append("direccion", form.direccion);
        fd.append("telefono", form.telefono);
        if (form.email) fd.append("email", form.email);
        fd.append("genero", form.genero);
        fd.append("id_grado", form.id_grado);
        fd.append("id_seccion", form.id_seccion);
        fd.append("id_school", form.id_school);
        if (form.latitud) fd.append("latitud", form.latitud);
        if (form.longitud) fd.append("longitud", form.longitud);

        fd.append("foto_file", fotoFile);

        if (isEditing) {
          fd.append("_method", "PUT"); // Laravel: simular PUT
          await api.post(`/alumnos/${editing.id_alumno}`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setMsg("Alumno actualizado ✅");
        } else {
          await api.post(`/alumnos`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setMsg("Alumno creado ✅");
        }
      } else {
        // sin archivo: enviamos JSON normal
        const payload = {
          nombre_completo: form.nombre_completo,
          direccion: form.direccion || null,
          telefono: form.telefono || null,
          email: form.email || null,
          foto: form.foto || null, // puede ser ruta existente o null
          genero: form.genero || null,
          latitud: form.latitud === "" ? null : form.latitud,
          longitud: form.longitud === "" ? null : form.longitud,
          id_grado: form.id_grado === "" ? null : Number(form.id_grado),
          id_seccion: form.id_seccion === "" ? null : Number(form.id_seccion),
          id_school: form.id_school === "" ? null : Number(form.id_school),
        };

        if (isEditing) {
          await api.put(`/alumnos/${editing.id_alumno}`, payload);
          setMsg("Alumno actualizado ✅");
        } else {
          await api.post(`/alumnos`, payload);
          setMsg("Alumno creado ✅");
        }
      }

      setOpenForm(false);
      await fetchData();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  async function removeAlumno(id) {
    if (!confirm("¿Seguro que deseas eliminar este alumno?")) return;

    try {
      await api.delete(`/alumnos/${id}`);
      setMsg("Alumno eliminado ✅");
      await fetchData();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const mapCenter = [
    Number(form.latitud || 13.985),
    Number(form.longitud || -89.55),
  ];

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Alumnos</h1>
          <p className="pageSubtitle">Gestión completa de alumnos</p>
        </div>

        <div className="pageActions">
          <button className="btnSoft" onClick={fetchData} disabled={loading}>
            {loading ? "Cargando..." : "Refrescar"}
          </button>
          <button
            className="btnPrimarySmall"
            onClick={() => {
              openCreate();
            }}
          >
            + Agregar
          </button>
        </div>
      </div>

      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert error">{err}</div>}

      {/* TABLA ALUMNO */}
      <div className="card">
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th style={{ width: 90 }}>Foto</th>
                <th>Género</th>
                <th style={{ width: 90 }}>Grado</th>
                <th style={{ width: 90 }}>Sección</th>
                <th>Escuela</th>
                <th style={{ width: 110 }}>Lat</th>
                <th style={{ width: 110 }}>Lng</th>
                <th style={{ width: 170 }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {alumnos.length === 0 ? (
                <tr>
                  <td colSpan={13} className="tdEmpty">
                    Sin registros
                  </td>
                </tr>
              ) : (
                alumnos.map((a) => (
                  <tr key={a.id_alumno}>
                    <td className="mono">{a.id_alumno}</td>
                    <td className="tdStrong">{a.nombre_completo}</td>
                    <td>{a.direccion || "-"}</td>
                    <td>{a.telefono || "-"}</td>
                    <td>{a.email || "-"}</td>
                    <td>
                      {a.foto ? (
                        <img
                          src={`${backendBase}/storage/${a.foto}`}
                          alt="foto"
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        "Sin foto"
                      )}
                    </td>
                    <td>{a.genero || "-"}</td>
                    <td className="mono">{a.id_grado ?? "-"}</td>
                    <td className="mono">{a.id_seccion ?? "-"}</td>
                    <td>{a.school?.nombre || "-"}</td>
                    <td className="mono">{a.latitud ?? "-"}</td>
                    <td className="mono">{a.longitud ?? "-"}</td>
                    <td>
                      <div className="rowActions">
                        <button className="btnRow" onClick={() => openEdit(a)}>
                          Editar
                        </button>
                        <button
                          className="btnRow danger"
                          onClick={() => removeAlumno(a.id_alumno)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA ALUMNO */}
      {openForm && (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modalHead">
              <div>
                <div className="modalTitle">
                  {isEditing ? "Editar alumno" : "Crear alumno"}
                </div>
                <div className="modalSub">
                  Completá los datos del alumno y seleccioná la ubicación.
                </div>
              </div>

              <button
                className="iconClose"
                onClick={() => setOpenForm(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form className="modalBody" onSubmit={saveForm}>
              <div className="grid2">
                <div>
                  <label className="fieldLabel">Nombre completo</label>
                  <input
                    className="input"
                    value={form.nombre_completo}
                    onChange={(e) =>
                      setForm({ ...form, nombre_completo: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="fieldLabel">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="opcional"
                  />
                </div>
              </div>

              <div>
                <label className="fieldLabel">Dirección</label>
                <input
                  className="input"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                />
              </div>

              <div className="grid2" style={{ marginTop: 10 }}>
                <div>
                  <label className="fieldLabel">Teléfono</label>
                  <input
                    className="input"
                    value={form.telefono}
                    onChange={(e) => {
                      let valor = e.target.value;
                      valor = valor.replace(/[^0-9-]/g, "");
                      if (valor.length <= 9) {
                        setForm({ ...form, telefono: valor });
                      }
                    }}
                    placeholder="XXXX-XXXX"
                  />
                </div>

                <div>
                  <label className="fieldLabel">Género</label>
                  <select
                    className="input"
                    value={form.genero || ""}
                    onChange={(e) =>
                      setForm({ ...form, genero: e.target.value })
                    }
                  >
                    <option value="">Seleccionar</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>
              </div>

              {/* id_grado / id_seccion integrados (antes de escuela) */}
              <div>
                <label className="fieldLabel">Grado</label>
                <select
                  className="input"
                  value={form.id_grado || ""}
                  onChange={(e) =>
                    setForm({ ...form, id_grado: Number(e.target.value) })
                  }
                >
                  <option value="">Seleccionar</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="fieldLabel">Sección</label>
                <select
                  className="input"
                  value={form.id_seccion ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, id_seccion: Number(e.target.value) })
                  }
                >
                  <option value="">Seleccionar</option>
                  <option value={0}>A</option>
                  <option value={1}>B</option>
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="fieldLabel">Escuela</label>
                <select
                  className="input"
                  value={form.id_school}
                  onChange={(e) =>
                    setForm({ ...form, id_school: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar</option>
                  {schools.map((s) => (
                    <option key={s.id_school} value={s.id_school}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* FOTO */}
              <div style={{ marginTop: 12 }}>
                <label className="fieldLabel">Foto (desde tu PC)</label>

                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFotoFile(file);
                  }}
                />

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  {fotoFile ? (
                    <img
                      src={URL.createObjectURL(fotoFile)}
                      alt="preview"
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,.14)",
                      }}
                    />
                  ) : form.foto ? (
                    <img
                      src={`${backendBase}/storage/${form.foto}`}
                      alt="foto alumno"
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,.14)",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="muted">Sin foto</div>
                  )}

                  <div className="muted">
                    {fotoFile
                      ? `Seleccionada: ${fotoFile.name}`
                      : form.foto
                        ? "Foto guardada (storage)"
                        : "Subí una imagen (jpg/png/webp) (max 2MB)"}
                  </div>
                </div>

                {fotoFile && (
                  <button
                    type="button"
                    className="btnSoft"
                    style={{ marginTop: 10 }}
                    onClick={() => setFotoFile(null)}
                  >
                    Quitar foto seleccionada
                  </button>
                )}
              </div>

              {/* MAPA */}
              <div style={{ marginTop: 12 }}>
                <label className="fieldLabel">Ubicación vivienda</label>

                <MapPicker
                  center={mapCenter}
                  zoom={12}
                  value={
                    form.latitud && form.longitud
                      ? { lat: Number(form.latitud), lng: Number(form.longitud) }
                      : null
                  }
                  onChange={(pos) =>
                    setForm({
                      ...form,
                      latitud: pos.lat.toFixed(6),
                      longitud: pos.lng.toFixed(6),
                    })
                  }
                  height={280}
                />

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label className="fieldLabel">Latitud</label>
                    <input className="input" value={form.latitud} readOnly />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="fieldLabel">Longitud</label>
                    <input className="input" value={form.longitud} readOnly />
                  </div>
                </div>

                <p className="muted" style={{ marginTop: 8, color: "#ffffff" }}>
                  Tip: hacé clic en el mapa para seleccionar lat/lng.
                </p>
              </div>

              <div className="modalActions">
                <button
                  className="btnSoft"
                  type="button"
                  onClick={() => setOpenForm(false)}
                >
                  Cancelar
                </button>

                <button className="btnPrimarySmall" type="submit">
                  {isEditing ? "Guardar cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}