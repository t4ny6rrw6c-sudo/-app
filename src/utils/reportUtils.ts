import { NonConformance } from '../types';
import {
  CATEGORY_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from '../data/inspectionTemplates';

export function buildTextReport(nc: NonConformance): string {
  const lines: string[] = [];
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('📋 현장 부적합 발행 통보');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`▶ 번호: ${nc.id}`);
  lines.push(`▶ 발행일: ${nc.date}`);
  lines.push(`▶ 점검 구역: ${nc.inspectionArea}`);
  lines.push(`▶ 점검 분류: ${CATEGORY_LABELS[nc.category] ?? nc.category}`);
  lines.push(
    `▶ 중요도: ${SEVERITY_LABELS[nc.severity] ?? nc.severity}`
  );
  lines.push(`▶ 점검자: ${nc.inspector}`);
  lines.push('');
  lines.push('[부적합 내용]');
  lines.push(nc.description || '(내용 없음)');
  lines.push('');
  lines.push('[조치 요청사항]');
  lines.push(nc.requiredAction || '(내용 없음)');
  lines.push('');
  lines.push(`▶ 조치 기한: ${nc.dueDate}`);
  lines.push(`▶ 현재 상태: ${STATUS_LABELS[nc.status] ?? nc.status}`);

  if (nc.checklistItems.length > 0) {
    lines.push('');
    lines.push('[체크리스트]');
    nc.checklistItems.forEach((item) => {
      const mark =
        item.result === 'ok' ? '✅' : item.result === 'ng' ? '❌' : '➖';
      lines.push(`${mark} ${item.text}`);
    });
  }

  if (nc.location) {
    lines.push('');
    lines.push(
      `[GPS] 위도 ${nc.location.latitude.toFixed(5)}, 경도 ${nc.location.longitude.toFixed(5)}`
    );
  }

  lines.push('');
  lines.push(`담당자: ${nc.recipientName} (${nc.recipientPhone})`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('* 본 통보는 부적합 현장점검 앱에서 발송되었습니다.');

  return lines.join('\n');
}

export function buildHtmlReport(nc: NonConformance): string {
  const ngItems = nc.checklistItems.filter((i) => i.result === 'ng');
  const okItems = nc.checklistItems.filter((i) => i.result === 'ok');
  const naItems = nc.checklistItems.filter((i) => i.result === 'na');

  const checklist = nc.checklistItems
    .map((item) => {
      const color =
        item.result === 'ok'
          ? '#27AE60'
          : item.result === 'ng'
          ? '#E74C3C'
          : '#95A5A6';
      const label =
        item.result === 'ok' ? '적합' : item.result === 'ng' ? '부적합' : '해당없음';
      return `<tr>
        <td style="padding:6px 8px;border:1px solid #ddd;">${item.text}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;color:${color};font-weight:bold;">${label}</td>
      </tr>`;
    })
    .join('');

  const severityColor =
    nc.severity === 'critical'
      ? '#E74C3C'
      : nc.severity === 'high'
      ? '#E67E22'
      : nc.severity === 'medium'
      ? '#F39C12'
      : '#27AE60';

  const photoHtml = nc.photos
    .map(
      (p) =>
        `<img src="${p}" style="max-width:200px;max-height:150px;border-radius:6px;margin:4px;border:1px solid #ddd;" />`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>부적합 발행 양식</title>
<style>
  body { font-family: 'Apple SD Gothic Neo', sans-serif; margin: 0; padding: 24px; color: #1A1A2E; font-size: 13px; }
  h1 { font-size: 18px; color: #1A56DB; border-bottom: 2px solid #1A56DB; padding-bottom: 8px; }
  h2 { font-size: 14px; color: #555; margin: 16px 0 6px; }
  .badge { display:inline-block; padding: 3px 10px; border-radius: 12px; color: #fff; font-size: 12px; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { background: #F0F4FF; padding: 8px; border: 1px solid #ddd; font-size: 12px; }
  td { font-size: 12px; }
  .info-row { display: flex; gap: 24px; flex-wrap: wrap; margin: 8px 0; }
  .info-item { flex: 1; min-width: 140px; }
  .info-label { font-size: 11px; color: #888; }
  .info-value { font-weight: bold; margin-top: 2px; }
  .section { margin: 16px 0; padding: 12px; background: #F8F9FA; border-radius: 8px; }
  .footer { margin-top: 24px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 8px; }
</style>
</head>
<body>
<h1>📋 현장 부적합 발행 통보</h1>
<div class="info-row">
  <div class="info-item"><div class="info-label">발행번호</div><div class="info-value">${nc.id}</div></div>
  <div class="info-item"><div class="info-label">발행일</div><div class="info-value">${nc.date}</div></div>
  <div class="info-item"><div class="info-label">점검 구역</div><div class="info-value">${nc.inspectionArea}</div></div>
  <div class="info-item"><div class="info-label">점검 분류</div><div class="info-value">${CATEGORY_LABELS[nc.category] ?? nc.category}</div></div>
</div>
<div class="info-row">
  <div class="info-item"><div class="info-label">중요도</div><div class="info-value"><span class="badge" style="background:${severityColor}">${SEVERITY_LABELS[nc.severity]}</span></div></div>
  <div class="info-item"><div class="info-label">점검자</div><div class="info-value">${nc.inspector}</div></div>
  <div class="info-item"><div class="info-label">조치 기한</div><div class="info-value">${nc.dueDate}</div></div>
  <div class="info-item"><div class="info-label">담당자</div><div class="info-value">${nc.recipientName} (${nc.recipientPhone})</div></div>
</div>

<div class="section">
  <h2>🔴 부적합 내용</h2>
  <p>${nc.description || '(내용 없음)'}</p>
</div>

<div class="section">
  <h2>✅ 조치 요청사항</h2>
  <p>${nc.requiredAction || '(내용 없음)'}</p>
</div>

${
  nc.checklistItems.length > 0
    ? `<h2>체크리스트 결과 (적합 ${okItems.length} / 부적합 ${ngItems.length} / 해당없음 ${naItems.length})</h2>
<table><tr><th>항목</th><th>결과</th></tr>${checklist}</table>`
    : ''
}

${
  nc.photos.length > 0
    ? `<h2>📷 현장 사진</h2><div>${photoHtml}</div>`
    : ''
}

${
  nc.location
    ? `<h2>📍 GPS 위치</h2><p>위도: ${nc.location.latitude.toFixed(5)}, 경도: ${nc.location.longitude.toFixed(5)}</p>`
    : ''
}

${
  nc.inspectorSignature
    ? `<h2>✍️ 점검자 서명</h2><img src="${nc.inspectorSignature}" style="max-height:80px;border:1px solid #ddd;border-radius:4px;" />`
    : ''
}

<div class="footer">본 서류는 부적합 현장점검 앱에서 자동 생성되었습니다.</div>
</body>
</html>`;
}
