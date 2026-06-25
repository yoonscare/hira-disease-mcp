import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { HiraClient } from "./hira-client.js"
import { tools } from "./tools/definitions.js"

export const VERSION = "0.1.0"

function asText(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

export function createHiraMcpServer(serviceKey?: string): Server {
  const server = new Server(
    {
      name: "hira-disease-mcp",
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  const client = new HiraClient({
    serviceKey: serviceKey || process.env.HIRA_SERVICE_KEY,
  })

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((candidate) => candidate.name === request.params.name)

    if (!tool) {
      throw new Error(`Unknown tool: ${request.params.name}`)
    }

    const result = await tool.handler(client, (request.params.arguments ?? {}) as Record<string, unknown>)

    return {
      content: [
        {
          type: "text",
          text: asText(result),
        },
      ],
    }
  })

  return server
}
