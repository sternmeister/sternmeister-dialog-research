document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderOverview();
  renderCorrelations();
  renderCalls();
  renderObjections();
  renderRecommendations();
  renderReport();
  renderExpanded();
  renderScriptAudit();
  renderNewScript();
  renderBattleScript();
  initCharts();
});

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      goToPage(item.dataset.page);
    });
  });
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = el.dataset.goto;
      if (!target) return;
      e.stopPropagation();
      goToPage(target);
    });
  });
}

function goToPage(target) {
  if (!target) return;
  const navItem = document.querySelector(`.nav-item[data-page="${target}"]`);
  const pageEl = document.getElementById(`page-${target}`);
  if (!navItem || !pageEl) return;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  navItem.classList.add('active');
  pageEl.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  'язык': 'Уровень языка',
  'недоверие': 'Недоверие / Страх',
  'jobcenter_термин': 'Jobcenter (термин)',
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
  'язык': '#0984e3',
  'недоверие': '#d63031',
  'jobcenter_термин': '#6c5ce7',
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
  const expanded = typeof EXPANDED_ANALYSIS !== 'undefined' ? EXPANDED_ANALYSIS : null;
  const report = typeof REPORT_DATA !== 'undefined' ? REPORT_DATA : {};
  const overviewText = document.getElementById('overview-text');
  if (overviewText) {
    overviewText.textContent = (expanded && expanded.overview) || report.overview || '';
  }
}

function renderCorrelations() {
  const report = typeof REPORT_DATA !== 'undefined' ? REPORT_DATA : {};
  const totalCalls = typeof CORRELATIONS_DATA !== 'undefined' ? CORRELATIONS_DATA.local.totalAnalyzed : 0;

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
                <td><strong>${row.frequency}</strong> (${row.evidence} из ${totalCalls})</td>
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
          <thead><tr><th>Параметр</th><th>Скрипт v5.0</th><th>Скрипт v6.0 (Timebox 30)</th></tr></thead>
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

function renderExpanded() {
  const data = typeof EXPANDED_ANALYSIS !== 'undefined' ? EXPANDED_ANALYSIS : null;
  if (!data) return;

  const meta = document.getElementById('expanded-meta');
  if (meta) meta.textContent = `${data.title} • ${data.source} • ${data.date}`;

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('exp-stat-sample', data.sampleSize);
  setText('exp-stat-corpus', data.uniqueLeads || `${data.totalCorpus}+`);
  setText('exp-stat-compliance', `${data.scriptComplianceV5.overall}%`);
  setText('exp-stat-new', data.newPatterns.length);
  setText('exp-overview', data.overview);

  const batchesEl = document.getElementById('exp-batches');
  if (batchesEl && data.perBatch) {
    batchesEl.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Партия</th><th>Файлы</th><th>Звонков</th><th>Успешных закрытий</th><th>Конверсия</th><th>Период</th></tr></thead>
          <tbody>
            ${data.perBatch.map(b => `
              <tr>
                <td><strong>#${b.id}</strong></td>
                <td style="font-family:monospace;font-size:12px">${b.files}</td>
                <td>${b.sample}</td>
                <td style="color:var(--success-light)"><strong>${b.successful}</strong></td>
                <td><span class="badge badge-accent">${(b.successful / b.sample * 100).toFixed(1)}%</span></td>
                <td style="font-size:12px;color:var(--text-muted)">${b.period}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  const missEl = document.getElementById('exp-what-we-miss');
  if (missEl && data.whatWeMiss) {
    missEl.innerHTML = data.whatWeMiss.map((w, i) => `
      <div class="card-inset" style="margin-bottom:14px;padding:16px;border-left:5px solid var(--danger-light);background:rgba(231,76,60,0.05)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px">
          <strong style="font-size:15px;color:var(--danger-light)">${i+1}. ${w.title}</strong>
          <span class="badge badge-danger" style="white-space:nowrap">${w.lostCount} (${w.pct}%)</span>
        </div>
        <p style="font-size:13px;color:var(--text-muted);line-height:1.7;margin:6px 0 12px 0">${w.details}</p>
        <div style="padding:10px 12px;background:rgba(46,213,115,0.08);border-left:3px solid var(--success-light);border-radius:6px;font-size:13px;line-height:1.6">
          <strong style="color:var(--success-light)">→ Как закрыть:</strong> <span style="color:var(--text-muted)">${w.whatToDo}</span>
        </div>
      </div>
    `).join('');
  }

  const planEl = document.getElementById('exp-conversion-plan');
  if (planEl && data.conversionLeverPlan) {
    const p = data.conversionLeverPlan;
    const effortLabel = (e) => ({ low: '🟢 низкий', medium: '🟡 средний', high: '🔴 высокий' }[e] || e);
    planEl.innerHTML = `
      <div class="stats-grid" style="margin-bottom:18px">
        <div class="stat-card">
          <div class="stat-value" style="color:var(--text-muted);font-size:28px">${p.currentConversion}%</div>
          <div class="stat-label">Текущая конверсия</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--success-light);font-size:28px">${p.targetConversion}%</div>
          <div class="stat-label">Целевая конверсия</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--accent-light);font-size:28px">+${p.deltaPotential}п.п.</div>
          <div class="stat-label">Потенциал роста</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--warning);font-size:28px">10</div>
          <div class="stat-label">Рычагов в плане</div>
        </div>
      </div>
      <p style="font-size:12px;color:var(--text-muted);font-style:italic;margin:0 0 14px 0">${p.note}</p>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Рычаг</th><th>Текущая потеря</th><th>Эффект</th><th>Усилие</th><th>Срок</th><th>Как</th></tr></thead>
          <tbody>
            ${p.levers.map(l => `
              <tr>
                <td><strong style="color:var(--accent-light);font-size:16px">${l.rank}</strong></td>
                <td><strong>${l.lever}</strong></td>
                <td style="font-size:12px;color:var(--danger-light)">${l.currentMiss}</td>
                <td><span class="badge badge-success">+${l.impact}п.п.</span></td>
                <td style="font-size:12px">${effortLabel(l.effort)}</td>
                <td style="font-size:12px;color:var(--text-muted)">${l.timeToImpact}</td>
                <td style="font-size:12px;color:var(--text-muted);max-width:280px">${l.explanation}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  const successEl = document.getElementById('exp-success-patterns');
  if (successEl && data.successfulClosurePatterns) {
    successEl.innerHTML = `
      <ul style="margin:0;padding-left:20px;font-size:13px;color:var(--text-muted);line-height:1.9">
        ${data.successfulClosurePatterns.map(p => `<li>${p}</li>`).join('')}
      </ul>
    `;
  }

  const reasonsList = document.getElementById('exp-reasons-list');
  if (reasonsList) {
    reasonsList.innerHTML = data.topReasons.map(r => {
      const examples = Array.isArray(r.examples) ? r.examples : [];
      return `
      <div class="card-inset" style="border-left:4px solid ${severityColor(r.severity)};margin-bottom:12px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <strong style="font-size:14px">${formatCategoryName(r.category)}</strong>
          <span class="badge ${severityBadge(r.severity)}">${r.count} (${r.pct}%) — ${r.severity}</span>
        </div>
        <p style="font-size:13px;color:var(--text-muted);margin:6px 0">${r.description}</p>
        ${examples.length ? `<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px;color:var(--accent-light)">Цитаты клиентов (${examples.length})</summary>
          <ul style="margin:8px 0 0 16px;font-size:12px;color:var(--text-muted)">
            ${examples.map(e => `<li style="margin:4px 0"><em>${e}</em></li>`).join('')}
          </ul>
        </details>` : ''}
      </div>
    `;
    }).join('');
  }

  const mistakesList = document.getElementById('exp-mistakes-list');
  if (mistakesList) {
    mistakesList.innerHTML = data.topManagerMistakes.map(m => {
      const examples = Array.isArray(m.examples) ? m.examples : [];
      return `
      <div class="card-inset" style="border-left:4px solid ${severityColor(m.severity)};margin-bottom:12px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <strong style="font-size:14px">${m.mistake}</strong>
          <span class="badge ${severityBadge(m.severity)}">${m.count} (${m.pct}%)</span>
        </div>
        ${examples.length ? `<details style="margin-top:6px"><summary style="cursor:pointer;font-size:12px;color:var(--accent-light)">Примеры (${examples.length})</summary>
          <ul style="margin:8px 0 0 16px;font-size:12px;color:var(--text-muted)">
            ${examples.map(e => `<li style="margin:4px 0">${e}</li>`).join('')}
          </ul>
        </details>` : ''}
        ${m.v5Fix ? `<div style="margin-top:8px;padding:8px;background:rgba(110,193,228,0.08);border-radius:6px;font-size:12px;color:var(--accent-light)">
          <strong>v5.0 покрытие:</strong> ${m.v5Fix}
        </div>` : ''}
      </div>
    `;
    }).join('');
  }

  const oppsList = document.getElementById('exp-opportunities-list');
  if (oppsList) {
    oppsList.innerHTML = data.topMissedOpportunities.map(o => `
      <div class="card-inset" style="margin-bottom:10px;padding:12px;border-left:3px solid var(--warning)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <strong style="font-size:13px">${o.opportunity}</strong>
          <span class="badge badge-warning">${o.count} случаев</span>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin:0">${o.description}</p>
      </div>
    `).join('');
  }

  const newPatternsEl = document.getElementById('exp-new-patterns');
  if (newPatternsEl) {
    newPatternsEl.innerHTML = data.newPatterns.map(p => `
      <div class="card-inset" style="margin-bottom:12px;padding:14px;border-left:4px solid var(--success-light)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <strong style="font-size:14px;color:var(--success-light)">🆕 ${p.pattern}</strong>
          <span class="badge badge-success">${p.occurrences} случаев</span>
        </div>
        <p style="font-size:13px;color:var(--text-muted);margin:6px 0">${p.description}</p>
        <div style="margin-top:8px;padding:8px;background:rgba(46,213,115,0.08);border-radius:6px;font-size:12px">
          <strong style="color:var(--success-light)">Рекомендация:</strong> <span style="color:var(--text-muted)">${p.recommendation}</span>
        </div>
      </div>
    `).join('');
  }

  const v6El = document.getElementById('exp-v6-improvements');
  if (v6El) {
    v6El.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Приоритет</th><th>Улучшение</th><th>Проблема</th><th>Решение</th><th>Потенциал</th></tr></thead>
          <tbody>
            ${data.v6RecommendedImprovements.map(i => `
              <tr>
                <td><span class="badge ${i.priority === 'P0' ? 'badge-danger' : i.priority === 'P1' ? 'badge-warning' : 'badge-accent'}">${i.priority}</span></td>
                <td><strong>${i.title}</strong></td>
                <td style="font-size:12px;color:var(--text-muted)">${i.problem}</td>
                <td style="font-size:12px;color:var(--text-muted)">${i.solution}</td>
                <td style="font-size:12px;color:var(--success-light)"><strong>${i.impact}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  const cmpEl = document.getElementById('exp-comparison');
  if (cmpEl) {
    const c = data.comparisonWithDetailedAnalysis;
    const confirmed = c.confirmedAtScale || c.confirmed || [];
    const newItems = c.newAtScale || c.new || [];
    cmpEl.innerHTML = `
      <div class="grid-2">
        <div>
          <h4 style="color:var(--success-light);margin:0 0 8px 0">✓ Подтверждённые паттерны на масштабе</h4>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:var(--text-muted);line-height:1.8">
            ${confirmed.map(x => `<li>${x}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 style="color:var(--warning);margin:0 0 8px 0">🆕 Новые на масштабе корпуса</h4>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:var(--text-muted);line-height:1.8">
            ${newItems.map(x => `<li>${x}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  setTimeout(() => initExpandedCharts(data), 100);
}

function severityColor(s) {
  return { critical: 'var(--danger-light)', high: 'var(--danger-light)', medium: 'var(--warning)', low: 'var(--text-muted)' }[s] || 'var(--text-muted)';
}
function severityBadge(s) {
  return { critical: 'badge-danger', high: 'badge-danger', medium: 'badge-warning', low: 'badge-accent' }[s] || 'badge-accent';
}
function formatCategoryName(c) {
  return c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function initExpandedCharts(data) {
  const reasonsCanvas = document.getElementById('expReasonsChart');
  if (reasonsCanvas && typeof Chart !== 'undefined') {
    if (reasonsCanvas._chart) reasonsCanvas._chart.destroy();
    reasonsCanvas._chart = new Chart(reasonsCanvas, {
      type: 'bar',
      data: {
        labels: data.topReasons.map(r => formatCategoryName(r.category)),
        datasets: [{
          label: 'Случаев из 1026',
          data: data.topReasons.map(r => r.count),
          backgroundColor: data.topReasons.map(r => severityRGBA(r.severity)),
          borderColor: data.topReasons.map(r => severityRGBA(r.severity, 1)),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#e5e7eb', font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  const compCanvas = document.getElementById('expComplianceChart');
  if (compCanvas && typeof Chart !== 'undefined') {
    if (compCanvas._chart) compCanvas._chart.destroy();
    compCanvas._chart = new Chart(compCanvas, {
      type: 'radar',
      data: {
        labels: data.scriptComplianceV5.elements.map(e => e.element.replace(/\(.+?\)/, '').trim()),
        datasets: [{
          label: 'Соответствие v5.0 (%)',
          data: data.scriptComplianceV5.elements.map(e => e.compliance),
          backgroundColor: 'rgba(110, 193, 228, 0.2)',
          borderColor: 'rgba(110, 193, 228, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(110, 193, 228, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e5e7eb' } } },
        scales: {
          r: {
            angleLines: { color: 'rgba(255,255,255,0.1)' },
            grid: { color: 'rgba(255,255,255,0.1)' },
            pointLabels: { color: '#e5e7eb', font: { size: 11 } },
            ticks: { color: '#9ca3af', backdropColor: 'transparent' },
            min: 0,
            max: 100
          }
        }
      }
    });
  }
}

function severityRGBA(s, alpha = 0.7) {
  const colors = {
    critical: `rgba(231, 76, 60, ${alpha})`,
    high: `rgba(230, 126, 34, ${alpha})`,
    medium: `rgba(241, 196, 15, ${alpha})`,
    low: `rgba(149, 165, 166, ${alpha})`
  };
  return colors[s] || colors.low;
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

// =====================================================
// БОЕВОЙ СКРИПТ v5.1 — для менеджеров
// =====================================================

const BS_STATE = { tab: 'stages', search: '', expanded: new Set() };

function renderBattleScript() {
  if (typeof BATTLE_SCRIPT === 'undefined') return;
  const m = BATTLE_SCRIPT.meta;

  const tEl = document.getElementById('bs-title');
  if (tEl) tEl.textContent = m.title;
  const sEl = document.getElementById('bs-subtitle');
  if (sEl) sEl.textContent = `${m.subtitle} · версия ${m.version} · ${m.date}`;
  const tgEl = document.getElementById('bs-target');
  if (tgEl) tgEl.textContent = `Цель: ${m.target}`;
  const topEl = document.getElementById('bs-top');
  if (topEl) topEl.textContent = `TOP: ${m.topPerformer}`;

  document.querySelectorAll('.bs-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.bs-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      BS_STATE.tab = tab.dataset.tab;
      renderBSContent();
    });
  });

  const search = document.getElementById('bs-search');
  if (search) {
    search.addEventListener('input', (e) => {
      BS_STATE.search = e.target.value.toLowerCase().trim();
      renderBSContent();
    });
  }

  renderBSContent();
}

function renderBSContent() {
  const root = document.getElementById('bs-content');
  if (!root) return;
  const t = BS_STATE.tab;
  if (t === 'stages') root.innerHTML = renderBSStages();
  else if (t === 'objections') root.innerHTML = renderBSObjections();
  else if (t === 'segments') root.innerHTML = renderBSSegments();
  else if (t === 'stories') root.innerHTML = renderBSStories();
  else if (t === 'whatsapp') root.innerHTML = renderBSWhatsapp();
  else if (t === 'checklist') root.innerHTML = renderBSChecklist();
  else if (t === 'cheatsheet') root.innerHTML = renderBSCheatsheet();
  attachBSCopyHandlers();
  attachBSToggleHandlers();
  attachBSChecklistHandlers();
}

function bsMatchSearch(...texts) {
  const q = BS_STATE.search;
  if (!q) return true;
  return texts.some(t => (t || '').toLowerCase().includes(q));
}

function bsCopyButton(text) {
  const safe = text.replace(/`/g, '\\`').replace(/\\/g, '\\\\').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  return `<button class="bs-copy" data-copy="${safe}" title="Скопировать в буфер">📋 Копировать</button>`;
}

function attachBSCopyHandlers() {
  document.querySelectorAll('.bs-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
      try {
        await navigator.clipboard.writeText(text);
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Скопировано';
        btn.classList.add('bs-copy-ok');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('bs-copy-ok'); }, 1400);
      } catch (e) {
        btn.innerHTML = '❌ Ошибка';
      }
    });
  });
}

function attachBSToggleHandlers() {
  document.querySelectorAll('.bs-stage-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.bs-stage');
      const id = card.dataset.id;
      card.classList.toggle('expanded');
      if (card.classList.contains('expanded')) BS_STATE.expanded.add(id);
      else BS_STATE.expanded.delete(id);
    });
  });
  document.querySelectorAll('.bs-obj-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.bs-obj').classList.toggle('expanded');
    });
  });
}

function attachBSChecklistHandlers() {
  const items = document.querySelectorAll('.bs-check-item');
  const total = document.getElementById('bs-check-total');
  if (!items.length || !total) return;
  const max = BATTLE_SCRIPT.checklist.reduce((s, g) => s + g.items.reduce((s2, i) => s2 + i.points, 0), 0);
  const update = () => {
    let sum = 0;
    items.forEach(it => {
      if (it.classList.contains('checked')) sum += parseInt(it.dataset.points, 10);
    });
    total.textContent = sum;
    const pct = sum / max;
    let level = '🥉 Средне';
    let cls = 'badge-warning';
    if (pct >= 0.8) { level = '🥇 Топ'; cls = 'badge-success'; }
    else if (pct >= 0.6) { level = '🥈 Хорошо'; cls = 'badge-success'; }
    else if (pct < 0.4) { level = '⚠️ Коучинг'; cls = 'badge-danger'; }
    const lvlEl = document.getElementById('bs-check-level');
    if (lvlEl) { lvlEl.textContent = level; lvlEl.className = `badge ${cls}`; }
  };
  items.forEach(it => {
    it.addEventListener('click', () => { it.classList.toggle('checked'); update(); });
  });
  update();
}

function bsRenderBlock(b) {
  const text = (b.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const formatted = text.replace(/\n/g, '<br>');
  if (b.type === 'tip') {
    return `<div class="bs-block bs-block-tip">
      <div class="bs-block-title">💡 ${b.title || 'Совет'}</div>
      <div class="bs-block-text">${formatted}</div>
    </div>`;
  }
  if (b.type === 'warning') {
    return `<div class="bs-block bs-block-warning">
      <div class="bs-block-title">⚠️ ${b.title || ''}</div>
      <div class="bs-block-text">${formatted}</div>
    </div>`;
  }
  if (b.type === 'checklist') {
    return `<div class="bs-block bs-block-checklist">
      <div class="bs-block-title">${b.title || ''}</div>
      <ol class="bs-list">${b.items.map(i => `<li>${i}</li>`).join('')}</ol>
    </div>`;
  }
  return `<div class="bs-block bs-block-script">
    <div class="bs-block-head">
      <div class="bs-block-title">${b.title || ''}</div>
      ${bsCopyButton(b.text || '')}
    </div>
    <div class="bs-block-text bs-quote">${formatted}</div>
    ${b.why ? `<div class="bs-why"><strong>Почему:</strong> ${b.why.replace(/\n/g, '<br>')}</div>` : ''}
  </div>`;
}

function renderBSStages() {
  const stages = BATTLE_SCRIPT.stages.filter(s => {
    const blocksText = s.blocks.map(b => (b.title || '') + ' ' + (b.text || '') + ' ' + (b.items || []).join(' ')).join(' ');
    return bsMatchSearch(s.title, s.subtitle, blocksText);
  });
  if (!stages.length) return `<div class="card">Ничего не найдено по запросу «${BS_STATE.search}»</div>`;

  return stages.map((s, i) => {
    const expanded = BS_STATE.expanded.has(s.id) || BS_STATE.search;
    const isNew = s.isNew ? '<span class="badge badge-success" style="margin-left:8px">НОВОЕ v5.1</span>' : '';
    const hasKey = s.blocks.some(b => b.isKey);
    const keyBadge = hasKey ? '<span class="badge badge-warning" style="margin-left:8px">⭐ KEY</span>' : '';
    return `<div class="bs-stage ${expanded ? 'expanded' : ''}" data-id="${s.id}">
      <div class="bs-stage-header">
        <div class="bs-stage-num">${i + 1}</div>
        <div class="bs-stage-icon">${s.icon}</div>
        <div class="bs-stage-info">
          <div class="bs-stage-title">${s.title}${isNew}${keyBadge}</div>
          <div class="bs-stage-subtitle">${s.subtitle} · ⏱ ${s.time}</div>
        </div>
        <div class="bs-stage-toggle">▼</div>
      </div>
      <div class="bs-stage-body">
        ${s.blocks.map(bsRenderBlock).join('')}
      </div>
    </div>`;
  }).join('');
}

function renderBSObjections() {
  const objs = BATTLE_SCRIPT.objections.filter(o => bsMatchSearch(o.title, o.response, o.cat, o.why));
  const cats = [...new Set(BATTLE_SCRIPT.objections.map(o => o.cat))];

  if (!objs.length) return `<div class="card">Ничего не найдено по запросу «${BS_STATE.search}»</div>`;

  return `<div class="bs-obj-intro card">
    <strong>Voss-протокол перед каждой отработкой:</strong>
    <ol class="bs-list">
      <li>ПАУЗА 5 секунд после возражения</li>
      <li>MIRROR — повтори последние 3 слова с восходящей интонацией</li>
      <li>LABEL — назови эмоцию: «Похоже, вас цена смутила»</li>
      <li>CALIBRATED Q — «Что заставляет вас так говорить?»</li>
      <li>И только потом — формула отработки</li>
    </ol>
    <div style="margin-top:12px;color:var(--text-muted);font-size:13px">«Возражения крепнут от спора, умирают от согласия» (Voss)</div>
  </div>
  ${objs.map(o => {
    const newBadge = o.isNew ? '<span class="badge badge-success" style="margin-left:6px">НОВОЕ</span>' : '';
    const keyBadge = o.isKey ? '<span class="badge badge-warning" style="margin-left:6px">⭐ KEY</span>' : '';
    const text = (o.response || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    return `<div class="bs-obj">
      <div class="bs-obj-header">
        <div class="bs-obj-num">#${o.num}</div>
        <div class="bs-obj-cat">${o.cat}</div>
        <div class="bs-obj-title">${o.title}${newBadge}${keyBadge}</div>
        <div class="bs-stage-toggle">▼</div>
      </div>
      <div class="bs-obj-body">
        <div class="bs-block-head">
          <div class="bs-block-title">Что говорить</div>
          ${bsCopyButton(o.response || '')}
        </div>
        <div class="bs-quote">${text}</div>
        ${o.why ? `<div class="bs-why"><strong>Почему:</strong> ${o.why}</div>` : ''}
      </div>
    </div>`;
  }).join('')}`;
}

function renderBSSegments() {
  const segs = BATTLE_SCRIPT.segments.filter(s => {
    const blocksText = s.blocks.map(b => b.title + ' ' + b.text).join(' ');
    return bsMatchSearch(s.title, blocksText, s.kpi);
  });
  if (!segs.length) return `<div class="card">Ничего не найдено по запросу «${BS_STATE.search}»</div>`;

  return segs.map(s => `
    <div class="bs-seg card">
      <div class="bs-seg-header">
        <div class="bs-seg-icon">${s.icon}</div>
        <div>
          <div class="bs-seg-title">${s.title}</div>
          ${s.kpi ? `<div class="bs-seg-kpi">${s.kpi}</div>` : ''}
        </div>
      </div>
      <div class="bs-seg-body">
        ${s.blocks.map(b => `
          <div class="bs-block bs-block-script">
            <div class="bs-block-head">
              <div class="bs-block-title">${b.title}</div>
              ${bsCopyButton(b.text)}
            </div>
            <div class="bs-quote">${b.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderBSStories() {
  const stories = BATTLE_SCRIPT.stories.filter(s => bsMatchSearch(s.name, s.text, s.use, s.meta));
  if (!stories.length) return `<div class="card">Ничего не найдено по запросу «${BS_STATE.search}»</div>`;

  return `<div class="bs-stories-intro card" style="border-left:3px solid var(--warning)">
    <strong>⭐ Правило:</strong> минимум 1 история с ИМЕНЕМ выпускника в каждом звонке. <strong>+3 балла</strong> в чек-листе. Подобрана под сегмент = +2 балла. Выучить наизусть, не подсматривать в карточку.
  </div>
  ${stories.map(s => `
    <div class="bs-story card">
      <div class="bs-story-header">
        <div class="bs-story-icon">${s.icon}</div>
        <div>
          <div class="bs-story-name">${s.name}</div>
          <div class="bs-story-meta">${s.meta}</div>
        </div>
        ${bsCopyButton(s.text)}
      </div>
      <div class="bs-quote">${s.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
      <div class="bs-why"><strong>Использование:</strong> ${s.use}</div>
    </div>
  `).join('')}`;
}

function renderBSWhatsapp() {
  const w = BATTLE_SCRIPT.whatsapp;
  const cadence = w.cadence.filter(c => bsMatchSearch(c.day, c.text, c.note));
  const templates = w.templates.filter(t => bsMatchSearch(t.title, t.text, t.note));

  return `<div class="card" style="border-left:3px solid var(--success)">
    <strong>⭐ Михолап signature 92.6%</strong> — секрет TOP-перформера команды (Termin 22.1%). WhatsApp ВО ВРЕМЯ звонка, не после. KEY: +3 балла в чек-листе.
  </div>
  <h3 class="bs-section-title">Каденс касаний (7 шагов)</h3>
  ${cadence.map(c => `
    <div class="bs-cadence card">
      <div class="bs-block-head">
        <div class="bs-cadence-day">${c.day}</div>
        ${bsCopyButton(c.text)}
      </div>
      <div class="bs-quote">${c.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
      <div class="bs-why">${c.note}</div>
    </div>
  `).join('')}
  <h3 class="bs-section-title">Готовые шаблоны (3 шт)</h3>
  ${templates.map(t => `
    <div class="bs-tpl card">
      <div class="bs-block-head">
        <div class="bs-tpl-title">${t.title}</div>
        ${bsCopyButton(t.text)}
      </div>
      <div class="bs-quote">${t.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
      <div class="bs-why">${t.note}</div>
    </div>
  `).join('')}`;
}

function renderBSChecklist() {
  const groups = BATTLE_SCRIPT.checklist;
  const max = groups.reduce((s, g) => s + g.items.reduce((s2, i) => s2 + i.points, 0), 0);
  return `<div class="bs-check-summary card">
    <div class="bs-check-total-wrap">
      <div class="bs-check-total-num"><span id="bs-check-total">0</span> / ${max}</div>
      <div class="bs-check-total-label">Mock-call evaluation</div>
    </div>
    <div class="bs-check-levels">
      <div><span class="badge badge-success">🥇 ${Math.round(max*0.8)}+</span> Топ</div>
      <div><span class="badge badge-success">🥈 ${Math.round(max*0.6)}–${Math.round(max*0.8)-1}</span> Хорошо</div>
      <div><span class="badge badge-warning">🥉 ${Math.round(max*0.4)}–${Math.round(max*0.6)-1}</span> Средне</div>
      <div><span class="badge badge-danger">&lt;${Math.round(max*0.4)}</span> Коучинг</div>
    </div>
    <div class="bs-check-result">Ваш уровень: <span class="badge" id="bs-check-level">—</span></div>
  </div>
  ${groups.map(g => `
    <div class="bs-check-group card">
      <div class="bs-check-group-title">${g.group}</div>
      ${g.items.map(it => `
        <div class="bs-check-item ${it.key ? 'bs-check-key' : ''}" data-points="${it.points}">
          <div class="bs-check-box">☐</div>
          <div class="bs-check-text">${it.text}</div>
          <div class="bs-check-points">+${it.points}</div>
          ${it.key ? '<div class="bs-check-keytag">KEY</div>' : ''}
        </div>
      `).join('')}
    </div>
  `).join('')}`;
}

function renderBSCheatsheet() {
  const c = BATTLE_SCRIPT.cheatsheet;
  return `<div class="bs-cheat-grid">
    <div class="card bs-cheat-card bs-cheat-must">
      <div class="card-title" style="color:var(--success-light)">✅ ОБЯЗАТЕЛЬНО СКАЗАТЬ (12)</div>
      <ol class="bs-cheat-list">${c.must_say.map(i => `<li>${i}</li>`).join('')}</ol>
    </div>
    <div class="card bs-cheat-card bs-cheat-mustnot">
      <div class="card-title" style="color:var(--danger-light)">❌ КАТЕГОРИЧЕСКИ НЕЛЬЗЯ (8)</div>
      <ol class="bs-cheat-list">${c.must_not.map(i => `<li>${i}</li>`).join('')}</ol>
    </div>
    <div class="card bs-cheat-card bs-cheat-voss">
      <div class="card-title" style="color:var(--accent-light)">🛡 VOSS-протокол на возражения (5 шагов)</div>
      <ol class="bs-cheat-list bs-cheat-voss-list">${c.voss_protocol.map(i => `<li>${i}</li>`).join('')}</ol>
    </div>
  </div>`;
}
