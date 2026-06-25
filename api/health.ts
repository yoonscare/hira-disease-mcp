import type { VercelRequest, VercelResponse } from "@vercel/node"
import { VERSION } from "../src/server.js"

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: "hira-disease-mcp",
    version: VERSION,
    status: "ok",
    transport: "streamable-http",
    endpoint: "/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY",
    tools: [
      "hira_search_disease",
      "hira_disease_gender_age_stats",
      "hira_disease_inout_stats",
      "hira_disease_institution_type_stats",
      "hira_disease_region_stats",
    ],
  })
}
