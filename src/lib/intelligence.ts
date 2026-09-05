export type IntelligenceFeatures = {
  reportRate: number;
  independentReporters: number;
  spatialDensity: number;
  outageRestorationRatio: number;
  regionalSpreadPerMinute: number;
  minutesSinceFirstReport: number;
  corroborationConfidence: number;
  historicalBaselineRatio: number;
};

export type IntelligenceResult = {
  riskScore: number;
  confidence: number;
  collapseVelocity: number;
  modelVersion: string;
  horizonMinutes: number;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export async function scoreWithAzureML(features: IntelligenceFeatures): Promise<IntelligenceResult> {
  const endpoint = required("AZURE_ML_SCORING_URI");
  const key = required("AZURE_ML_ENDPOINT_KEY");
  const modelVersion = process.env.AZURE_ML_MODEL_VERSION ?? "gridpulse-anomaly-v1";
  const horizonMinutes = Number(process.env.AZURE_ML_HORIZON_MINUTES ?? 30);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ input_data: { features } }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Azure ML scoring failed with ${response.status}`);
  }

  const body = (await response.json()) as {
    risk_score?: number;
    confidence?: number;
    collapse_velocity?: number;
  };

  const riskScore = Number(body.risk_score);
  const confidence = Number(body.confidence);
  const collapseVelocity = Number(body.collapse_velocity);

  if (![riskScore, confidence, collapseVelocity].every(Number.isFinite)) {
    throw new Error("Azure ML returned an invalid prediction");
  }

  return {
    riskScore: Math.max(0, Math.min(1, riskScore)),
    confidence: Math.max(0, Math.min(1, confidence)),
    collapseVelocity,
    modelVersion,
    horizonMinutes,
  };
}

function extractOutputText(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;

  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text.trim();
  }

  const output = Array.isArray(record.output) ? record.output : [];
  const text = output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as Record<string, unknown>).content;
      return Array.isArray(content) ? content : [];
    })
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const value = (item as Record<string, unknown>).text;
      return typeof value === "string" ? value : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();

  return text;
}

export async function explainWithFoundry(input: {
  region: string;
  status: string;
  features: IntelligenceFeatures;
  prediction: IntelligenceResult;
}) {
  const endpoint = required("AZURE_OPENAI_ENDPOINT").replace(/\/$/, "");
  const key = required("AZURE_OPENAI_API_KEY");
  const model = required("AZURE_OPENAI_MODEL");

  const evidence = JSON.stringify(input, null, 2);
  const response = await fetch(`${endpoint}/openai/v1/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      input: [
        {
          role: "system",
          content:
            "You are the GRIDPULSE evidence explainer. Never invent outages, causes, affected customers, or measurements. Treat prediction as prediction, not confirmation. Explain only the supplied structured evidence. Return a concise operational summary followed by three evidence bullets.",
        },
        {
          role: "user",
          content: `Explain this GRIDPULSE event using only the supplied evidence:\n${evidence}`,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Microsoft Foundry explanation failed with ${response.status}`);
  }

  const body = (await response.json()) as unknown;
  const explanation = extractOutputText(body);
  if (!explanation) {
    throw new Error("Microsoft Foundry returned no explanation");
  }

  return explanation;
}
