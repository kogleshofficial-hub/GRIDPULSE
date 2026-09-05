import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const configured = {
  azureMachineLearning: Boolean(process.env.AZURE_ML_SCORING_URI && process.env.AZURE_ML_ENDPOINT_KEY),
  microsoftFoundry: Boolean(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_MODEL),
};

export async function GET() {
  const complete = configured.azureMachineLearning && configured.microsoftFoundry;

  return NextResponse.json(
    {
      ok: complete,
      services: configured,
      contract: {
        prediction: "Azure Machine Learning",
        explanation: "Microsoft Foundry / Azure OpenAI",
      },
      generatedAt: new Date().toISOString(),
    },
    {
      status: complete ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
