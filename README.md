# HIRA Disease MCP

건강보험심사평가원 질병정보서비스를 Claude custom connector에서 바로 쓰기 위한 원격 MCP 서버입니다.

한의사 대상 강의에서 사용할 수 있도록 기본값은 `medTp=2` 한방 기준으로 잡았습니다.

## What It Does

- 질병명/상병코드 검색
- 질병 성별·연령별 통계 조회
- 질병 입원·외래별 통계 조회
- 질병 의료기관 종별 통계 조회
- 질병 의료기관 지역별 통계 조회

공공데이터포털의 `건강보험심사평가원_질병정보서비스`는 XML REST API이며, 질병명칭/코드조회와 여러 질병 통계를 제공합니다.

Source: https://www.data.go.kr/data/15119055/openapi.do

## Claude Connector URL

배포 후 Claude custom connector에 아래 주소를 넣습니다.

```text
https://YOUR_DOMAIN/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY
```

`korean-law-mcp`처럼 짧은 쿼리 이름도 지원합니다.

```text
https://YOUR_DOMAIN/mcp?oc=YOUR_DATA_GO_KR_SERVICE_KEY
```

또는 헤더 방식도 지원합니다.

```text
x-api-key: YOUR_DATA_GO_KR_SERVICE_KEY
Authorization: Bearer YOUR_DATA_GO_KR_SERVICE_KEY
```

> URL 쿼리에 API 키를 넣으면 브라우저 기록, 프록시 로그, 배포 플랫폼 로그에 남을 수 있습니다. 강의용·개인용 연결에는 편하지만 공개 공유는 하지 마세요.

## Get A Service Key

1. https://www.data.go.kr 접속
2. 회원가입 또는 로그인
3. `건강보험심사평가원 질병정보서비스` 검색
4. 원하는 Open API 선택
5. `활용신청` 클릭
6. 개발단계로 신청
7. 마이페이지 → 개발계정 → 인증키 확인
8. Claude connector URL의 `key=` 뒤에 입력

공공데이터포털 안내에 따르면 개발계정은 자동승인이고, 개발계정 트래픽은 10,000건입니다.

## Tools

### `hira_search_disease`

질병명 또는 상병코드로 HIRA 질병 정보를 검색합니다.

Example:

```json
{
  "searchText": "요추염좌",
  "diseaseType": "SICK_NM",
  "medTp": 2,
  "numOfRows": 10
}
```

### `hira_disease_gender_age_stats`

상병코드 기준 성별·연령별 통계를 조회합니다.

```json
{
  "sickCd": "J00",
  "year": 2024,
  "medTp": 2
}
```

### `hira_disease_inout_stats`

상병코드 기준 입원·외래별 통계를 조회합니다.

### `hira_disease_institution_type_stats`

상병코드 기준 의료기관 종별 통계를 조회합니다.

### `hira_disease_region_stats`

상병코드 기준 의료기관 지역별 통계를 조회합니다.

## Example Questions For Claude

```text
요추염좌를 한방 기준으로 검색하고 관련 상병코드를 알려줘.
```

```text
J00 상병코드의 2024년 한방 성별·연령별 통계를 요약해줘.
```

```text
감기 관련 상병을 검색한 뒤 한의원 강의에서 설명하기 좋게 정리해줘.
```

## Deploy To Vercel

```bash
npm install
npm run build
npx vercel
```

Vercel에 배포되면 `/mcp`가 `/api/mcp`로 rewrite됩니다.

```text
https://YOUR_PROJECT.vercel.app/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY
```

## Local Development

```bash
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

MCP endpoint:

```text
http://localhost:3000/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY
```

## Local Stdio MCP

For Claude Desktop or local MCP clients:

```json
{
  "mcpServers": {
    "hira-disease": {
      "command": "npx",
      "args": ["hira-disease-mcp"],
      "env": {
        "HIRA_SERVICE_KEY": "YOUR_DATA_GO_KR_SERVICE_KEY"
      }
    }
  }
}
```

## Notes

- HIRA changed the disease API base path to `diseaseInfoService1` and operation names ending in `1`.
- This server uses `getDissNameCodeList1`, `getDissByGenderAgeStats1`, `getDissByHsptlzFrgnStats1`, `getDissByClassesStats1`, and `getDissByAreaStats1`.
- The default `medTp=2` is intended for Korean medicine use cases.

## License

MIT
