import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import MapPicker from "../components/MapPicker";

const emptyForm = {
  nombre: "",
  direccion: "",
  email: "",
  foto: "",
  latitud: "",
  longitud: "",
  id_user: "",
};

export default function SchoolsPage({ user }) {
  const [schools, setSchools] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fotoFile, setFotoFile] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
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

  const isAdmin = useMemo(
    () => Boolean(user && String(user.tipo).toLowerCase() === "administrador"),
    [user]
  );

  const backendBase = import.meta.env.VITE_API_BASE_URL;

  
  // FETCH DATA
  async function fetchData() {
    setLoading(true);
    setErr("");
    try {
      const [resSchools, resAlumnos] = await Promise.all([
        api.get("/schools"),
        api.get("/alumnos"),
      ]);
      setSchools(resSchools.data || []);
      setAlumnos(resAlumnos.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // CARGAR USUARIOS
  async function loadAvailableUsers() {
    try {
      const res = await api.get("/users");
      setAvailableUsers(res.data || []);
      return res.data || [];
    } catch (e) {
      setAvailableUsers([]);
      return [];
    }
  }

  
  // FILTRADO PARA SELECT
  const finalUsersForSelect = useMemo(() => {
    if (!availableUsers) return [];

    const users = [...availableUsers];

    // Si estamos editando, aseguramos que el usuario actual esté presente
    if (editing && editing.id_user != null) {
      const exists = users.some(u => Number(u.id_user) === Number(editing.id_user));
      if (!exists) {
        users.unshift({
          id_user: editing.id_user,
          nombre: editing.user?.nombre ?? "Usuario actual",
          usuario: editing.user?.usuario ?? "",
        });
      }
    }

    // Filtramos para que no se repitan con otras escuelas
    return users.filter(u => {
      if (editing && Number(u.id_user) === Number(editing.id_user)) return true;
      return !schools.some(s => Number(s.id_user) === Number(u.id_user));
    });
  }, [availableUsers, schools, editing]);

  
  // CRUD
  async function openCreate() {
    if (!isAdmin) return;
    const users = await loadAvailableUsers();
    const usersNoAsignados = users.filter(u => !schools.some(s => Number(s.id_user) === Number(u.id_user)));

    if (!usersNoAsignados || usersNoAsignados.length === 0) {
      setErr("No hay usuarios disponibles para asignar a la escuela. Crea usuarios primero.");
      return;
    }

    setEditing(null);
    setForm(emptyForm);
    setFotoFile(null);
    setOpenForm(true);
  }

  function openEdit(s) {
    if (!isAdmin) return;
    setEditing(s);
    setForm({
      nombre: s.nombre ?? "",
      direccion: s.direccion ?? "",
      email: s.email ?? "",
      foto: s.foto ?? "",
      latitud: s.latitud ?? "",
      longitud: s.longitud ?? "",
      id_user: s.id_user != null ? String(s.id_user) : "",
    });
    setFotoFile(null);
    loadAvailableUsers();
    setOpenForm(true);
  }

  async function saveForm(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const payload = form.id_user === "" ? { ...form, id_user: null } : { ...form, id_user: Number(form.id_user) };

      if (fotoFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, value]) => fd.append(key, value ?? ""));
        fd.append("foto_file", fotoFile);

        if (editing) fd.append("_method", "PUT");

        await api.post(editing ? `/schools/${editing.id_school}` : "/schools", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        if (editing) await api.put(`/schools/${editing.id_school}`, payload);
        else await api.post("/schools", payload);
      }

      setMsg(editing ? "Escuela actualizada ✅" : "Escuela creada ✅");
      setOpenForm(false);
      await fetchData();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  async function removeSchool(id_school) {
    if (!confirm("¿Seguro que deseas eliminar esta escuela?")) return;
    try {
      await api.delete(`/schools/${id_school}`);
      setMsg("Escuela eliminada ✅");
      await fetchData();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

 
  // RENDER
  if (!isAdmin) {
    const mySchool = schools[0] ?? null;
    const schoolAlumnos = alumnos.filter(a => mySchool ? Number(a.id_school) === Number(mySchool.id_school) : false);

    return (
      <div className="page">
        <div className="pageHeader">
          <div>
            <h1 className="pageTitle">Mi Escuela</h1>
            <p className="pageSubtitle">Vista de alumno y ubicación (solo lectura)</p>
          </div>
          <div className="pageActions">
            <button className="btnSoft" onClick={fetchData} disabled={loading}>
              {loading ? "Cargando..." : "Refrescar"}
            </button>
          </div>
        </div>

        {msg && <div className="alert ok">{msg}</div>}
        {err && <div className="alert error">{err}</div>}

        {loading ? (
          <div className="card">
            <div className="cardBody" style={{ textAlign: "center", color:"#fffcfc" }}>
              Cargando escuela...
            </div>
          </div>
        ) : !mySchool ? (
          <div className="card">
            <div className="cardHead">
              <div className="cardTitle">No se encontró una escuela asignada</div>
            </div>
            <div className="cardBody">
              Si tu cuenta debería tener una escuela asignada, contacta al administrador.
            </div>
          </div>
        ) : (
          <>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {mySchool.foto ? (
                  <img src={`${backendBase}/storage/${mySchool.foto}`} alt="foto escuela" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12 }} />
                ) : (
                  <div style={{ width: 120, height: 120, borderRadius: 12, background: "#f3f3f3" }} />
                )}

                <div>
                  <h2 style={{ margin: 0, color: "#fffcfc" }}>{mySchool.nombre}</h2>
                  <div style={{ color: "#fffcfc" }}>{mySchool.direccion}</div>
                  <div style={{ marginTop: 6, color: "#fffcfc" }}><b>Alumnos:</b> {schoolAlumnos.length}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 10 }}>
              <MapPicker
                center={[Number(mySchool.latitud || 13.6929), Number(mySchool.longitud || -89.2182)]}
                zoom={12}
                markers={[
                  { position: { lat: Number(mySchool.latitud), lng: Number(mySchool.longitud) }, label: `Escuela: ${mySchool.nombre}`, iconColor: "blue" },
                  ...schoolAlumnos.map(a => ({ position: { lat: Number(a.latitud), lng: Number(a.longitud) }, label: `Alumno: ${a.nombre_completo}`, iconColor: "red" }))
                ]}
                height={500}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  
  // ADMIN VISTA ESCUELA
  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Escuelas</h1>
          <p className="pageSubtitle">Administrá el listado, ubicación y asignación de usuarios.</p>
        </div>
        <div className="pageActions">
          <button className="btnSoft" onClick={fetchData} disabled={loading}>{loading ? "Cargando..." : "Refrescar"}</button>
          <button className="btnPrimarySmall" onClick={openCreate}>+ Agregar</button>
        </div>
      </div>

      {msg && <div className="alert ok">{msg}</div>}
      {err && <div className="alert error">{err}</div>}

      <div className="card">
        <div className="cardHead">
          <div className="cardTitle">Listado de escuelas</div>
          <div className="cardHint">Total: <b>{schools.length}</b></div>
        </div>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Email</th>
                <th style={{ width: 90 }}>Foto</th>
                <th style={{ width: 110 }}>Lat</th>
                <th style={{ width: 110 }}>Lng</th>
                <th style={{ width: 90 }}>id_user</th>
                <th style={{ width: 170 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 ? (
                <tr><td colSpan={9} className="tdEmpty">No hay registros.</td></tr>
              ) : (
                schools.map(s => (
                  <tr key={s.id_school}>
                    <td className="mono">{s.id_school}</td>
                    <td className="tdStrong">{s.nombre}</td>
                    <td>{s.direccion}</td>
                    <td>{s.email ?? "-"}</td>
                    <td>{s.foto ? <img src={`${backendBase}/storage/${s.foto}`} alt="foto escuela" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} /> : "Sin foto"}</td>
                    <td className="mono">{s.latitud ?? "-"}</td>
                    <td className="mono">{s.longitud ?? "-"}</td>
                    <td className="mono">{s.id_user ?? "-"}</td>
                    <td>
                      <div className="rowActions">
                        <button className="btnRow" onClick={() => openEdit(s)}>Editar</button>
                        <button className="btnRow danger" onClick={() => removeSchool(s.id_school)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ESCUELA */}
      {openForm && (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modalHead">
              <div>
                <div className="modalTitle">{editing ? "Editar escuela" : "Crear escuela"}</div>
                <div className="modalSub">Completá los datos y asigná un usuario responsable.</div>
              </div>
              <button className="iconClose" onClick={() => setOpenForm(false)}>✕</button>
            </div>

            <form className="modalBody" onSubmit={saveForm}>
              <div className="grid2">
                <div>
                  <label className="fieldLabel">Nombre</label>
                  <input className="input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                </div>
                <div>
                  <label className="fieldLabel">Email</label>
                  <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="opcional" />
                </div>
              </div>

              <div>
                <label className="fieldLabel">Dirección</label>
                <input className="input" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} required />
              </div>

              {/* SELECT de id_user */}
              <div style={{ marginTop: 12 }}>
                <label className="fieldLabel">Asignar usuario (id_user)</label>
                <select className="input" value={form.id_user} onChange={e => setForm({ ...form, id_user: e.target.value })} required>
                  <option value="">Seleccionar usuario</option>
                  {finalUsersForSelect.map(u => (
                    <option key={u.id_user} value={String(u.id_user)}>
                      {u.id_user} — {u.nombre} ({u.usuario})
                    </option>
                  ))}
                </select>
                {finalUsersForSelect.length === 0 && !editing && (
                  <div style={{ color: "#b91c1c", marginTop: 6 }}>
                    No hay usuarios disponibles. Crea usuarios antes de asignar.
                  </div>
                )}
              </div>

              {/* FOTO */}
              <div style={{ marginTop: 12 }}>
                <label className="fieldLabel">Foto (desde tu PC)</label>
                <input className="input" type="file" accept="image/*" onChange={e => setFotoFile(e.target.files?.[0] || null)} />
                <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
                  {fotoFile ? <img src={URL.createObjectURL(fotoFile)} alt="preview" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 14 }} />
                    : form.foto ? <img src={`${backendBase}/storage/${form.foto}`} alt="foto escuela" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 14 }} />
                      : <div className="muted">Sin foto</div>}
                </div>
              </div>

              <div style={{ marginTop: 12 }} className="grid2">
                <div>
                  <label className="fieldLabel">Latitud</label>
                  <input className="input" value={form.latitud} onChange={e => setForm({ ...form, latitud: e.target.value })} />
                </div>
                <div>
                  <label className="fieldLabel">Longitud</label>
                  <input className="input" value={form.longitud} onChange={e => setForm({ ...form, longitud: e.target.value })} />
                </div>
              </div>

              <div className="modalActions" style={{ marginTop: 14 }}>
                <button className="btnSoft" type="button" onClick={() => setOpenForm(false)}>Cancelar</button>
                <button className="btnPrimarySmall" type="submit" disabled={finalUsersForSelect.length === 0 && !editing}>
                  {editing ? "Guardar cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}