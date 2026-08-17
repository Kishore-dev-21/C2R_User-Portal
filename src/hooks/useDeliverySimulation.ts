import { useState, useEffect, useCallback, useRef } from "react";

// Realistic Chennai road-like waypoints: Ration Shop → User Home
// Route: T. Nagar Distribution Centre → Gandhi Street
const ROUTE_WAYPOINTS: [number, number][] = [
  [13.0627, 80.2507],  // 🏪 Ration Shop (warehouse)
  [13.0638, 80.2513],  // Exit compound
  [13.0645, 80.2520],  // Turn onto Usman Road
  [13.0658, 80.2532],  // Along Usman Road
  [13.0670, 80.2545],  // Junction signal
  [13.0682, 80.2555],  // Past signal junction
  [13.0695, 80.2570],  // Continue straight
  [13.0705, 80.2580],  // Right turn into side road
  [13.0710, 80.2590],  // Along side road
  [13.0718, 80.2600],  // Curve
  [13.0725, 80.2615],  // Near park entrance
  [13.0733, 80.2625],  // Past park
  [13.0740, 80.2635],  // Left turn
  [13.0748, 80.2643],  // Colony approach
  [13.0755, 80.2650],  // Colony gate
  [13.0763, 80.2658],  // Colony internal road
  [13.0770, 80.2665],  // Inner road
  [13.0778, 80.2673],  // Near temple lane
  [13.0785, 80.2680],  // Temple junction
  [13.0793, 80.2686],  // Final stretch begins
  [13.0800, 80.2690],  // Near Gandhi Street
  [13.0808, 80.2696],  // Almost there
  [13.0815, 80.2700],  // Gandhi Street
  [13.0821, 80.2704],  // House number area
  [13.0827, 80.2707],  // 🏠 User home
];

const USER_POSITION: [number, number] = [13.0827, 80.2707];

function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function computeSegmentDistances(waypoints: [number, number][]) {
  const distances: number[] = [0];
  for (let i = 1; i < waypoints.length; i++) {
    distances.push(
      distances[i - 1] + haversineKm(waypoints[i - 1], waypoints[i])
    );
  }
  return distances;
}

const segmentDistances = computeSegmentDistances(ROUTE_WAYPOINTS);
const totalRouteDistance = segmentDistances[segmentDistances.length - 1];

function getPositionAlongRoute(progress: number): [number, number] {
  const targetDist = progress * totalRouteDistance;
  for (let i = 1; i < segmentDistances.length; i++) {
    if (targetDist <= segmentDistances[i]) {
      const segStart = segmentDistances[i - 1];
      const segEnd = segmentDistances[i];
      const t = (targetDist - segStart) / (segEnd - segStart);
      const lat =
        ROUTE_WAYPOINTS[i - 1][0] +
        (ROUTE_WAYPOINTS[i][0] - ROUTE_WAYPOINTS[i - 1][0]) * t;
      const lng =
        ROUTE_WAYPOINTS[i - 1][1] +
        (ROUTE_WAYPOINTS[i][1] - ROUTE_WAYPOINTS[i - 1][1]) * t;
      return [lat, lng];
    }
  }
  return ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];
}

/** Returns compass bearing (degrees) from one point to another */
function getBearing(
  from: [number, number],
  to: [number, number]
): number {
  const dLon = ((to[1] - from[1]) * Math.PI) / 180;
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Smooth interpolation between two bearing values (handles 359→1 wraparound) */
function interpolateBearing(current: number, target: number): number {
  let diff = target - current;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return current + diff * 0.35; // ease toward target
}

export const useDeliverySimulation = () => {
  const [agentPosition, setAgentPosition] = useState<[number, number]>(ROUTE_WAYPOINTS[0]);
  const [progress, setProgress] = useState(0);
  const [delivered, setDelivered] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [bearing, setBearing] = useState(45);
  const [showRating, setShowRating] = useState(false);
  const [deliveryOTP] = useState(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );

  const tickRef = useRef<ReturnType<typeof setInterval>>();
  const prevPosition = useRef<[number, number]>(ROUTE_WAYPOINTS[0]);
  const currentBearing = useRef(45);

  useEffect(() => {
    if (delivered) return;

    tickRef.current = setInterval(() => {
      setProgress((prev) => {
        // Each tick: ~1.8% progress → ~56 ticks total at 1.8s interval ≈ ~1.7 min demo
        const next = Math.min(prev + 0.018, 1);
        const newPos = getPositionAlongRoute(next);

        // Calculate and smoothly interpolate bearing
        if (
          Math.abs(newPos[0] - prevPosition.current[0]) > 1e-7 ||
          Math.abs(newPos[1] - prevPosition.current[1]) > 1e-7
        ) {
          const rawBearing = getBearing(prevPosition.current, newPos);
          const smoothed = interpolateBearing(currentBearing.current, rawBearing);
          currentBearing.current = smoothed;
          setBearing(smoothed);
        }

        prevPosition.current = newPos;
        setAgentPosition(newPos);

        if (next >= 1) {
          setArrived(true);
          clearInterval(tickRef.current);
        }
        return next;
      });
    }, 1800); // faster tick → smoother perceived movement

    return () => clearInterval(tickRef.current);
  }, [delivered]);

  const distanceKm = haversineKm(agentPosition, USER_POSITION);
  const eta = Math.max(1, Math.round((1 - progress) * 25));
  const distanceStr =
    distanceKm < 1
      ? `${(distanceKm * 1000).toFixed(0)} m`
      : `${distanceKm.toFixed(1)} km`;

  const confirmDelivery = useCallback(() => {
    setDelivered(true);
    setTimeout(() => setShowRating(true), 1500);
  }, []);

  const dismissRating = useCallback(() => {
    setShowRating(false);
  }, []);

  // Step: 0=confirmed 1=prepared 2=out-for-delivery 3=delivered
  const currentStep = delivered ? 3 : arrived ? 2 : progress > 0.05 ? 2 : 1;

  return {
    agentPosition,
    userPosition: USER_POSITION,
    routeWaypoints: ROUTE_WAYPOINTS,
    progress,
    eta,
    distanceStr,
    delivered,
    arrived,
    bearing,
    deliveryOTP,
    confirmDelivery,
    currentStep,
    showRating,
    dismissRating,
  };
};
