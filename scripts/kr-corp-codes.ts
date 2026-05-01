// Top KR companies (by market cap) to track for executive insider trades.
// DART OpenAPI uses 8-digit corp_code, distinct from KRX ticker.
// If a corp_code returns no rows, the script silently skips it.

export const KR_CORP_CODES: { code: string; name: string }[] = [
  { code: "00126380", name: "삼성전자" },
  { code: "00164779", name: "SK하이닉스" },
  { code: "01515323", name: "LG에너지솔루션" },
  { code: "00880017", name: "삼성바이오로직스" },
  { code: "00164742", name: "현대차" },
  { code: "00164788", name: "기아" },
  { code: "00421045", name: "셀트리온" },
  { code: "00282033", name: "POSCO홀딩스" },
  { code: "00258801", name: "카카오" },
  { code: "00266961", name: "NAVER" },
  { code: "00688996", name: "KB금융" },
  { code: "00382199", name: "신한지주" },
  { code: "00547583", name: "하나금융지주" },
  { code: "00356361", name: "LG화학" },
  { code: "00126186", name: "삼성SDI" },
  { code: "01373319", name: "HD현대중공업" },
  { code: "00139967", name: "한화에어로스페이스" },
  { code: "00401731", name: "LG전자" },
  { code: "01037771", name: "LG" },
  { code: "00159023", name: "두산에너빌리티" },
  { code: "00126308", name: "삼성생명" },
  { code: "00138177", name: "롯데지주" },
  { code: "00373200", name: "엔씨소프트" },
  { code: "00131080", name: "고려아연" },
  { code: "00139802", name: "LG디스플레이" },
];
