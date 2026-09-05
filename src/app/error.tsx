"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GRIDPULSE UI error", error);
  }, [error]);

  return (
    <main className="error-page">
      <div className="error-card">
        <div className="eyebrow">GRIDPULSE / RECOVERY</div>
        <h1>Control plane interrupted.</h1>
        <p>
          The interface hit an unexpected error. Your telemetry data remains in the
          database; retry the view before investigating the data layer.
        </p>
        <button className="submit-report" onClick={() => reset()}>
          RETRY CONTROL PLANE
        </button>
        <Link className="back-link" href="/">
          RETURN HOME
        </Link>
      </div>
    </main>
  );
}
