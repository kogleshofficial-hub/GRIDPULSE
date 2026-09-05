export type DemoTelemetry = {
  latitude: number;
  longitude: number;
  status: "outage" | "degraded" | "restored";
  source: "citizen" | "sensor" | "utility";
  region: string;
  observedAt: string;
};

const anchors = [
  { region: "Kuching Central", latitude: 1.5533, longitude: 110.3592 },
  { region: "Kuala Lumpur North", latitude: 3.1734, longitude: 101.6869 },
  { region: "Johor Bahru East", latitude: 1.4927, longitude: 103.7414 },
];

export function demoTelemetry(count = 24): DemoTelemetry[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, index) => {
    const anchor = anchors[index % anchors.length];
    const cluster = Math.floor(index / anchors.length);
    return {
      latitude: anchor.latitude + ((index % 5) - 2) * 0.012,
      longitude: anchor.longitude + ((index % 4) - 1.5) * 0.014,
      status: cluster < 4 ? "outage" : cluster < 6 ? "degraded" : "restored",
      source: index % 5 === 0 ? "sensor" : index % 3 === 0 ? "utility" : "citizen",
      region: anchor.region,
      observedAt: new Date(now - index * 4 * 60_000).toISOString(),
    };
  });
}
