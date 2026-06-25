import type { HiraClient } from "../hira-client.js"

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  handler: (client: HiraClient, args: Record<string, unknown>) => Promise<unknown>
}

const commonPaging = {
  pageNo: {
    type: "number",
    description: "Page number. Defaults to 1.",
    default: 1,
    minimum: 1,
  },
  numOfRows: {
    type: "number",
    description: "Rows per page. Defaults to 10.",
    default: 10,
    minimum: 1,
    maximum: 100,
  },
}

const commonDiseaseParams = {
  sickType: {
    type: "number",
    description: "Disease classification type. HIRA examples commonly use 1.",
    default: 1,
  },
  medTp: {
    type: "number",
    description: "Medical type. HIRA guide: 1 = Korean medicine, 2 = medicine/western medicine.",
    default: 1,
    enum: [1, 2],
  },
}

function numberArg(args: Record<string, unknown>, key: string, defaultValue: number): number {
  const value = args[key]
  if (value === undefined || value === null || value === "") return defaultValue
  return Number(value)
}

function stringArg(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key]
  if (value === undefined || value === null || value === "") return undefined
  return String(value)
}

function baseParams(args: Record<string, unknown>) {
  return {
    pageNo: numberArg(args, "pageNo", 1),
    numOfRows: numberArg(args, "numOfRows", 10),
    sickType: numberArg(args, "sickType", 1),
    medTp: numberArg(args, "medTp", 1),
  }
}

function statsParams(args: Record<string, unknown>) {
  return {
    ...baseParams(args),
    sickCd: stringArg(args, "sickCd"),
    year: numberArg(args, "year", new Date().getFullYear() - 1),
  }
}

const statsProperties = {
  sickCd: {
    type: "string",
    description: "HIRA disease code, for example J00. Use hira_search_disease first if unknown.",
  },
  year: {
    type: "number",
    description: "Statistics year, for example 2024. Defaults to last year.",
  },
  ...commonDiseaseParams,
  ...commonPaging,
}

export const tools: ToolDefinition[] = [
  {
    name: "hira_search_disease",
    description:
      "Search HIRA disease names and codes. Defaults to Korean medicine data with medTp=1. Use medTp=2 for medicine/western medicine.",
    inputSchema: {
      type: "object",
      required: ["searchText"],
      properties: {
        searchText: {
          type: "string",
          description: "Disease name or code to search, for example 감기, 요추염좌, J00.",
        },
        diseaseType: {
          type: "string",
          description: "Search field. SICK_NM searches Korean disease name; SICK_CD searches disease code.",
          default: "SICK_NM",
          enum: ["SICK_NM", "SICK_CD"],
        },
        ...commonDiseaseParams,
        ...commonPaging,
      },
    },
    handler: (client, args) =>
      client.request("getDissNameCodeList1", {
        ...baseParams(args),
        diseaseType: stringArg(args, "diseaseType") ?? "SICK_NM",
        searchText: stringArg(args, "searchText"),
      }),
  },
  {
    name: "hira_disease_gender_age_stats",
    description:
      "Get HIRA disease statistics by gender and age. Defaults to Korean medicine with medTp=1; use medTp=2 for medicine/western medicine.",
    inputSchema: {
      type: "object",
      required: ["sickCd"],
      properties: statsProperties,
    },
    handler: (client, args) => client.request("getDissByGenderAgeStats1", statsParams(args)),
  },
  {
    name: "hira_disease_inout_stats",
    description: "Get HIRA disease statistics split by hospitalization and outpatient care.",
    inputSchema: {
      type: "object",
      required: ["sickCd"],
      properties: statsProperties,
    },
    handler: (client, args) => client.request("getDissByHsptlzFrgnStats1", statsParams(args)),
  },
  {
    name: "hira_disease_institution_type_stats",
    description: "Get HIRA disease statistics by medical institution class/type.",
    inputSchema: {
      type: "object",
      required: ["sickCd"],
      properties: statsProperties,
    },
    handler: (client, args) => client.request("getDissByClassesStats1", statsParams(args)),
  },
  {
    name: "hira_disease_region_stats",
    description: "Get HIRA disease statistics by medical institution region.",
    inputSchema: {
      type: "object",
      required: ["sickCd"],
      properties: statsProperties,
    },
    handler: (client, args) => client.request("getDissByAreaStats1", statsParams(args)),
  },
]
