# TBM(작업전 안전미팅) 자료 생성 Skill

작업 시작 전 현장에서 진행하는 TBM(Tool Box Meeting) 자료를 생성합니다.
위험성평가 결과 파일이 있으면 연계하고, 없으면 작업명 기반으로 자동 구성합니다.

---

## 사전 확인 (시작 전)

아래 파일이 있으면 읽어서 오늘 작업의 위험요인·대책을 TBM에 반영합니다:
- `.claude/safety-guide/guide.txt` — 사내 안전가이드
- 프로젝트 내 기존 위험성평가 Excel 파일 (사용자가 경로 안내 시)

---

## 진행 절차

### STEP 1 — 기본 정보 수집

한 번에 하나씩 질문하세요:

1. **작업명** (오늘 수행할 작업)
2. **작업 일자** (오늘 날짜 기본 제안)
3. **작업 장소**
4. **참석 인원 수**
5. **작업 책임자(반장/팀장) 이름**
6. **오늘의 특이사항** (날씨, 야간작업, 신규 투입자 여부 등 — 없으면 "없음")

---

### STEP 2 — 오늘의 작업 단계 확인

오늘 수행할 세부 작업 단계를 3~6개 제안하세요.
사용자가 확인·수정 후 확정합니다.

---

### STEP 3 — 위험요인 및 안전수칙 도출

각 작업 단계별로 아래를 제시하세요:

1. **핵심 위험요인** (1~2개, 구체적으로)
   - 형식: `[유형] 상황 → 예상 사고`
2. **안전수칙** (2~3개, 행동 중심으로)
   - 형식: `동사 + 구체적 행동` (예: "양수조작 버튼을 두 손으로 동시에 누른다")
3. **필요 보호구** (해당 단계 기준)

안전가이드가 있으면 가이드 내용을 우선 반영하고 `[가이드]` 표기합니다.

---

### STEP 4 — TBM 특별 강조 사항 도출

아래 항목을 확인하여 오늘 TBM에서 특별히 강조할 내용을 1~3개 선정합니다:

- 최근 아차사고·재해 발생 이력이 있는 항목
- 위험성 수준이 높음(H) 이상인 항목
- 신규 투입자가 있을 경우 기초 안전수칙
- 날씨·계절 요인 (우천, 한파, 폭염 등)

---

### STEP 5 — TBM 자료 출력

아래 형식으로 출력합니다. 현장에서 인쇄하여 사용할 수 있도록 간결하게 작성합니다.

```
============================================================
           작 업 전 안 전 미 팅 (TBM)
============================================================
작업명: _______________  날짜: ________  장소: ___________
책임자: _______________  참석인원: _____명

【오늘의 작업 단계】
  1. _______  2. _______  3. _______

------------------------------------------------------------
【작업별 위험요인 및 안전수칙】

▶ [작업단계명]
  ⚠ 위험요인: [유형] 상황 → 예상 사고
  ✔ 안전수칙:
    1. 수칙 내용
    2. 수칙 내용
  🦺 보호구: 안전모, 안전화, ...

(단계별 반복)

------------------------------------------------------------
【오늘의 특별 강조 사항】
  ★ 강조 내용 1
  ★ 강조 내용 2

------------------------------------------------------------
【보호구 착용 확인】
  □ 안전모   □ 안전화   □ 안전대   □ 보호장갑
  □ 방진마스크   □ 방독마스크   □ 보안경   □ 기타: ____

------------------------------------------------------------
서명란: ____________________  (작업 전 안전교육 이수 확인)
============================================================
```

출력 후 Copilot 사용자에게는 Word/메모장에 붙여넣어 인쇄 가능합니다.

---

### STEP 6 — Excel TBM 기록부 생성 (선택)

사용자가 Excel 파일 저장을 원하면 아래 Python 스크립트를 실행합니다.

```python
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from datetime import date
import os

tbm_data = {
    "작업명": "",
    "날짜": str(date.today()),
    "장소": "",
    "책임자": "",
    "참석인원": 0,
    "특이사항": "",
    "items": [
        # {
        #   "작업단계": "",
        #   "위험요인": "",
        #   "안전수칙": ["수칙1", "수칙2"],
        #   "보호구": "안전모, 안전화",
        # }
    ],
    "강조사항": [],      # ["강조1", "강조2"]
    "보호구체크": [],    # ["안전모", "안전화", ...]
}

def thin_border():
    s = Side(style='thin')
    return Border(left=s, right=s, top=s, bottom=s)

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "TBM기록부"

col_widths = [6, 20, 30, 35, 25]
for i, w in enumerate(col_widths, 1):
    ws.column_dimensions[get_column_letter(i)].width = w

hf = PatternFill("solid", fgColor="1F4E79")
hfont = Font(name="맑은 고딕", bold=True, color="FFFFFF", size=11)
center = Alignment(horizontal="center", vertical="center", wrap_text=True)
left   = Alignment(horizontal="left",   vertical="center", wrap_text=True)
data_font = Font(name="맑은 고딕", size=10)

# 제목
ws.row_dimensions[1].height = 38
ws.merge_cells("A1:E1")
ws["A1"] = "작 업 전 안 전 미 팅 (TBM) 기 록 부"
ws["A1"].font = Font(name="맑은 고딕", bold=True, size=15, color="FFFFFF")
ws["A1"].alignment = center
ws["A1"].fill = hf

# 기본정보
info = [
    ("A2","B2","작업명","C2","E2", tbm_data["작업명"]),
    ("A3","B3","날  짜","C3","D3", tbm_data["날짜"]),
    ("A4","B4","작업장소","C4","E4", tbm_data["장소"]),
    ("A5","B5","책임자","C5","D5", tbm_data["책임자"]),
]
fill2 = PatternFill("solid", fgColor="D6E4F0")
lf = Font(name="맑은 고딕", bold=True, size=10)
sf = Font(name="맑은 고딕", size=10)
for r_data in info:
    lc1,lc2,lv,vc1,vc2,vv = r_data
    ws.merge_cells(f"{lc1}:{lc2}"); ws[lc1]=lv
    ws[lc1].font=lf; ws[lc1].fill=fill2
    ws[lc1].alignment=center; ws[lc1].border=thin_border()
    ws.merge_cells(f"{vc1}:{vc2}"); ws[vc1]=vv
    ws[vc1].font=sf; ws[vc1].alignment=left; ws[vc1].border=thin_border()

for r in [2,3,4,5]:
    ws.row_dimensions[r].height = 18

# 컬럼 헤더
ws.row_dimensions[6].height = 28
for col, text in zip("ABCDE", ["No.","작업 단계","위험요인","안전수칙","필요 보호구"]):
    ws[f"{col}6"] = text
    ws[f"{col}6"].font = hfont
    ws[f"{col}6"].fill = hf
    ws[f"{col}6"].alignment = center
    ws[f"{col}6"].border = thin_border()

# 데이터 행
for idx, item in enumerate(tbm_data["items"], 1):
    r = 6 + idx
    ws.row_dimensions[r].height = 55
    measures_text = "\n".join(f"{i}. {s}" for i, s in enumerate(item["안전수칙"], 1))
    for col, val in zip("ABCDE", [
        idx, item["작업단계"], item["위험요인"], measures_text, item["보호구"]
    ]):
        c = ws[f"{col}{r}"]
        c.value = val
        c.font = data_font
        c.border = thin_border()
        c.alignment = center if col == "A" else left

# 강조 사항
emph_row = 6 + len(tbm_data["items"]) + 1
ws.row_dimensions[emph_row].height = 22
ws.merge_cells(f"A{emph_row}:E{emph_row}")
ws[f"A{emph_row}"] = "【오늘의 특별 강조 사항】"
ws[f"A{emph_row}"].font = Font(name="맑은 고딕", bold=True, size=10, color="C00000")
ws[f"A{emph_row}"].fill = PatternFill("solid", fgColor="FFDEDE")
ws[f"A{emph_row}"].alignment = left
ws[f"A{emph_row}"].border = thin_border()

for i, emph in enumerate(tbm_data["강조사항"]):
    er = emph_row + 1 + i
    ws.row_dimensions[er].height = 20
    ws.merge_cells(f"A{er}:E{er}")
    ws[f"A{er}"] = f"★ {emph}"
    ws[f"A{er}"].font = Font(name="맑은 고딕", size=10, bold=True)
    ws[f"A{er}"].alignment = left
    ws[f"A{er}"].border = thin_border()

output_dir = os.getcwd()
filename = f"TBM_{tbm_data['작업명']}_{tbm_data['날짜']}.xlsx".replace(" ","_")
wb.save(os.path.join(output_dir, filename))
print(f"✅ TBM 기록부 생성: {filename}")
```

---

## 주의사항

- TBM은 작업 시작 **직전** (5~10분 이내) 현장에서 진행합니다.
- 참석자 전원이 내용을 이해했는지 구두로 확인 후 서명란을 작성합니다.
- 위험성 수준 높음(H) 이상 항목은 반드시 TBM에서 강조 언급합니다.
