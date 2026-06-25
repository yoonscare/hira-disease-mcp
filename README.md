# HIRA Disease MCP

건강보험심사평가원 질병정보서비스를 Claude custom connector에서 바로 쓰기 위한 원격 MCP 서버입니다.

한의사 대상 강의에서 사용할 수 있도록 기본값은 `medTp=2` 한방 기준으로 잡았습니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yoonscare/hira-disease-mcp)

## Quick Start For Claude

Claude custom connector에 넣을 주소는 아래 둘 중 하나입니다.

### Option A. 공개 서버를 바로 쓰는 경우

대부분의 사용자는 아래 주소만 복사해서 Claude custom connector에 넣으면 됩니다.

```text
https://hira-disease-mcp.vercel.app/mcp?oc=YOUR_DATA_GO_KR_SERVICE_KEY
```

여기서 바꾸는 부분은 마지막의 `YOUR_DATA_GO_KR_SERVICE_KEY`뿐입니다.

공공데이터포털 인증키는 가능하면 **Encoding 인증키**를 사용하세요. 인증키에 `+`, `/`, `=` 같은 문자가 들어가면 URL에서 깨질 수 있습니다.

### Option B. 강의자가 별도 도메인을 제공한 경우

강의자가 `hiradisease.vercel.app` 같은 별도 주소를 제공했다면 그 주소를 그대로 사용하세요.

```text
https://hiradisease.vercel.app/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY
```

법률 MCP처럼 짧은 파라미터도 지원합니다.

```text
https://hiradisease.vercel.app/mcp?oc=YOUR_DATA_GO_KR_SERVICE_KEY
```

### Option C. 직접 배포해서 쓰는 경우

위의 **Deploy with Vercel** 버튼을 눌러 본인 Vercel에 배포합니다.

배포가 끝나면 Vercel이 이런 주소를 줍니다.

```text
https://your-project-name.vercel.app
```

그 주소 뒤에 `/mcp?key=본인_API키`를 붙입니다.

```text
https://your-project-name.vercel.app/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY
```

## What Is `YOUR_DOMAIN`?

`YOUR_DOMAIN`은 직접 입력하는 단어가 아닙니다.

MCP 서버가 배포된 실제 인터넷 주소를 뜻합니다.

| Situation | Connector URL |
| --- | --- |
| 공개 서버 바로 사용 | `https://hira-disease-mcp.vercel.app/mcp?oc=YOUR_DATA_GO_KR_SERVICE_KEY` |
| 강의자가 별도 도메인을 제공 | `https://hiradisease.vercel.app/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY` |
| 내 Vercel 프로젝트 사용 | `https://your-project-name.vercel.app/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY` |
| 내 커스텀 도메인 사용 | `https://my-domain.com/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY` |

즉, README나 예시에서 보이는 `YOUR_DOMAIN`은 아래 부분입니다.

```text
https://YOUR_DOMAIN/mcp?key=...
        ^^^^^^^^^^^
        실제 배포 도메인
```

처음 사용하는 사람은 `YOUR_DOMAIN`을 직접 고민하지 말고, 강의자가 제공한 완성 URL 또는 Vercel 배포 후 나온 URL을 복사하면 됩니다.

## What It Does

- 질병명/상병코드 검색
- 질병 성별·연령별 통계 조회
- 질병 입원·외래별 통계 조회
- 질병 의료기관 종별 통계 조회
- 질병 의료기관 지역별 통계 조회

공공데이터포털의 `건강보험심사평가원_질병정보서비스`는 XML REST API이며, 질병명칭/코드조회와 여러 질병 통계를 제공합니다.

Source: https://www.data.go.kr/data/15119055/openapi.do

## Claude Connector URL Formats

이 서버는 아래 형식을 모두 지원합니다.

```text
https://DEPLOYED_DOMAIN/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY
https://DEPLOYED_DOMAIN/mcp?oc=YOUR_DATA_GO_KR_SERVICE_KEY
https://DEPLOYED_DOMAIN/mcp?serviceKey=YOUR_DATA_GO_KR_SERVICE_KEY
```

고급 사용자는 헤더 방식도 사용할 수 있습니다.

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
8. Claude connector URL의 `key=` 또는 `oc=` 뒤에 입력

Claude connector URL에는 가능하면 **Encoding 인증키**를 넣으세요.

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

가장 쉬운 방법은 README 상단의 **Deploy with Vercel** 버튼을 누르는 것입니다.

CLI로 직접 배포하려면:

```bash
npm install
npm run build
npx vercel
```

Vercel에 배포되면 `/mcp`가 `/api/mcp`로 rewrite됩니다.

```text
https://YOUR_PROJECT.vercel.app/mcp?key=YOUR_DATA_GO_KR_SERVICE_KEY
```

Claude connector에는 Vercel 프로젝트 홈 주소가 아니라, 반드시 `/mcp?key=...`까지 붙인 주소를 넣어야 합니다.

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
