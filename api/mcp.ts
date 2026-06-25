import type { VercelRequest, VercelResponse } from "@vercel/node"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { createHiraMcpServer } from "../src/server.js"

function extractServiceKey(req: VercelRequest): string | undefined {
  const authorization = req.headers.authorization?.replace(/^Bearer\s+/i, "")
  const query = req.query

  return (
    authorization ||
    (req.headers["x-api-key"] as string | undefined) ||
    (req.headers["servicekey"] as string | undefined) ||
    (query.key as string | undefined) ||
    (query.serviceKey as string | undefined) ||
    (query.oc as string | undefined)
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, serviceKey")
  res.setHeader("X-Content-Type-Options", "nosniff")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed. Use POST /mcp with Claude custom connectors.",
      },
      id: null,
    })
    return
  }

  const server = createHiraMcpServer(extractServiceKey(req))
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })

  try {
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal server error",
        },
        id: null,
      })
    }
  } finally {
    try {
      transport.close()
    } catch {
      // ignore cleanup errors
    }
    await server.close().catch(() => {})
  }
}
