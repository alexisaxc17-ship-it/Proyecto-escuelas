import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";

/** Icono estándar Leaflet */
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/** Click para seleccionar ubicación */
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Forzar recalculo tamaño (para modales) */
function InvalidateSize({ trigger }) {
  const map = useMap();
  useEffect(() => {
    [60, 220, 450].forEach((t) => setTimeout(() => map.invalidateSize(), t));
  }, [trigger, map]);
  return null;
}

/**
 * MapPicker combinado:
 * - value/onChange → selección de ubicación
 * - markers → dibujar múltiples marcadores con label/color
 */
export default function MapPicker({
  center = [13.6929, -89.2182],
  zoom = 12,
  value,
  onChange,
  markers = [], // array de { position: { lat, lng }, label, iconColor }
  height = 320,
  invalidateKey = 0,
}) {
  // marcador único (formulario)
  const markerPos = useMemo(() => {
    if (!value) return null;
    return [Number(value.lat), Number(value.lng)];
  }, [value]);

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(15,23,42,.14)",
        boxShadow: "0 10px 22px rgba(2,6,23,.10)",
        background: "#fff",
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: "100%" }}
        whenReady={(e) => setTimeout(() => e.target.invalidateSize(), 0)}
      >
        <InvalidateSize trigger={invalidateKey} />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onPick={onChange} />

        {/* marcador único */}
        {markerPos && <Marker position={markerPos} icon={defaultIcon} />}

        {/* múltiples marcadores (Dashboard) */}
        {markers.map((m, i) => {
          const icon = new L.Icon({
            ...defaultIcon,
            iconUrl:
              m.iconColor === "red"
                ? "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                : m.iconColor === "blue"
                ? "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
                : defaultIcon.options.iconUrl,
          });

          return (
            <Marker key={i} position={[m.position.lat, m.position.lng]} icon={icon}>
              {m.label && <Popup>{m.label}</Popup>}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}