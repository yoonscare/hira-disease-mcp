#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import http from "node:http"
import { createHiraMcpServer, VERSION } from "./server.js"

function extractQuery(url: string | undefined, key: string): string | undefined {
  if (!url) return undefined
  const parsed = new URL(url, "http://localhost")
  return parsed.searchParams.get(key) ?? undefined
}

function extractServiceKey(req: http.IncomingMessage): string | undefined {
  const authorization = req.headers.authorization?.replace(/^Bearer\s+/i, "")
  return (
    authorization ||
    (req.headers["x-api-key"] as string | undefined) ||
    (req.headers["servicekey"] as string | undefined) ||
    extractQuery(req.url, "key") ||
    extractQuery(req.url, "serviceKey") ||
    extractQuery(req.url, "oc")
  )
}

async function handleMcpRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const bodyText = Buffer.concat(chunks).toString("utf8")
  const body = bodyText ? JSON.parse(bodyText) : undefined

  const server = createHiraMcpServer(extractServiceKey(req))
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })

  res.on("close", () => {
    try {
      transport.close()
    } catch {
      // ignore cleanup errors
    }
    server.close().catch(() => {})
  })

  await server.connect(transport)
  await transport.handleRequest(req, res, body)
}

async function startHttpServer(port: number) {
  const server = http.createServer(async (req, res) => {
    try {
      const path = new URL(req.url ?? "/", "http://localhost").pathname

      if (path === "/" || path === "/health") {
        res.writeHead(200, { "content-type": "application/json" })
        res.end(
          JSON.stringify({
            name: "hira-disease-mcp",
            version: VERSION,
            status: "ok",
            endpoint: "/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY",
          })
        )
        return
      }

      if (path === "/mcp" && req.method === "POST") {
        await handleMcpRequest(req, res)
        return
      }

      res.writeHead(path === "/mcp" ? 405 : 404, { "content-type": "application/json" })
      res.end(JSON.stringify({ error: path === "/mcp" ? "Method not allowed" : "Not found" }))
    } catch (error) {
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" })
      }
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
    }
  })

  server.listen(port, "0.0.0.0", () => {
    console.error(`hira-disease-mcp HTTP server listening on http://0.0.0.0:${port}/mcp`)
  })
}

async function main() {
  const args = process.argv.slice(2)
  const modeIndex = args.indexOf("--mode")
  const mode = modeIndex >= 0 ? args[modeIndex + 1] : "stdio"
  const portIndex = args.indexOf("--port")
  const port = portIndex >= 0 ? Number(args[portIndex + 1]) : Number(process.env.PORT ?? 3000)

  if (mode === "http") {
    await startHttpServer(port)
    return
  }

  const server = createHiraMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
