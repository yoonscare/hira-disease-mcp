import { XMLParser } from "fast-xml-parser"

export type HiraParams = Record<string, string | number | boolean | undefined>

export interface HiraClientOptions {
  serviceKey?: string
  baseUrl?: string
}

const DEFAULT_BASE_URL = "https://apis.data.go.kr/B551182/diseaseInfoService1"

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
})

function normalizeServiceKey(serviceKey?: string): string | undefined {
  if (!serviceKey) return undefined
  try {
    return decodeURIComponent(serviceKey)
  } catch {
    return serviceKey
  }
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function pickItems(parsed: unknown): unknown[] {
  const root = parsed as Record<string, any>
  const body = root?.response?.body ?? root?.body ?? root
  const items = body?.items?.item ?? body?.item ?? []
  return toArray(items)
}

function pickHeader(parsed: unknown): Record<string, unknown> {
  const root = parsed as Record<string, any>
  return root?.response?.header ?? root?.header ?? {}
}

function pickBody(parsed: unknown): Record<string, unknown> {
  const root = parsed as Record<string, any>
  return root?.response?.body ?? root?.body ?? {}
}

export class HiraClient {
  private readonly serviceKey?: string
  private readonly baseUrl: string

  constructor(options: HiraClientOptions = {}) {
    this.serviceKey = normalizeServiceKey(options.serviceKey)
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
  }

  async request(operation: string, params: HiraParams = {}) {
    if (!this.serviceKey) {
      throw new Error(
        "Missing HIRA ServiceKey. Add it as ?key=YOUR_SERVICE_KEY, ?serviceKey=YOUR_SERVICE_KEY, or an x-api-key header."
      )
    }

    const url = new URL(`${this.baseUrl}/${operation}`)
    url.searchParams.set("ServiceKey", this.serviceKey)
    url.searchParams.set("_type", "xml")

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value))
      }
    }

    const response = await fetch(url, {
      headers: {
        Accept: "application/xml,text/xml,*/*",
      },
    })

    const text = await response.text()

    if (!response.ok) {
      throw new Error(`HIRA API request failed with HTTP ${response.status}: ${text.slice(0, 300)}`)
    }

    const parsed = parser.parse(text)
    const header = pickHeader(parsed)
    const body = pickBody(parsed)
    const resultCode = String(header.resultCode ?? body.resultCode ?? "")

    if (resultCode && resultCode !== "00") {
      const resultMessage = header.resultMsg ?? header.resultMessage ?? body.resultMsg ?? "Unknown HIRA API error"
      throw new Error(`HIRA API error ${resultCode}: ${String(resultMessage)}`)
    }

    return {
      header,
      body,
      items: pickItems(parsed),
      raw: parsed,
    }
  }
}
