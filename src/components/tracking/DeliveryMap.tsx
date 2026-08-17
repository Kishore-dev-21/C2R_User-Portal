import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/** Animated motorcycle icon with smooth bearing rotation and glowing trail */
const createAgentIcon = (bearing: number) =>
  new L.DivIcon({
    html: `
      <div style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;position:relative;">
        <!-- Outer pulse ring -->
        <div style="
          position:absolute;width:54px;height:54px;border-radius:50%;
          background:radial-gradient(circle, rgba(0,160,120,0.22) 0%, transparent 70%);
          animation: bike-pulse 1.8s ease-in-out infinite;
        "></div>
        <!-- Inner glow -->
        <div style="
          position:absolute;width:34px;height:34px;border-radius:50%;
          background:rgba(0,200,150,0.18);
          animation: bike-pulse 1.8s ease-in-out infinite 0.4s;
        "></div>
        <!-- Speed trail -->
        <div style="
          position:absolute;width:44px;height:12px;border-radius:6px;
          background:linear-gradient(90deg, transparent, rgba(0,160,120,0.15));
          transform:rotate(${bearing - 90}deg) translateX(-18px);
          animation: trail-fade 0.8s ease-out infinite;
        "></div>
        <!-- Bike emoji -->
        <div style="
          font-size:30px;
          filter: drop-shadow(0 3px 10px rgba(0,0,0,0.4));
          transition: transform 0.5s cubic-bezier(0.25,0.1,0.25,1);
          transform: rotate(${bearing - 90}deg);
          position:relative;z-index:2;
        ">🏍️</div>
      </div>`,
    className: "",
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });

/** Pulsing home destination marker */
const userIcon = new L.DivIcon({
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:56px;height:56px;">
      <div style="
        position:absolute;width:56px;height:56px;border-radius:50%;
        border:2px solid rgba(22,163,74,0.4);
        animation: home-ring 2.5s cubic-bezier(0.4,0,0.6,1) infinite;
      "></div>
      <div style="
        position:absolute;width:40px;height:40px;border-radius:50%;
        border:2px solid rgba(22,163,74,0.25);
        animation: home-ring 2.5s cubic-bezier(0.4,0,0.6,1) infinite 0.5s;
      "></div>
      <div style="
        width:38px;height:38px;border-radius:50%;
        background:linear-gradient(135deg, #16a34a, #15803d);
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;
        box-shadow:0 4px 16px rgba(22,163,74,0.45);
        font-size:20px;
        position:relative;z-index:2;
      ">🏠</div>
    </div>`,
  className: "",
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

/** Warehouse / store origin marker */
const warehouseIcon = new L.DivIcon({
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:48px;height:48px;">
      <div style="
        width:36px;height:36px;border-radius:8px;
        background:linear-gradient(135deg, #b45309, #92400e);
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;
        box-shadow:0 4px 14px rgba(180,83,9,0.45);
        font-size:18px;
      ">🏪</div>
    </div>`,
  className: "",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

interface DeliveryMapProps {
  agentPosition: [number, number];
  userPosition: [number, number];
  routeWaypoints?: [number, number][];
  bearing?: number;
}

/** Fit map to show full route on first render */
const FitBounds = ({
  routeWaypoints,
}: {
  routeWaypoints: [number, number][];
}) => {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!fitted.current && routeWaypoints.length >= 2) {
      const bounds = L.latLngBounds(routeWaypoints);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
      fitted.current = true;
    }
  }, [map, routeWaypoints]);

  return null;
};

/** Smoothly lerp agent marker along route using RAF */
const AnimatedAgentMarker = ({
  position,
  bearing,
}: {
  position: [number, number];
  bearing: number;
}) => {
  const markerRef = useRef<L.Marker>(null);
  const prevPos = useRef(position);
  const rafRef = useRef<number>();

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    marker.setIcon(createAgentIcon(bearing));

    const start = prevPos.current;
    const end = position;
    const duration = 2400; // ms — matches simulation tick cadence
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Smooth ease-in-out cubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const lat = start[0] + (end[0] - start[0]) * ease;
      const lng = start[1] + (end[1] - start[1]) * ease;
      marker.setLatLng([lat, lng]);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    prevPos.current = position;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [position, bearing]);

  return (
    <Marker ref={markerRef} position={prevPos.current} icon={createAgentIcon(bearing)}>
      <Popup className="custom-popup">
        <div style={{ textAlign: "center", padding: "4px 8px" }}>
          <strong>🏍️ Murugan S.</strong>
          <br />
          <span style={{ fontSize: "12px", color: "#666" }}>Ration Delivery Agent</span>
        </div>
      </Popup>
    </Marker>
  );
};

/** Calculate how far along the waypoints the agent currently is */
function getTraveledWaypoints(
  waypoints: [number, number][],
  agentPos: [number, number]
): [number, number][] {
  // Find closest waypoint index
  let closestIdx = 0;
  let closestDist = Infinity;
  waypoints.forEach((wp, i) => {
    const d = Math.hypot(wp[0] - agentPos[0], wp[1] - agentPos[1]);
    if (d < closestDist) {
      closestDist = d;
      closestIdx = i;
    }
  });
  return [...waypoints.slice(0, closestIdx + 1), agentPos];
}

const DeliveryMap = ({
  agentPosition,
  userPosition,
  routeWaypoints,
  bearing = 45,
}: DeliveryMapProps) => {
  const routePath = routeWaypoints && routeWaypoints.length > 1
    ? routeWaypoints
    : [agentPosition, userPosition];

  const warehousePosition = routePath[0];
  const traveledPath = getTraveledWaypoints(routePath, agentPosition);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-border/30 animate-fade-in"
      style={{
        height: "clamp(320px, 52vh, 540px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <style>{`
        /* Bike animations */
        @keyframes bike-pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.7; }
          50%       { transform: scale(1.4); opacity: 0; }
        }
        @keyframes trail-fade {
          0%   { opacity: 0.6; }
          100% { opacity: 0; }
        }
        /* Home ring */
        @keyframes home-ring {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        /* Leaflet popup tweaks */
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18) !important;
          font-family: inherit !important;
        }
        .leaflet-popup-tip { background: white !important; }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12) !important;
          border-radius: 10px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          border-radius: 0 !important;
          font-size: 16px !important;
          line-height: 28px !important;
          width: 28px !important;
          height: 28px !important;
        }
      `}</style>

      <MapContainer
        center={[
          (agentPosition[0] + userPosition[0]) / 2,
          (agentPosition[1] + userPosition[1]) / 2,
        ]}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Tile layer — clean CartoDB light style for better readability */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        {/* Full route — subtle grey */}
        <Polyline
          positions={routePath}
          pathOptions={{ color: "#b0bec5", weight: 5, opacity: 0.45, lineCap: "round", lineJoin: "round" }}
        />

        {/* Traveled section — vivid teal with glow */}
        <Polyline
          positions={traveledPath}
          pathOptions={{ color: "#00897b", weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }}
        />

        {/* Remaining — dashed amber/orange */}
        <Polyline
          positions={[agentPosition, userPosition]}
          pathOptions={{
            color: "#f57c00",
            weight: 3.5,
            opacity: 0.55,
            dashArray: "10 7",
            lineCap: "round",
          }}
        />

        {/* Warehouse origin */}
        <Marker position={warehousePosition} icon={warehouseIcon}>
          <Popup>
            <div style={{ textAlign: "center", padding: "4px 8px" }}>
              <strong>🏪 Ration Shop</strong>
              <br />
              <span style={{ fontSize: "12px", color: "#666" }}>T. Nagar Distribution Centre</span>
            </div>
          </Popup>
        </Marker>

        {/* User home */}
        <Marker position={userPosition} icon={userIcon}>
          <Popup>
            <div style={{ textAlign: "center", padding: "4px 8px" }}>
              <strong>🏠 Your Location</strong>
              <br />
              <span style={{ fontSize: "12px", color: "#666" }}>Ramesh Kumar, Gandhi Street</span>
            </div>
          </Popup>
        </Marker>

        {/* Animated delivery bike */}
        <AnimatedAgentMarker position={agentPosition} bearing={bearing} />

        <FitBounds routeWaypoints={routePath} />
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
