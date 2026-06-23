/* ════════════════════════════════════════════════
   현장 부적합 관리 앱  ·  app.js
   ════════════════════════════════════════════════ */

// ── 카카오 앱 키 설정 ──────────────────────────────
// developers.kakao.com 에서 발급받은 JavaScript 키를 입력하세요.
let KAKAO_APP_KEY = localStorage.getItem('kakaoKey') || '';

// ── 점검 템플릿 데이터 ─────────────────────────────
const TEMPLATES = [
  {
    category: 'scaffold',
    name: '비계',
    icon: '🏗️',
    color: '#FF6B35',
    desc: '비계 설치·해체 및 사용 중 안전 점검',
    legal: '산업안전보건기준에 관한 규칙 제55~76조',
    items: [
      '비계 기둥 간격 적정 여부 (1.5m 이하)',
      '비계 고정볼트 체결 상태 확인',
      '작업발판 이탈 방지 조치 여부',
      '안전난간 설치 여부 (높이 90cm 이상)',
      '중간 난간대 설치 여부 (45cm 위치)',
      '발끝막이판 설치 여부 (10cm 이상)',
      '수직보호망 및 안전망 설치',
      '비계 벽체 연결 간격 적정 (수직 5m, 수평 5.5m 이내)',
      '작업발판 폭 40cm 이상 여부',
      '비계 최대 적재하중 초과 여부',
      '비계 경사면 미끄럼 방지 조치',
      '작업 전 비계 점검 기록 확인',
    ],
  },
  {
    category: 'fire',
    name: '화기작업',
    icon: '🔥',
    color: '#E74C3C',
    desc: '용접·용단 등 화기를 사용하는 작업 안전 점검',
    legal: '산업안전보건기준에 관한 규칙 제241~249조',
    items: [
      '화기작업 허가서 발급 및 현장 게시 여부',
      '화기 감시자 배치 여부',
      '소화기 비치 (작업반경 5m 이내)',
      '가연성 물질 제거 또는 불연재로 차단',
      '방화포 설치 여부 (불티 비산 방지)',
      '용접 불티 비산 방지 조치',
      '가스 호스 연결부 누출 여부 확인',
      '산소·아세틸렌 용기 직사광선 차단 및 전도 방지',
      '역화 방지기 설치 여부 (토치 연결부)',
      '작업 종료 후 화기 잔존 확인 (30분 이상)',
      '화기작업 구역 안전 표지판 설치',
      '도료·용제 등 인화성 물질 격리 보관',
    ],
  },
  {
    category: 'confined',
    name: '밀폐공간',
    icon: '⛔',
    color: '#8E44AD',
    desc: '맨홀·탱크·터널 등 밀폐공간 작업 안전 점검',
    legal: '산업안전보건기준에 관한 규칙 제618~641조',
    items: [
      '밀폐공간 작업 허가서 발급 여부',
      '산소 농도 측정 (기준: 18% 이상 23.5% 미만)',
      '일산화탄소(CO) 농도 측정 (기준: 30ppm 이하)',
      '황화수소(H₂S) 농도 측정 (기준: 10ppm 이하)',
      '환기 장치 설치 및 충분한 환기 실시',
      '산소결핍 경보 장치 작동 여부',
      '안전 감시자 배치 여부 (출입구 상시 대기)',
      '구조 장비 비치 (안전대, 구조용 로프, 공기호흡기)',
      '작업자 호흡 보호구 착용 상태',
      '비상 탈출 경로 확보 여부',
      '비상 연락 체계 확립 여부',
      '밀폐공간 입출 기록 관리',
    ],
  },
  {
    category: 'electrical',
    name: '전기작업',
    icon: '⚡',
    color: '#F39C12',
    desc: '전기 설비 점검·유지보수 작업 안전 점검',
    legal: '산업안전보건기준에 관한 규칙 제301~321조',
    items: [
      '전기작업 허가서 발급 여부',
      '잠금·태그아웃(LOTO) 실시 여부',
      '임시 전선 절연 피복 손상 여부 확인',
      '접지 설비 설치 및 연결 상태',
      '누전차단기 작동 여부 확인',
      '충전부 방호 조치 여부 (절연 덮개 등)',
      '작업자 절연 보호구 착용 (절연 장갑·장화)',
      '분전함 잠금 상태 확인',
      '배선 트리플 및 문어발 사용 금지',
      '접지 저항 측정 기록 확인',
      '전기 작업 구역 접근 통제',
      '정전 작업 시 전압 확인 (검전기 사용)',
    ],
  },
  {
    category: 'height',
    name: '고소작업',
    icon: '🪜',
    color: '#27AE60',
    desc: '2m 이상 고소 장소에서의 작업 안전 점검',
    legal: '산업안전보건기준에 관한 규칙 제42~59조',
    items: [
      '안전모 착용 여부',
      '안전대 착용 및 안전대 부착 설비 연결 여부 (2m 이상)',
      '추락 방호망 설치 여부',
      '개구부 덮개 설치 및 고정 여부',
      '고소 작업대(차) 안전 점검 완료',
      '낙하물 방지망 또는 수직 보호망 설치',
      '작업 구역 안전 펜스·줄 설치 (하부 접근 통제)',
      '이동식 사다리 사용 시 상단 고정',
      '강풍 시 작업 중지 여부 (10m/s 이상)',
      '작업 발판 최대 하중 준수',
      '야간 작업 시 조명 확보 여부',
      '작업자 건강 상태 확인 (고혈압·빈혈 등)',
    ],
  },
  {
    category: 'equipment',
    name: '중장비',
    icon: '🚧',
    color: '#2980B9',
    desc: '크레인·지게차·굴착기 등 중장비 안전 점검',
    legal: '산업안전보건기준에 관한 규칙 제98~171조',
    items: [
      '중장비 작업 허가 취득 여부',
      '신호수(유도원) 배치 여부',
      '아웃트리거 설치 및 지반 받침 상태',
      '인양물 결박 및 무게 중심 확인',
      '인양 반경 내 접근 금지 구역 설정',
      '과부하 방지 장치 작동 여부',
      '장비 일일 점검 기록 확인',
      '악천후(우천·강풍) 시 작업 중지 기준 준수',
      '지반 지지력 확인 (연약지반 여부)',
      '운전원 자격증 보유 및 음주 여부',
      '장비 후방 카메라·경보 작동 여부',
      '정기 검사 유효 기간 확인',
    ],
  },
];

const SEV = { low: { label: '낮음', color: '#27AE60' }, medium: { label: '보통', color: '#F39C12' }, high: { label: '높음', color: '#E67E22' }, critical: { label: '긴급', color: '#E74C3C' } };
const STATUS = { open: { label: '미조치', color: '#E74C3C' }, 'in-progress': { label: '조치 중', color: '#F39C12' }, closed: { label: '완료', color: '#27AE60' } };

// ── 스토리지 ─────────────────────────────────────
const Storage = {
  load: () => JSON.parse(localStorage.getItem('ncs') || '[]'),
  save: (arr) => localStorage.setItem('ncs', JSON.stringify(arr)),
  add:  (nc)  => { const a = Storage.load(); a.unshift(nc); Storage.save(a); },
  update: (nc) => { const a = Storage.load(); Storage.save(a.map(x => x.id === nc.id ? nc : x)); },
  delete: (id) => { Storage.save(Storage.load().filter(x => x.id !== id)); },
};

// ── 상태 ──────────────────────────────────────────
let currentTab = 'home';
let formPhotos = [];
let formGPS = null;
let formSignature = null;
let formCategory = 'scaffold';
let formSeverity  = 'medium';
let formChecklist = [];
let sigCtx, sigDrawing = false;
let currentNCId = null;
let historyFilter = 'all';

// ── 초기화 ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initKakao();
  renderSamples();
  renderHome();
  renderHistory();
  initForm();
  document.getElementById('f-date').value = todayStr();
});

function initKakao() {
  if (!KAKAO_APP_KEY) return;
  try {
    if (!Kakao.isInitialized()) Kakao.init(KAKAO_APP_KEY);
  } catch(e) { console.warn('Kakao init error:', e); }
}

// ── 탭 전환 ──────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  if (tab === 'home')    renderHome();
  if (tab === 'history') renderHistory();
  if (tab === 'new')     scrollTo(0,0);
}

// ── 홈 렌더링 ─────────────────────────────────────
function renderHome() {
  const ncs = Storage.load();
  const open = ncs.filter(n => n.status === 'open').length;
  const inP  = ncs.filter(n => n.status === 'in-progress').length;
  const done = ncs.filter(n => n.status === 'closed').length;

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card"><div class="stat-count" style="color:#E74C3C">${open}</div><div class="stat-label">미조치</div></div>
    <div class="stat-card"><div class="stat-count" style="color:#F39C12">${inP}</div><div class="stat-label">조치 중</div></div>
    <div class="stat-card"><div class="stat-count" style="color:#27AE60">${done}</div><div class="stat-label">완료</div></div>
    <div class="stat-card"><div class="stat-count" style="color:#1A56DB">${ncs.length}</div><div class="stat-label">전체</div></div>`;

  document.getElementById('ncList').innerHTML = ncs.length === 0
    ? `<div class="empty-box"><div class="empty-icon">📋</div><div class="empty-title">부적합 기록이 없습니다</div><div class="empty-sub">새 부적합 탭에서 작성해주세요</div></div>`
    : ncs.map(nc => ncCardHTML(nc)).join('');
}

function ncCardHTML(nc) {
  const tmpl = TEMPLATES.find(t => t.category === nc.category) || {};
  const sev  = SEV[nc.severity] || SEV.medium;
  const st   = STATUS[nc.status] || STATUS.open;
  return `<div class="nc-card" onclick="openDetail('${nc.id}')">
    <div class="nc-card-bar" style="background:${sev.color}"></div>
    <div class="nc-card-body">
      <div class="nc-card-top">
        <span class="nc-id">${nc.id}</span>
        <span class="pill" style="background:${st.color}">${st.label}</span>
      </div>
      <div class="nc-area">${esc(nc.inspectionArea)}</div>
      <div class="nc-desc">${esc(nc.description)}</div>
      <div class="nc-bottom">
        <span class="nc-cat">${tmpl.icon || ''} ${tmpl.name || nc.category}</span>
        <span class="nc-date">${nc.date}</span>
      </div>
      ${nc.dueDate ? `<div class="nc-due">⏰ 조치기한: ${nc.dueDate}</div>` : ''}
    </div>
  </div>`;
}

// ── 이력 렌더링 ────────────────────────────────────
function renderHistory() {
  const all = Storage.load();
  const ncs = historyFilter === 'all' ? all : all.filter(n => n.status === historyFilter);
  document.getElementById('historyList').innerHTML = ncs.length === 0
    ? `<div class="empty-box"><div class="empty-icon">📂</div><div class="empty-title">기록이 없습니다</div></div>`
    : ncs.map(nc => ncCardHTML(nc)).join('');
}

function filterHistory(f) {
  historyFilter = f;
  document.querySelectorAll('[data-filter]').forEach(el => el.classList.toggle('active', el.dataset.filter === f));
  renderHistory();
}

// ── 점검 샘플 렌더링 ──────────────────────────────
function renderSamples() {
  document.getElementById('sampleGrid').innerHTML = TEMPLATES.map(t => `
    <div class="sample-card" style="border-left-color:${t.color}" onclick="openSample('${t.category}')">
      <div class="sample-icon">${t.icon}</div>
      <div class="sample-name">${t.name}</div>
      <div class="sample-count">${t.items.length}개 항목</div>
      <div class="sample-desc">${t.desc}</div>
    </div>`).join('');
}

function openSample(category) {
  const t = TEMPLATES.find(x => x.category === category);
  if (!t) return;
  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-hdr" style="background:${t.color}; color:#fff; border:none;">
      <h3>${t.icon} ${t.name} 점검</h3>
      <button class="modal-close" style="color:#fff" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="legal-box">📜 근거: ${t.legal}</div>
      <div class="detail-section-title">점검 항목 (${t.items.length}개)</div>
      ${t.items.map((item,i) => `
        <div class="sample-item-row">
          <div class="sample-item-num" style="background:${t.color}">${i+1}</div>
          <div class="sample-item-text">${esc(item)}</div>
        </div>`).join('')}
      <div class="tip-box">
        <div class="tip-title">💡 점검 TIP</div>
        <div class="tip-text">새 부적합 탭에서 이 카테고리를 선택하면 위 항목이 체크리스트로 자동 생성됩니다.</div>
      </div>
    </div>`);
}

// ── 폼 초기화 ─────────────────────────────────────
function initForm() {
  // 카테고리 칩
  document.getElementById('categoryChips').innerHTML = TEMPLATES.map(t => `
    <div class="chip ${t.category === formCategory ? 'active' : ''}"
         style="${t.category === formCategory ? `background:${t.color};` : ''}"
         id="chip-${t.category}"
         onclick="selectCategory('${t.category}','${t.color}')">
      ${t.icon} ${t.name}
    </div>`).join('');

  // 중요도 버튼
  document.getElementById('severityBtns').innerHTML = Object.entries(SEV).map(([k,v]) => `
    <button type="button" class="sev-btn ${k === formSeverity ? 'active' : ''}"
            style="${k === formSeverity ? `background:${v.color};` : ''}"
            id="sev-${k}"
            onclick="selectSeverity('${k}','${v.color}')">${v.label}</button>`).join('');

  loadChecklist();
}

function selectCategory(cat, color) {
  formCategory = cat;
  document.querySelectorAll('.chip').forEach(el => { el.classList.remove('active'); el.style.background = ''; el.style.color = ''; });
  const chip = document.getElementById('chip-' + cat);
  chip.classList.add('active');
  chip.style.background = color;
  chip.style.color = '#fff';
  loadChecklist();
}

function selectSeverity(sev, color) {
  formSeverity = sev;
  document.querySelectorAll('.sev-btn').forEach(el => { el.classList.remove('active'); el.style.background = ''; el.style.color = ''; });
  const btn = document.getElementById('sev-' + sev);
  btn.classList.add('active');
  btn.style.background = color;
  btn.style.color = '#fff';
}

function loadChecklist() {
  const tmpl = TEMPLATES.find(t => t.category === formCategory);
  formChecklist = tmpl ? tmpl.items.map((text, i) => ({ id: `${formCategory}-${i}`, text, result: 'na' })) : [];
  document.getElementById('formChecklist').innerHTML = formChecklist.map(item => `
    <div class="check-item" id="ci-${item.id}">
      <div class="check-text">${esc(item.text)}</div>
      <div class="check-btns">
        <button type="button" class="check-btn" onclick="setCheck('${item.id}','ok')">적합</button>
        <button type="button" class="check-btn" onclick="setCheck('${item.id}','ng')">부적합</button>
        <button type="button" class="check-btn na" onclick="setCheck('${item.id}','na')">N/A</button>
      </div>
    </div>`).join('');
  refreshCheckUI();
}

function setCheck(id, result) {
  const item = formChecklist.find(c => c.id === id);
  if (item) { item.result = result; refreshCheckUI(); }
}

function refreshCheckUI() {
  formChecklist.forEach(item => {
    const row = document.getElementById('ci-' + item.id);
    if (!row) return;
    const btns = row.querySelectorAll('.check-btn');
    btns[0].className = 'check-btn' + (item.result === 'ok' ? ' ok' : '');
    btns[1].className = 'check-btn' + (item.result === 'ng' ? ' ng' : '');
    btns[2].className = 'check-btn' + (item.result === 'na' ? ' na' : '');
  });
}

// ── 사진 ──────────────────────────────────────────
function addPhotos(input) {
  const files = Array.from(input.files);
  const remaining = 5 - formPhotos.length;
  files.slice(0, remaining).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      formPhotos.push(e.target.result);
      renderPhotoPreview();
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function removePhoto(i) {
  formPhotos.splice(i, 1);
  renderPhotoPreview();
}

function renderPhotoPreview() {
  document.getElementById('photoCount').textContent = `${formPhotos.length}/5`;
  document.getElementById('photoPreview').innerHTML = formPhotos.map((src, i) => `
    <div class="photo-thumb-wrap">
      <img class="photo-thumb" src="${src}" />
      <button type="button" class="photo-del" onclick="removePhoto(${i})">✕</button>
    </div>`).join('');
}

// ── GPS ───────────────────────────────────────────
function getGPS() {
  const btn = document.getElementById('gpsBtn');
  btn.textContent = '📡 위치 가져오는 중...';
  btn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    pos => {
      formGPS = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      btn.textContent = `✅ ${formGPS.latitude.toFixed(5)}, ${formGPS.longitude.toFixed(5)}`;
      btn.classList.add('captured');
      btn.disabled = false;
    },
    () => {
      toast('GPS 위치를 가져오지 못했습니다.');
      btn.textContent = '📍 현재 위치 가져오기';
      btn.disabled = false;
    },
    { enableHighAccuracy: true }
  );
}

// ── 서명 캔버스 ──────────────────────────────────
function openSignature() {
  document.getElementById('sigModal').classList.remove('hidden');
  const canvas = document.getElementById('sigCanvas');
  canvas.width  = canvas.offsetWidth;
  canvas.height = 200;
  sigCtx = canvas.getContext('2d');
  sigCtx.strokeStyle = '#1A1A2E';
  sigCtx.lineWidth   = 2.5;
  sigCtx.lineCap     = 'round';

  const getXY = e => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * (canvas.width / rect.width), y: (src.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const start = e => { e.preventDefault(); sigDrawing = true; const { x, y } = getXY(e); sigCtx.beginPath(); sigCtx.moveTo(x, y); };
  const draw  = e => { e.preventDefault(); if (!sigDrawing) return; const { x, y } = getXY(e); sigCtx.lineTo(x, y); sigCtx.stroke(); };
  const stop  = ()  => { sigDrawing = false; };

  canvas.ontouchstart = start; canvas.ontouchmove = draw; canvas.ontouchend = stop;
  canvas.onmousedown  = start; canvas.onmousemove = draw; canvas.onmouseup  = stop;
}

function clearSignature() {
  const canvas = document.getElementById('sigCanvas');
  sigCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveSignature() {
  const canvas = document.getElementById('sigCanvas');
  formSignature = canvas.toDataURL('image/png');
  document.getElementById('sigPreview').src = formSignature;
  document.getElementById('sigPreview').classList.remove('hidden');
  document.getElementById('sigPlaceholder').style.display = 'none';
  closeSigModal();
}

function closeSigModal() {
  document.getElementById('sigModal').classList.add('hidden');
}

// ── 폼 제출 ───────────────────────────────────────
function submitNC(e) {
  e.preventDefault();
  const date      = document.getElementById('f-date').value;
  const area      = document.getElementById('f-area').value.trim();
  const inspector = document.getElementById('f-inspector').value.trim();
  const desc      = document.getElementById('f-desc').value.trim();
  const rname     = document.getElementById('f-rname').value.trim();
  const rphone    = document.getElementById('f-rphone').value.trim();

  if (!area)      { toast('점검 구역을 입력해주세요.'); return; }
  if (!inspector) { toast('점검자 이름을 입력해주세요.'); return; }
  if (!desc)      { toast('부적합 내용을 입력해주세요.'); return; }
  if (!rname)     { toast('담당자 이름을 입력해주세요.'); return; }
  if (!rphone)    { toast('담당자 연락처를 입력해주세요.'); return; }

  const nc = {
    id:             genId(),
    date,
    inspectionArea: area,
    category:       formCategory,
    inspector,
    description:    desc,
    requiredAction: document.getElementById('f-action').value.trim(),
    dueDate:        document.getElementById('f-due').value,
    severity:       formSeverity,
    status:         'open',
    photos:         [...formPhotos],
    location:       formGPS,
    checklistItems: JSON.parse(JSON.stringify(formChecklist)),
    recipientName:  rname,
    recipientPhone: rphone,
    inspectorSignature: formSignature,
    createdAt:      new Date().toISOString(),
  };

  Storage.add(nc);
  resetForm();
  toast('✅ 부적합이 저장되었습니다.');
  switchTab('home');
}

function resetForm() {
  document.getElementById('ncForm').reset();
  document.getElementById('f-date').value = todayStr();
  formPhotos = []; formGPS = null; formSignature = null;
  formCategory = 'scaffold'; formSeverity = 'medium';
  renderPhotoPreview();
  document.getElementById('gpsBtn').textContent = '📍 현재 위치 가져오기';
  document.getElementById('gpsBtn').classList.remove('captured');
  document.getElementById('sigPreview').classList.add('hidden');
  document.getElementById('sigPlaceholder').style.display = '';
  initForm();
}

// ── NC 상세 모달 ───────────────────────────────────
function openDetail(id) {
  currentNCId = id;
  const nc   = Storage.load().find(x => x.id === id);
  if (!nc) return;
  const tmpl = TEMPLATES.find(t => t.category === nc.category) || {};
  const sev  = SEV[nc.severity]  || SEV.medium;
  const st   = STATUS[nc.status] || STATUS.open;
  const ngCnt = nc.checklistItems.filter(c => c.result === 'ng').length;
  const okCnt = nc.checklistItems.filter(c => c.result === 'ok').length;

  const checklistHTML = nc.checklistItems.length ? `
    <div class="detail-section">
      <div class="detail-section-title">✅ 체크리스트 — 적합 ${okCnt} / 부적합 ${ngCnt}</div>
      ${nc.checklistItems.map(item => {
        const mark  = item.result === 'ok' ? '✅' : item.result === 'ng' ? '❌' : '➖';
        const color = item.result === 'ok' ? '#27AE60' : item.result === 'ng' ? '#E74C3C' : '#95A5A6';
        return `<div class="detail-check-item">
          <span class="check-mark">${mark}</span>
          <span class="check-item-text" style="color:${color}">${esc(item.text)}</span>
        </div>`;
      }).join('')}
    </div>` : '';

  const photosHTML = nc.photos.length ? `
    <div class="detail-section">
      <div class="detail-section-title">📷 현장 사진 (${nc.photos.length})</div>
      <div class="detail-photos">${nc.photos.map(p => `<img class="detail-photo" src="${p}" />`).join('')}</div>
    </div>` : '';

  const gpsHTML = nc.location ? `
    <div class="detail-section">
      <div class="detail-section-title">📍 GPS 위치</div>
      <div class="detail-gps">위도: ${nc.location.latitude.toFixed(5)} / 경도: ${nc.location.longitude.toFixed(5)}</div>
      <a href="https://map.kakao.com/link/map/${esc(nc.inspectionArea)},${nc.location.latitude},${nc.location.longitude}"
         target="_blank" style="font-size:12px; color:#1A56DB;">🗺️ 카카오맵에서 보기</a>
    </div>` : '';

  const sigHTML = nc.inspectorSignature ? `
    <div class="detail-section">
      <div class="detail-section-title">✍️ 점검자 서명</div>
      <img class="detail-sig" src="${nc.inspectorSignature}" />
    </div>` : '';

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-hdr">
      <h3>부적합 상세</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="detail-badges">
        <span class="pill" style="background:${sev.color}">${sev.label}</span>
        <span class="pill" style="background:${tmpl.color || '#888'}">${tmpl.icon || ''} ${tmpl.name || nc.category}</span>
        <span class="pill" style="background:${st.color}">${st.label}</span>
      </div>
      <div style="font-size:11px;font-weight:700;color:#1A56DB;margin-bottom:4px">${esc(nc.id)}</div>
      <div class="detail-row"><span class="detail-label">발행일</span><span class="detail-value">${nc.date}</span></div>
      <div class="detail-row"><span class="detail-label">점검 구역</span><span class="detail-value">${esc(nc.inspectionArea)}</span></div>
      <div class="detail-row"><span class="detail-label">점검자</span><span class="detail-value">${esc(nc.inspector)}</span></div>
      <div class="detail-row"><span class="detail-label">조치 기한</span><span class="detail-value">${nc.dueDate || '-'}</span></div>
      <div class="detail-row"><span class="detail-label">담당자</span><span class="detail-value">${esc(nc.recipientName)} (${esc(nc.recipientPhone)})</span></div>

      <div class="detail-section">
        <div class="detail-section-title">🔴 부적합 내용</div>
        <div class="detail-content">${esc(nc.description)}</div>
      </div>
      ${nc.requiredAction ? `<div class="detail-section">
        <div class="detail-section-title">✅ 조치 요청사항</div>
        <div class="detail-content">${esc(nc.requiredAction)}</div>
      </div>` : ''}
      ${checklistHTML}${photosHTML}${gpsHTML}${sigHTML}
    </div>

    <div class="status-section">
      <div class="detail-section-title">📌 상태 변경</div>
      <div class="status-btns">
        ${Object.entries(STATUS).map(([k,v]) => `
          <button class="status-btn ${nc.status === k ? 'active' : ''}"
                  style="${nc.status === k ? `background:${v.color};` : ''}"
                  onclick="changeStatus('${nc.id}','${k}','${v.color}')">${v.label}</button>`).join('')}
      </div>
    </div>

    <div class="send-section">
      <div class="send-section-title">📤 담당자 발송</div>
      <div class="send-buttons">
        <button class="send-btn kakao" onclick="sendKakao('${nc.id}')">
          <span class="send-btn-icon">💛</span>카카오톡 발송
        </button>
        <button class="send-btn sms" onclick="sendSMS('${nc.id}')">
          <span class="send-btn-icon">💬</span>SMS 발송
        </button>
        <button class="send-btn pdf" onclick="printReport('${nc.id}')">
          <span class="send-btn-icon">🖨️</span>인쇄 / PDF
        </button>
        <button class="send-btn copy" onclick="copyReport('${nc.id}')">
          <span class="send-btn-icon">📋</span>내용 복사
        </button>
      </div>
      <button class="btn-danger" style="width:100%;margin-top:8px" onclick="deleteNC('${nc.id}')">🗑️ 삭제</button>
    </div>`);
}

function changeStatus(id, status, color) {
  const ncs = Storage.load();
  const nc  = ncs.find(x => x.id === id);
  if (!nc) return;
  nc.status = status;
  Storage.save(ncs);
  document.querySelectorAll('.status-btn').forEach(btn => {
    const isActive = btn.textContent.trim() === STATUS[status].label;
    btn.classList.toggle('active', isActive);
    btn.style.background = isActive ? color : '';
  });
  renderHome();
}

function deleteNC(id) {
  if (!confirm('이 부적합 기록을 삭제하시겠습니까?')) return;
  Storage.delete(id);
  closeModal();
  renderHome();
  renderHistory();
  toast('삭제되었습니다.');
}

// ── 리포트 텍스트 생성 ────────────────────────────
function buildReport(nc) {
  const tmpl = TEMPLATES.find(t => t.category === nc.category) || {};
  const sev  = SEV[nc.severity]  || SEV.medium;
  const st   = STATUS[nc.status] || STATUS.open;
  const ng   = nc.checklistItems.filter(c => c.result === 'ng').length;
  const ok   = nc.checklistItems.filter(c => c.result === 'ok').length;

  const lines = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '📋 현장 부적합 발행 통보',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `▶ 번호: ${nc.id}`,
    `▶ 발행일: ${nc.date}`,
    `▶ 점검 구역: ${nc.inspectionArea}`,
    `▶ 점검 분류: ${tmpl.icon || ''} ${tmpl.name || nc.category}`,
    `▶ 중요도: ${sev.label}`,
    `▶ 점검자: ${nc.inspector}`,
    '',
    '[부적합 내용]',
    nc.description,
  ];
  if (nc.requiredAction) {
    lines.push('', '[조치 요청사항]', nc.requiredAction);
  }
  lines.push(`\n▶ 조치 기한: ${nc.dueDate || '-'}`);
  if (nc.checklistItems.length) {
    lines.push(`\n[체크리스트] 적합 ${ok} / 부적합 ${ng}`);
    nc.checklistItems.forEach(item => {
      const m = item.result === 'ok' ? '✅' : item.result === 'ng' ? '❌' : '➖';
      lines.push(`${m} ${item.text}`);
    });
  }
  if (nc.location) {
    lines.push(`\n[GPS] 위도 ${nc.location.latitude.toFixed(5)}, 경도 ${nc.location.longitude.toFixed(5)}`);
  }
  lines.push('', `담당자: ${nc.recipientName} (${nc.recipientPhone})`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('* 현장 부적합 관리 앱에서 발송');
  return lines.join('\n');
}

// ── 카카오톡 발송 ─────────────────────────────────
function sendKakao(id) {
  const nc   = Storage.load().find(x => x.id === id);
  if (!nc) return;
  const text = buildReport(nc);

  // ① Kakao SDK 방식 (앱 키가 설정된 경우)
  if (KAKAO_APP_KEY && typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
    try {
      Kakao.Share.sendDefault({
        objectType: 'text',
        text: text.substring(0, 200) + '\n...\n[전체 내용 확인]',
        link: { mobileWebUrl: location.href, webUrl: location.href },
        buttons: [{
          title: '부적합 앱에서 보기',
          link: { mobileWebUrl: location.href, webUrl: location.href }
        }]
      });
      return;
    } catch(e) { console.warn('Kakao.Share 실패, 대체 방법 시도:', e); }
  }

  // ② URL 스킴 방식 (모바일 - 앱 키 없이도 동작)
  const encoded = encodeURIComponent(text);
  const kakaoUrl = `kakaotalk://send?text=${encoded}`;

  // 모바일 감지
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = kakaoUrl;
    setTimeout(() => {
      // 카카오톡으로 전환 안 됐을 경우 공유 API fallback
      tryNativeShare(text);
    }, 1500);
    return;
  }

  // ③ 웹 공유 API (데스크탑 브라우저)
  tryNativeShare(text);
}

function tryNativeShare(text) {
  if (navigator.share) {
    navigator.share({ title: '현장 부적합 발행 통보', text }).catch(() => {});
  } else {
    // ④ 최종 fallback: 클립보드 복사
    navigator.clipboard.writeText(text).then(() => {
      toast('📋 카카오앱 키 미설정 — 내용을 클립보드에 복사했습니다.\n카카오톡에서 붙여넣기하세요.');
    }).catch(() => toast('카카오톡 앱에서 직접 발송해주세요.'));
  }
}

// ── SMS 발송 ──────────────────────────────────────
function sendSMS(id) {
  const nc   = Storage.load().find(x => x.id === id);
  if (!nc) return;
  const text = buildReport(nc);
  const phone = nc.recipientPhone.replace(/[^0-9+]/g, '');
  // SMS URL scheme
  const sep  = /iPhone|iPad/i.test(navigator.userAgent) ? '&' : '?';
  window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(text)}`;
}

// ── 인쇄 / PDF ────────────────────────────────────
function printReport(id) {
  const nc   = Storage.load().find(x => x.id === id);
  if (!nc) return;
  const tmpl = TEMPLATES.find(t => t.category === nc.category) || {};
  const sev  = SEV[nc.severity]  || SEV.medium;
  const st   = STATUS[nc.status] || STATUS.open;
  const ngCnt = nc.checklistItems.filter(c => c.result === 'ng').length;
  const okCnt = nc.checklistItems.filter(c => c.result === 'ok').length;
  const naCnt = nc.checklistItems.filter(c => c.result === 'na').length;

  const checkTable = nc.checklistItems.length ? `
    <h3>체크리스트 결과 (적합 ${okCnt} / 부적합 ${ngCnt} / 해당없음 ${naCnt})</h3>
    <table><tr><th>점검 항목</th><th>결과</th></tr>
    ${nc.checklistItems.map(item => {
      const color = item.result === 'ok' ? '#27AE60' : item.result === 'ng' ? '#E74C3C' : '#95A5A6';
      const label = item.result === 'ok' ? '적합' : item.result === 'ng' ? '부적합' : '해당없음';
      return `<tr><td>${esc(item.text)}</td><td style="color:${color};font-weight:bold;text-align:center">${label}</td></tr>`;
    }).join('')}
    </table>` : '';

  const photosSection = nc.photos.length ? `
    <h3>📷 현장 사진</h3>
    <div class="photos">${nc.photos.map(p => `<img src="${p}" />`).join('')}</div>` : '';

  const gpsSection = nc.location ? `
    <h3>📍 GPS 위치</h3>
    <p>위도: ${nc.location.latitude.toFixed(5)}&emsp;경도: ${nc.location.longitude.toFixed(5)}</p>` : '';

  const sigSection = nc.inspectorSignature ? `
    <h3>✍️ 점검자 서명</h3>
    <img src="${nc.inspectorSignature}" style="max-height:80px" />` : '';

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
  <title>부적합 발행 양식 — ${nc.id}</title>
  <style>
    body{font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;margin:0;padding:24px;font-size:13px;color:#1A1A2E}
    h1{font-size:18px;color:#1A56DB;border-bottom:2px solid #1A56DB;padding-bottom:8px}
    h3{font-size:13px;color:#555;margin:16px 0 6px}
    .badges{display:flex;gap:8px;margin:8px 0}
    .badge{padding:3px 10px;border-radius:12px;color:#fff;font-size:12px;font-weight:bold}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
    .info-item .lbl{font-size:11px;color:#888}
    .info-item .val{font-weight:bold;margin-top:2px}
    .box{background:#F8F9FA;padding:10px 12px;border-radius:6px;line-height:1.7}
    table{width:100%;border-collapse:collapse;margin:6px 0}
    th,td{border:1px solid #ddd;padding:7px 10px;font-size:12px}
    th{background:#F0F4FF}
    .photos img{max-width:180px;max-height:130px;border-radius:6px;margin:4px;border:1px solid #ddd}
    footer{margin-top:24px;font-size:11px;color:#aaa;border-top:1px solid #ddd;padding-top:8px}
    @media print{button{display:none}}
  </style></head><body>
  <h1>📋 현장 부적합 발행 통보</h1>
  <div class="badges">
    <span class="badge" style="background:${sev.color}">${sev.label}</span>
    <span class="badge" style="background:${tmpl.color || '#888'}">${tmpl.name || nc.category}</span>
    <span class="badge" style="background:${st.color}">${st.label}</span>
  </div>
  <div class="info-grid">
    <div class="info-item"><div class="lbl">발행번호</div><div class="val">${nc.id}</div></div>
    <div class="info-item"><div class="lbl">발행일</div><div class="val">${nc.date}</div></div>
    <div class="info-item"><div class="lbl">점검 구역</div><div class="val">${esc(nc.inspectionArea)}</div></div>
    <div class="info-item"><div class="lbl">점검자</div><div class="val">${esc(nc.inspector)}</div></div>
    <div class="info-item"><div class="lbl">조치 기한</div><div class="val">${nc.dueDate || '-'}</div></div>
    <div class="info-item"><div class="lbl">담당자</div><div class="val">${esc(nc.recipientName)} (${esc(nc.recipientPhone)})</div></div>
  </div>
  <h3>🔴 부적합 내용</h3><div class="box">${esc(nc.description)}</div>
  ${nc.requiredAction ? `<h3>✅ 조치 요청사항</h3><div class="box">${esc(nc.requiredAction)}</div>` : ''}
  ${checkTable}${photosSection}${gpsSection}${sigSection}
  <footer>본 서류는 현장 부적합 관리 앱에서 자동 생성되었습니다.</footer>
  <script>window.print();<\/script>
  </body></html>`);
  win.document.close();
}

// ── 내용 복사 ─────────────────────────────────────
function copyReport(id) {
  const nc = Storage.load().find(x => x.id === id);
  if (!nc) return;
  navigator.clipboard.writeText(buildReport(nc)).then(() => toast('📋 클립보드에 복사되었습니다.'));
}

// ── 설정 모달 (Kakao 앱 키) ────────────────────────
function openSettings() {
  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-hdr">
      <h3>⚙️ 카카오 앱 설정</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="settings-info">
        카카오톡으로 직접 발송하려면 <strong>Kakao JavaScript SDK 키</strong>가 필요합니다.<br/><br/>
        1. <a href="https://developers.kakao.com" target="_blank">developers.kakao.com</a> 접속<br/>
        2. 앱 생성 → 플랫폼 → Web → 도메인 등록<br/>
        3. [앱 키] → JavaScript 키 복사 후 아래에 입력<br/><br/>
        ※ 키를 입력하지 않으면 URL 스킴 방식(카카오톡 앱 설치 필요)으로 동작합니다.
      </div>
      <label class="field-label">JavaScript 앱 키</label>
      <input type="text" id="kakaoKeyInput" class="field-input" value="${KAKAO_APP_KEY}" placeholder="예: abcdef1234567890abcdef1234567890" />
      <button class="btn-primary settings-save full" style="margin-left:0;width:100%;margin-top:12px" onclick="saveKakaoKey()">저장</button>
    </div>`);
}

function saveKakaoKey() {
  KAKAO_APP_KEY = document.getElementById('kakaoKeyInput').value.trim();
  localStorage.setItem('kakaoKey', KAKAO_APP_KEY);
  if (KAKAO_APP_KEY) {
    try {
      if (!Kakao.isInitialized()) Kakao.init(KAKAO_APP_KEY);
      toast('✅ 카카오 앱 키가 저장되었습니다.');
    } catch(e) {
      toast('⚠️ 키 저장됨. 도메인 등록 여부를 확인해주세요.');
    }
  } else {
    toast('앱 키가 삭제되었습니다.');
  }
  closeModal();
}

// ── 모달 유틸 ─────────────────────────────────────
function openModal(html) {
  const overlay = document.getElementById('modalOverlay');
  const box     = document.getElementById('modalBox');
  box.innerHTML = html;
  overlay.classList.remove('hidden');
  box.classList.remove('hidden');
  box.scrollTop = 0;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.getElementById('modalBox').classList.add('hidden');
  currentNCId = null;
}

// ── 토스트 ────────────────────────────────────────
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ── 유틸 ──────────────────────────────────────────
function genId() {
  return 'NC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2,5).toUpperCase();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
