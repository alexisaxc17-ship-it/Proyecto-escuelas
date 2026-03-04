import { useEffect, useState } from "react";
import { api } from "../api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function ReportesPage() {
  const [escuelas, setEscuelas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [view, setView] = useState("escuelas");
  const [err, setErr] = useState("");

  // Cargar Datos
  async function cargarEscuelas() {
    try {
      const res = await api.get("/reportes/escuelas");
      setEscuelas(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  async function cargarAlumnos() {
    try {
      const res = await api.get("/reportes/alumnos");
      setAlumnos(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    cargarEscuelas();
    cargarAlumnos();
  }, []);

  // Datos para Graficos
  const alumnosPorEscuela = {};
  alumnos.forEach((a) => {
    const nombreEscuela = a.school?.nombre || "Sin Escuela";
    alumnosPorEscuela[nombreEscuela] =
      (alumnosPorEscuela[nombreEscuela] || 0) + 1;
  });

  const barData = {
    labels: Object.keys(alumnosPorEscuela),
    datasets: [
      {
        label: "Alumnos",
        data: Object.values(alumnosPorEscuela),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
        barThickness: 36,
      },
    ],
  };

  const pieData = {
    labels: ["Escuelas", "Alumnos"],
    datasets: [
      {
        data: [escuelas.length, alumnos.length],
        backgroundColor: ["#1e40af", "#059669"],
      },
    ],
  };

  //KPIs
  const totalEscuelas = escuelas.length;
  const totalAlumnos = alumnos.length;
  const promedioAlumnos =
    totalEscuelas > 0 ? (totalAlumnos / totalEscuelas).toFixed(1) : 0;
  const escuelaMayor =
    Object.entries(alumnosPorEscuela).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "N/A";

  // Helper estilos para asegurar look
  const styles = {
    kpiCard: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.04)",
      borderRadius: 14,
      padding: 18,
      color: "#e6eef8",
      minHeight: 92,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    kpiTitle: {
      fontSize: 14,
      color: "#cfe3ff",
      fontWeight: 600,
      marginBottom: 6,
    },
    kpiValue: {
      fontSize: 28,
      fontWeight: 800,
      color: "#ffffff",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    card: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.04)",
      borderRadius: 14,
      padding: 18,
      color: "#e6eef8",
    },
    tableCard: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.04)",
      borderRadius: 14,
      padding: 0,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      color: "#e6eef8",
    },
    th: {
      textAlign: "left",
      padding: "14px 18px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      color: "#bcd7ff",
    },
    td: {
      padding: "14px 18px",
      borderBottom: "1px solid rgba(255,255,255,0.02)",
      color: "#e6eef8",
      verticalAlign: "middle",
    },
    smallMuted: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  };

  // ---------- exportar PDF (igual que antes) ----------
  const exportarPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const fecha = new Date().toLocaleDateString();

    pdf.setFontSize(16);
    pdf.text("REPORTE GENERAL DEL SISTEMA ESCOLAR", 14, 15);

    pdf.setFontSize(10);
    pdf.text(`Fecha: ${fecha}`, 14, 22);

    let yPos = 30;

    if (view === "escuelas") {
      const columnas = ["ID", "Nombre", "Dirección", "Email"];
      const filas = escuelas.map((e) => [
        e.id_school,
        e.nombre,
        e.direccion || "-",
        e.email || "-",
      ]);

      autoTable(pdf, {
        head: [columnas],
        body: filas,
        startY: yPos,
        styles: { fontSize: 8 },
      });

      yPos = pdf.lastAutoTable.finalY + 10;
    }

    if (view === "alumnos") {
      const columnas = ["ID", "Alumno", "Escuela", "Encargados"];
      const filas = alumnos.map((a) => [
        a.id_alumno,
        a.nombre_completo,
        a.school?.nombre || "-",
        a.padres?.length
          ? a.padres
              .map((p) => `${p.nombre} (${p.pivot.parentesco})`)
              .join(", ")
          : "Sin encargado",
      ]);

      autoTable(pdf, {
        head: [columnas],
        body: filas,
        startY: yPos,
        styles: { fontSize: 8 },
      });

      yPos = pdf.lastAutoTable.finalY + 10;
    }

    const graficos = document.getElementById("reporteGraficos");
    if (graficos) {
      const canvas = await html2canvas(graficos);
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      if (yPos + imgHeight > 280) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text("Gráficos Estadísticos", 14, yPos);
      pdf.addImage(imgData, "PNG", 15, yPos + 5, imgWidth, imgHeight);
    }

    pdf.save("reporte-escolar-completo.pdf");
  };

  // Opciones de chart (estéticas) 
  const commonBarOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y ?? ctx.parsed} alumnos`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#cfe3ff", maxRotation: 0, minRotation: 0 },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#cfe3ff", stepSize: 1 },
        grid: { color: "rgba(255,255,255,0.03)" },
      },
    },
    layout: { padding: { top: 6, bottom: 6, left: 6, right: 6 } },
  };

  const commonPieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#cfe3ff", boxWidth: 12, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed}`,
        },
      },
    },
  };

  // UI
  return (
    <div className="page" style={{ paddingBottom: 40 }}>
      <div className="pageHeader" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="pageTitle" style={{ marginBottom: 4 }}>
            Reportes
          </h1>
          <p className="pageSubtitle" style={{ color: "#bcd7ff" }}>
            Informes generales del sistema escolar
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btnSoft"
            onClick={() => {
              view === "escuelas" ? cargarEscuelas() : cargarAlumnos();
            }}
            style={{ marginRight: 8 }}
          >
            Refrescar
          </button>

          <button
            className="btnPrimarySmall"
            onClick={exportarPDF}
            title="Exportar PDF con tablas + gráficos"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {err && <div className="alert error">{err}</div>}

      {/* NAV botones */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <button
          className={view === "escuelas" ? "btnPrimarySmall" : "btnSoft"}
          onClick={() => setView("escuelas")}
        >
          Reporte Escuelas
        </button>
        <button
          className={view === "alumnos" ? "btnPrimarySmall" : "btnSoft"}
          onClick={() => setView("alumnos")}
        >
          Reporte Alumnos + Encargados
        </button>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
        }}
      >
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Total Escuelas</div>
          <div style={styles.kpiValue}>{totalEscuelas}</div>
          <div style={styles.smallMuted}>Registros activos</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Total Alumnos</div>
          <div style={styles.kpiValue}>{totalAlumnos}</div>
          <div style={styles.smallMuted}>Todos los niveles</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Promedio por Escuela</div>
          <div style={styles.kpiValue}>{promedioAlumnos}</div>
          <div style={styles.smallMuted}>Alumnos/escuela</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Escuela con más alumnos</div>
          <div style={{ ...styles.kpiValue, fontSize: 18 }}>{escuelaMayor}</div>
          <div style={styles.smallMuted}>Top</div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ marginTop: 22 }} className="card" id="tableCard">
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, color: "#e6eef8" }}>
              {view === "escuelas" ? "Listado de Escuelas" : "Listado de Alumnos"}
            </div>
            <div style={{ color: "#a8c9ff", fontSize: 13 }}>
              Total: {view === "escuelas" ? totalEscuelas : totalAlumnos}
            </div>
          </div>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {view === "escuelas" ? (
                  <>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Dirección</th>
                    <th style={styles.th}>Email</th>
                  </>
                ) : (
                  <>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Alumno</th>
                    <th style={styles.th}>Escuela</th>
                    <th style={styles.th}>Encargados</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {view === "escuelas"
                ? escuelas.map((e) => (
                    <tr key={e.id_school}>
                      <td style={styles.td}>{e.id_school}</td>
                      <td style={styles.td}>{e.nombre}</td>
                      <td style={styles.td}>{e.direccion}</td>
                      <td style={styles.td}>{e.email}</td>
                    </tr>
                  ))
                : alumnos.map((a) => (
                    <tr key={a.id_alumno}>
                      <td style={styles.td}>{a.id_alumno}</td>
                      <td style={styles.td}>{a.nombre_completo}</td>
                      <td style={styles.td}>{a.school?.nombre || "-"}</td>
                      <td style={styles.td}>
                        {a.padres?.length
                          ? a.padres.map((p) => (
                              <div key={p.id_padre} style={{ marginBottom: 4 }}>
                                {p.nombre} <span style={{ color: "#9fbcff" }}>({p.pivot.parentesco})</span>
                              </div>
                            ))
                          : <span style={{ color: "#9fbcff" }}>Sin encargado</span>}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos (centrados y estéticos) */}
      <div
        id="reporteGraficos"
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22,
        }}
      >
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ fontWeight: 700 }}>Alumnos por Escuela</div>
            <div style={styles.smallMuted}>Comparativa</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260 }}>
            <div style={{ width: "95%", height: 220 }}>
              <Bar data={barData} options={commonBarOptions} />
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ fontWeight: 700 }}>Distribución General</div>
            <div style={styles.smallMuted}>Escuelas vs Alumnos</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260 }}>
            <div style={{ width: 320, maxWidth: "100%", height: 220 }}>
              <Pie data={pieData} options={commonPieOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}