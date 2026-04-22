document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderOverview();
  renderCorrelations();
  renderCalls();
  renderObjections();
  renderRecommendations();
  renderReport();
  renderScriptAudit();
  renderNewScript();
  initCharts();
});

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.page;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(`page-${target}`).classList.add('active');
    });
  });
}

const CATEGORY_LABELS = {
  'документы_jobcenter': 'Документы / Jobcenter',
  'семья': 'Семейные обстоятельства',
  'нет_срочности': 'Нет срочности',
  'конкуренты': 'Конкуренты',
  'другое': 'Другое',
  'график': 'Неподходящий график',
  'семья_здоровье': 'Семья / Здоровье',
  'jobcenter_документы': 'Jobcenter (документы)',
  'jobcenter_бератор': 'Jobcenter (бератор)',
  'цена': 'Стоимость / Цена',
  'нет_срочности_неактуально': 'Неактуально',
  'неактуально': 'Неактуально',
};

const CATEGORY_COLORS = {
  'документы_jobcenter': '#6c5ce7',
  'семья': '#e74c3c',
  'нет_срочности': '#fdcb6e',
  'конкуренты': '#74b9ff',
  'другое': '#a29bfe',
  'график': '#e17055',
  'семья_здоровье': '#fd79a8',
  'jobcenter_документы': '#6c5ce7',
  'jobcenter_бератор': '#a29bfe',
  'цена': '#00b894',
  'нет_срочности_неактуально': '#636e72',
  'неактуально': '#636e72',
};

const THEME_LABELS = {
  'jobcenter_процесс': 'Процесс Jobcenter',
  'уровень_языка': 'Уровень языка',
  'интенсивность': 'Интенсивность',
  'конкуренты': 'Конкуренты',
  'текущая_работа': 'Текущая работа',
  'семья': 'Семья / Дети',
  'другое': 'Другое',
  'график': 'График обучения',
  'стоимость': 'Стоимость',
  'недоверие': 'Страх / Недоверие',
  'неактуально': 'Неактуально / Передумал',
};

function getCatLabel(cat) { return CATEGORY_LABELS[cat] || cat; }
function getThemeLabel(theme) { return THEME_LABELS[theme] || theme; }
function leadLink(id, label) {
  const url = `https://sternmeister.kommo.com/leads/detail/${id}`;
  return `<a href="${url}" target="_blank" rel="noopener" class="lead-link" onclick="event.stopPropagation()">${label || id}</a>`;
}

function renderOverview() {
  const results = typeof ANALYSIS_RESULTS !== 'undefined' ? Object.values(ANALYSIS_RESULTS) : [];
  const report = typeof REPORT_DATA !== 'undefined' ? REPORT_DATA : {};
  const correlations = typeof CORRELATIONS_DATA !== 'undefined' ? CORRELATIONS_DATA : {};

  document.getElementById('stat-total-calls').textContent = results.length;

  const cats = correlations.local?.byCategory || {};
  const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  if (topCat) {
    const pct = Math.round(topCat[1] / results.length * 100);
    document.getElementById('stat-top-category').textContent = `${pct}%`;
    document.getElementById('stat-top-category-label').textContent = getCatLabel(topCat[0]);
  }

  document.getElementById('stat-crm-matched').textContent =
    `${correlations.local?.crmMatching?.matchedWithCRM || 0}/${results.length}`;

  const themes = correlations.local?.objectionThemes || {};
  document.getElementById('stat-objection-themes').textContent = Object.keys(themes).length;

  const overviewText = document.getElementById('overview-text');
  if (overviewText && report.overview) {
    overviewText.textContent = report.overview;
  }
}

function renderCorrelations() {
  const report = typeof REPORT_DATA !== 'undefined' ? REPORT_DATA : {};

  const matrixContainer = document.getElementById('correlation-matrix');
  if (matrixContainer && report.correlationMatrix) {
    matrixContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Ошибка менеджера</th><th>Ведёт к статусам</th><th>Частота</th><th>Критичность</th></tr>
          </thead>
          <tbody>
            ${report.correlationMatrix.map(row => `
              <tr>
                <td>${row.mistake}</td>
                <td>${row.statuses.map(s => `<span class="badge badge-danger" style="margin:2px">${s}</span>`).join(' ')}</td>
                <td><strong>${row.frequency}</strong> (${row.evidence} из 16)</td>
                <td><span class="badge ${row.severity === 'high' ? 'badge-danger' : row.severity === 'medium' ? 'badge-warning' : 'badge-success'}">${row.severity}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  const catContainer = document.getElementById('category-details');
  if (catContainer && report.categoryBreakdown) {
    catContainer.innerHTML = report.categoryBreakdown.map(c => `
      <div class="category-detail-card" style="border-left: 4px solid ${CATEGORY_COLORS[c.category] || '#a29bfe'}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <strong style="font-size:15px">${getCatLabel(c.category)}</strong>
            <span class="badge badge-accent" style="margin-left:8px">${c.count} звонков (${c.pct}%)</span>
          </div>
        </div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:8px">${c.keyInsight}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${c.calls.map(call => `<span class="badge badge-info">${leadLink(call.leadId, 'Lead ' + call.leadId)} (${call.date})</span>`).join('')}
        </div>
      </div>
    `).join('');
  }
}

function renderCalls() {
  const results = typeof ANALYSIS_RESULTS !== 'undefined' ? ANALYSIS_RESULTS : {};
  const container = document.getElementById('calls-list');
  if (!container) return;

  const entries = Object.entries(results);

  const categories = [...new Set(entries.map(([, r]) => r.category))];
  const filterBar = document.getElementById('calls-filter');
  if (filterBar) {
    filterBar.innerHTML = `
      <button class="filter-btn active" data-filter="all">Все (${entries.length})</button>
      ${categories.map(c => `<button class="filter-btn" data-filter="${c}">${getCatLabel(c)} (${entries.filter(([, r]) => r.category === c).length})</button>`).join('')}
    `;
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        container.querySelectorAll('.call-card').forEach(card => {
          card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
        });
      });
    });
  }

  container.innerHTML = entries.map(([key, r]) => {
    const catColor = CATEGORY_COLORS[r.category] || '#a29bfe';
    return `
      <div class="call-card" data-category="${r.category}" onclick="this.classList.toggle('expanded')">
        <div class="call-card-header">
          <div style="display:flex;align-items:center;gap:16px">
            <div class="category-dot" style="background:${catColor}"></div>
            <div>
              <div class="call-card-title">${leadLink(r.leadId, 'Lead ' + r.leadId)} — ${r.leadName || 'Клиент'}</div>
              <div class="call-card-meta">
                <span>${r.date}</span>
                <span>${r.durationMin} мин</span>
                <span class="badge badge-accent">${getCatLabel(r.category)}</span>
              </div>
            </div>
          </div>
          <div class="expand-icon">▼</div>
        </div>
        <div class="call-card-body">
          <div class="analysis-section">
            <div class="analysis-item">
              <div class="analysis-label" style="color:var(--danger-light)">Причина задержки</div>
              <div class="analysis-text">${r.reason || '—'}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label" style="color:var(--warning)">Возражения клиента</div>
              <div class="analysis-text">${formatObjections(r.objections)}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label" style="color:var(--info)">Действия менеджера</div>
              <div class="analysis-text">${r.managerAction || '—'}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label" style="color:var(--success-light)">Рекомендация</div>
              <div class="analysis-text">${r.recommendation || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function formatObjections(text) {
  if (!text) return '—';
  return text.split('\n')
    .filter(l => l.trim())
    .map(l => {
      const clean = l.replace(/^[-•*]\s*/, '').trim();
      return clean ? `<div class="objection-line">• ${clean}</div>` : '';
    })
    .join('');
}

function renderObjections() {
  const report = typeof REPORT_DATA !== 'undefined' ? REPORT_DATA : {};
  const container = document.getElementById('objection-themes-list');
  if (!container || !report.objectionAnalysis) return;

  container.innerHTML = report.objectionAnalysis.map(theme => `
    <div class="card">
      <div class="card-title">
        <span>${getThemeLabel(theme.theme)}</span>
        <span class="badge badge-accent" style="margin-left:12px">${theme.count} упоминаний (${theme.pct}%)</span>
      </div>
      <div class="objection-examples">
        ${theme.examples.map(ex => `
          <div class="trigger-phrase">
            <div class="phrase">${ex}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderRecommendations() {
  const report = typeof REPORT_DATA !== 'undefined' ? REPORT_DATA : {};

  const crmContainer = document.getElementById('crm-recommendations');
  if (crmContainer && report.crmRecommendations) {
    crmContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Тип</th><th>Описание</th><th>Приоритет</th></tr></thead>
          <tbody>
            ${report.crmRecommendations.map(r => `
              <tr>
                <td><span class="badge badge-info">${r.type}</span></td>
                <td>${r.description}</td>
                <td><span class="badge ${r.priority === 'high' ? 'badge-danger' : r.priority === 'medium' ? 'badge-warning' : 'badge-success'}">${r.priority}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  const topContainer = document.getElementById('top-recommendations');
  if (topContainer && report.topRecommendations) {
    topContainer.innerHTML = report.topRecommendations.map((rec, i) => `
      <div class="recommendation-item">
        <span class="rec-number">${i + 1}</span>
        <span class="rec-text">${rec}</span>
      </div>
    `).join('');
  }

  const actionContainer = document.getElementById('action-plan');
  if (actionContainer && report.actionPlan) {
    actionContainer.innerHTML = report.actionPlan.map(a => `
      <div class="action-item">
        <div class="action-week">${a.week}</div>
        <ul class="action-list">
          ${a.actions.map(act => `<li>${act}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }
}

function renderReport() {
  const report = typeof REPORT_DATA !== 'undefined' ? REPORT_DATA : {};

  const overviewEl = document.getElementById('report-overview');
  if (overviewEl && report.overview) {
    overviewEl.textContent = report.overview;
  }

  const catContainer = document.getElementById('category-breakdown');
  if (catContainer && report.categoryBreakdown) {
    catContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Категория</th><th>Кол-во</th><th>%</th><th>Инсайт</th></tr></thead>
          <tbody>
            ${report.categoryBreakdown.map(c => `
              <tr>
                <td><strong>${getCatLabel(c.category)}</strong></td>
                <td>${c.count}</td>
                <td>${c.pct}%</td>
                <td style="font-size:12px;color:var(--text-muted);max-width:400px">${c.keyInsight}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  const allCallsContainer = document.getElementById('all-calls-table');
  if (allCallsContainer && report.callDetails) {
    allCallsContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Lead</th><th>Имя</th><th>Дата</th><th>Мин</th><th>Категория</th><th>Причина</th></tr></thead>
          <tbody>
            ${report.callDetails.map(c => `
              <tr>
                <td>${leadLink(c.leadId)}</td>
                <td>${c.leadName}</td>
                <td>${c.date}</td>
                <td>${c.durationMin}</td>
                <td><span class="badge badge-accent">${getCatLabel(c.category)}</span></td>
                <td style="font-size:12px;color:var(--text-muted);max-width:300px">${c.reason}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

function renderScriptAudit() {
  const audit = typeof SCRIPT_ANALYSIS !== 'undefined' ? SCRIPT_ANALYSIS : null;
  if (!audit) return;

  const summaryEl = document.getElementById('audit-summary');
  if (summaryEl) summaryEl.textContent = audit.executiveSummary;

  const metricsEl = document.getElementById('audit-metrics');
  if (metricsEl) {
    const m = audit.keyMetrics;
    metricsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-value" style="color:var(--accent-light)">${m.totalCalls}</div>
        <div class="stat-label">звонков проанализировано</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--danger-light)">${m.jobcenterPct}%</div>
        <div class="stat-label">застряли на Jobcenter</div>
        <div class="stat-change negative">${m.jobcenterBlocked} из ${m.totalCalls}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#e17055">${m.schedulePct || 0}%</div>
        <div class="stat-label">потеряны из-за графика</div>
        <div class="stat-change negative">${m.scheduleBlocked || 0} из ${m.totalCalls}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--warning)">${m.noConcreteNextStepPct}%</div>
        <div class="stat-label">без конкретного шага</div>
        <div class="stat-change negative">${m.noConcreteNextStep} из ${m.totalCalls}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--info)">${m.languageObjections}</div>
        <div class="stat-label">возражений по языку</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--accent-light)">${m.avgDuration}</div>
        <div class="stat-label">мин средний звонок</div>
      </div>
    `;
  }

  const gapsEl = document.getElementById('audit-gaps');
  if (gapsEl) {
    gapsEl.innerHTML = audit.gaps.map(g => `
      <div class="card">
        <div class="card-title">
          <span class="badge ${g.severity === 'critical' ? 'badge-danger' : g.severity === 'high' ? 'badge-warning' : 'badge-info'}" style="margin-right:8px">${g.severity}</span>
          ${g.title}
        </div>
        <div style="display:grid;gap:12px">
          <div class="analysis-item" style="border-left-color:var(--danger)">
            <div class="analysis-label" style="color:var(--danger-light)">Проблема</div>
            <div class="analysis-text">${g.problem}</div>
          </div>
          <div class="analysis-item" style="border-left-color:var(--info)">
            <div class="analysis-label" style="color:var(--info)">В скрипте</div>
            <div class="analysis-text">${g.scriptSection}</div>
          </div>
          <div class="analysis-item" style="border-left-color:var(--warning)">
            <div class="analysis-label" style="color:var(--warning)">Данные из звонков</div>
            <div class="analysis-text">${g.realityData}</div>
          </div>
          <div style="padding:0 16px">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Примеры из звонков:</div>
            ${g.examples.map(ex => `<div class="objection-line" style="font-size:12px;color:var(--text-muted)">• ${ex}</div>`).join('')}
          </div>
          <div class="analysis-item" style="border-left-color:var(--success)">
            <div class="analysis-label" style="color:var(--success-light)">Рекомендация</div>
            <div class="analysis-text">${g.recommendation}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  const strengthsEl = document.getElementById('audit-strengths');
  if (strengthsEl) {
    strengthsEl.innerHTML = audit.scriptStrengths.map(s =>
      `<div class="recommendation-item"><span class="rec-number" style="background:var(--success)">✓</span><span class="rec-text">${s}</span></div>`
    ).join('');
  }

  const actionsEl = document.getElementById('audit-actions');
  if (actionsEl) {
    actionsEl.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Действие</th><th>Влияние</th><th>Срок</th><th>Ответственный</th></tr></thead>
          <tbody>
            ${audit.prioritizedActions.map(a => `
              <tr>
                <td><span class="badge badge-accent">${a.priority}</span></td>
                <td><strong>${a.action}</strong></td>
                <td style="font-size:12px;color:var(--success-light)">${a.impact}</td>
                <td>${a.effort}</td>
                <td>${a.owner}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

function renderNewScript() {
  const script = typeof IMPROVED_SCRIPT !== 'undefined' ? IMPROVED_SCRIPT : null;
  if (!script) return;

  const subtitle = document.getElementById('new-script-subtitle');
  if (subtitle) subtitle.textContent = script.basedOn;

  const compEl = document.getElementById('script-comparison');
  if (compEl) {
    const o = script.comparisonSummary.oldScript;
    const n = script.comparisonSummary.newScript;
    const compareRows = [
      ['Секций', o.sections, n.sections],
      ['Jobcenter-навигация', `${o.jobcenterLines} строки (${o.jobcenterPct}%)`, `${n.jobcenterLines} (~${n.jobcenterPct}%)`],
      ['Закрытие', o.closingLevels, n.closingLevels],
      ['Истории успеха', o.stories, n.stories],
      ['Urgency', `${o.urgencyPoints} (в конце)`, n.urgencyPoints],
      ['Возражений', o.objections, n.objections],
      ['Методологии продаж', o.methodologies || 0, n.methodologies || '—'],
      ['Pre-Call подготовка', o.preCallPrep || 'нет', n.preCallPrep || '—'],
      ['Тональность', o.tonality || 'нет', n.tonality || '—'],
      ['Follow-up', o.followUp || 'нет', n.followUp || '—'],
      ['Voicemail', o.voicemail || 'нет', n.voicemail || '—'],
      ['WhatsApp-шаблоны', o.whatsapp || 'нет', n.whatsapp || '—'],
      ['Хронометраж', o.timing || 'нет', n.timing || '—'],
      ['Макс. монолог', o.maxMonologue || 'нет ограничений', n.maxMonologue || '—'],
    ];
    compEl.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Параметр</th><th>Старый скрипт (v2.1)</th><th>Новый скрипт v4.0</th></tr></thead>
          <tbody>
            ${compareRows.map(([label, old, nw]) => `<tr><td>${label}</td><td>${old}</td><td><strong style="color:var(--success-light)">${nw}</strong></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  const sectionsEl = document.getElementById('script-sections');
  if (sectionsEl) {
    sectionsEl.innerHTML = script.sections.map(s => `
      <div class="card script-section ${s.isNew ? 'script-new' : ''}">
        <div class="card-title">
          ${s.isNew ? '<span class="badge badge-success" style="margin-right:8px">НОВОЕ</span>' : ''}
          ${s.title}
        </div>
        <div class="script-content">${escapeAndFormat(s.content)}</div>
        ${s.notes ? `<div class="script-notes"><strong>Изменение:</strong> ${s.notes}</div>` : ''}
        ${s.changeReason ? `<div class="script-reason"><strong>Обоснование:</strong> ${s.changeReason}</div>` : ''}
      </div>
    `).join('');
  }
}

function escapeAndFormat(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/━+\s*([^━]+?)\s*━+/g, '<div class="script-scenario-title">$1</div>')
    .replace(/📍|📋|👨‍👩‍👧|🗣|🏫|⏰|☐|✅|❌|⛔️/g, m => `<span class="script-emoji">${m}</span>`)
    .replace(/«([^»]+)»/g, '<em class="script-quote">«$1»</em>')
    .replace(/→/g, '<span style="color:var(--accent-light)">→</span>');
}
