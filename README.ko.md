# human-native-knowledge-skills (`hnk`)

> 사람이 실제로 이해할 수 있는 지식 시스템을 AI 에이전트가 구축하게 가르치는 스킬.

실제 GitHub URL 경로로 설치 검증 완료 — 24개 파일 fetch, 재시도 0회, 최종 `verify` green ([릴리즈 이력](CHANGELOG.md)). [English README](README.md)

## 퀵스타트

AI 에이전트에 붙여넣으세요:

```text
https://github.com/seongjaeryu/human-native-knowledge-skills 를 분석해서
이 프로젝트에 컨텍스트 운영 체계를 적용해줘.
orchestrator.md를 따라 진행하고, Level 1 설치 인터뷰부터 시작해줘.
```

URL을 읽고 파일을 쓸 수 있는 모든 에이전트에서 동작합니다 — Claude Code로 end-to-end 검증했고, 같은 프롬프트가 Cursor·Codex 등에서도 동작합니다. 설치 인터뷰는 1분 이내 — 에이전트가 모든 답을 제안하고, 당신은 확인만 합니다.

**이 시스템에서 사람이 하는 일은 정확히 두 가지입니다: 인터뷰에 답하고, 질문을 던지는 것. 모든 명령은 에이전트가 실행합니다 — 상주 규칙이 대신 기억하므로 외울 것이 없습니다.**

## 설치 후 첫 10분

설치 자체가 첫 세션 카드가 됩니다 — 에이전트가 작업을 마치기 전에 설치 세션이 아카이브됩니다. 설치 1분 뒤 에이전트에게 *"아카이브가 왜 이렇게 구성됐지?"*라고 물어보세요 — 기억이 아니라 카드에서 답합니다. 3주 뒤, 다른 사람의 에이전트도 같은 질문에 같은 답을 합니다. 그리고 에이전트가 꺼져 있을 때도 — 당신이든 후임자든 — `node scripts/hnk.mjs status` 한 줄이면 최신 결정과 열린 과제를 터미널에서 바로 봅니다.

## 어떻게 동작하나

이 순간을 아실 겁니다: 기능이 출시되고 3주 뒤 누군가 *"왜 Y 대신 X를 골랐지?"*라고 묻는데 — 답은 채팅 탭과 함께 죽었습니다. 그 결정을 내린 에이전트는 아름답게 설명했습니다. 단 한 번, 한 사람에게, 아무도 다시 못 찾는 대화에서.

`hnk`는 AI 이전의 사람들이 이 문제를 풀던 방식을 복원합니다: 문서가 협업자 사이를 오가고, 결과는 누구든 나중에 이어받을 수 있는 **결과 문서**로 정리되는 방식. 프로젝트에 설치되면:

- **1분 이내의 인터뷰 두 번** — 설치 시 설정 인터뷰, 매 작업 전 한 줄짜리 진행 방식 확인. 일하는 방식이 합의되고 기록되며, 가정되지 않습니다.
- **질문에 답하는 세션 아카이브** — "사람 1 + AI 1" 세션마다 결정·이유·변경·영향 파일이 담긴 결과 카드가 커밋됩니다. 대화 원본은 로컬에만 남고 git-ignore되며 카드와 SHA-256으로 연결됩니다. *"X는 어떻게 됐지?"*라고 묻거나, 에이전트 없이 `node scripts/hnk.mjs status`로 10초 인수인계를, `report`로 전체 다이제스트를 받으세요.
- **다이어그램이 앞서는 명세** — 산문보다 노드 그래프·순서도가 먼저, 안정적인 NODE-ID가 코드(비코드 프로젝트는 문서 섹션)에 매핑됩니다.
- **구조적으로 정직한 기록** — 재구성 원본은 절대 축어록으로 표기되지 않고, 모든 바이너리는 필수 텍스트 설명을 가지며, 시크릿은 기록 시점에 마스킹되고 업로드 전에 스캔됩니다.

이것이 해결하는 문제가 **지식 부채(knowledge debt)**입니다: **원금** = 생산 시점에 상호 이해되지 못한 채 쌓인 AI 산출물, **이자** = 시간이 지나고 사람(과 AI 세션)이 바뀔수록 복리로 커지는 이해 비용. 철학 전문은 [`core/philosophy.md`](core/philosophy.md)에 있습니다.

## 세션이 남기는 것

데모 설치에서 나온 실제 카드입니다 (발췌 — 전문은 [`examples/minimal-target`](examples/minimal-target/.context/_archive/session-20260728-202806-brew-log-format-specification.md)):

```markdown
---
id: session-20260728-202806-brew-log-format-specification
meta: {author: seongjaeryu, agent: claude-code@claude-fable-5}
mode: confirm-spec-changes-only
raw_fidelity: reconstructed
summary: "Topic 0001-brew-log-format created: ai-spec v1 (NODE-BREW-01..03),
  spec-node mapping into both CLI files, INV-BREW-001, wiki synced."
---
## Key decisions
- **Line format codified as observed**: `ISO-timestamp bean dose yield seconds` —
  새 포맷을 발명하는 대신 기존 관행을 성문화해 모든 기존 로그 라인을 유효하게 유지.
- **INV-BREW-001 추가** (append-only brew-log): 로그가 이 프로젝트의 유일한
  히스토리이므로, 다시 쓰면 검증 가능성이 파괴됨.

## Deltas
- **초기 토폴로지 확립 (v1)**
  - after: `NODE-BREW-01[Brew Recorder] --> NODE-BREW-02[Brew Log Store] --> NODE-BREW-03[Brew Reporter]`

## Follow-ups
- NODE-BREW-03이 잘못된 라인에 NaN을 내보냄; 리포터가 건너뛰고 셀지,
  크게 실패할지 결정 필요 (이 토픽의 다음 목표 후보).
```

맥락이 전혀 없는 독자 — 사람이든 AI든 — 가 결정, 이유, 기각된 대안, 열린 과제를 얻습니다. 이것이 축적의 단위입니다.

## 증거

이 저장소는 자기 철학을 자신에게 적용합니다 — 아래 모든 주장은 기록된 것이지 단언이 아닙니다:

- **v1.0.0 태그 전 실 URL 설치 검증**: GitHub URL만 받은 새 에이전트 세션이 24개 파일(343,410바이트, 재시도 0)을 fetch하고, 스크립트·템플릿이 URL 경로에서 바이트 동일함을 SHA-256으로 확인한 뒤, `verify` 0 실패/0 경고로 설치 완주.
- **설치 E2E 3종 green**: 신규 코드 프로젝트, brownfield(기존 `CLAUDE.md`·`docs/` 무이동), 비코드 지식 프로젝트.
- **`scripts/hnk.mjs`는 무의존성 단일 파일** (Node 빌트인만), 테스트 29개, CI에서 Node 18/20/22 green.
- **릴리즈 전 자체 감사 통과** ([`core/audit.md`](core/audit.md)): 파생/정직성 실패 0건, 시맨틱 포인터 538개 기계 검증 전부 해소.
- **[`examples/minimal-target`](examples/README.md)은 실제 설치 실행의 산출물** — 무엇이 시뮬레이션이었는지(인터뷰 답변) 공시 포함. 데모가 무엇인지 공개하지, 무엇인 척하지 않습니다.

모든 검증 실행의 발견 사항은 — 우리 자신의 결함까지 — [CHANGELOG.md](CHANGELOG.md)에 있습니다.

## 어휘 (알아둘 다섯 단어)

| 용어 | 의미 |
| --- | --- |
| 세션 카드 | "사람 + AI" 세션 하나의 커밋되는 결과 문서 |
| raw | 카드가 SHA-256으로 연결하는 로컬 전용(git-ignore) 대화 원본 |
| Living 층 | 사람이 읽는 현재 상태 문서 (`wiki/` 또는 기존 `docs/`) |
| `.context/` | 저장된 컨텍스트의 집 — 에이전트가 쓰고, 추출로 읽습니다 |
| NODE-ID | 다이어그램 노드를 코드(또는 문서 섹션)에 묶는 안정 식별자 |

## 저장소 지도

| 경로 | 역할 |
| --- | --- |
| `core/` | 헌법: 목표, 공리, 지식 부채 정의, 감사 기준 |
| `skill/` | AI 에이전트가 시스템을 배우는 교과서 |
| `orchestrator.md` | 8단계 설치 상태 머신 |
| `templates/` | AI가 대상 프로젝트에 인스턴스화하는 파일들 |
| `scripts/hnk.mjs` | 단일 파일 무의존성 참조 스크립트 |
| `guides/` | 하니스 비종속 참고 가이드 (뷰어, 용어 강제, 스토리지) |
| `examples/` | 실제 설치 결과물 데모 (인스턴스 데모이지 스펙이 아님) |

## 기여와 피드백

이슈와 피드백을 환영합니다 — 이 프로젝트는 자기 철학을 스스로에게 적용하므로, 이해가 끊기는 지점을 알려주세요. Pull request는 관문을 거칩니다: [CLAUDE.md](CLAUDE.md)를 읽고(네, 당신의 에이전트에게 쓴 문서입니다) PR 템플릿을 빠짐없이 채워주세요. 스펙 변경은 버전 증가 + 사유 기록 + core-audit 통과가 필요합니다. 도메인 특화 변형은 이 저장소를 가리키는 별도 저장소에 만들어 주세요.

## 라이선스

[MIT](LICENSE)
