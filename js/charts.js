function initCharts() {
  renderCategoryPie();
  renderObjectionBar();
  renderTimelineChart();
  renderDurationBar();
  renderObjectionPolar();
}

const chartColors = ['#6c5ce7', '#e74c3c', '#fdcb6e', '#74b9ff', '#a29bfe', '#00b894', '#ff6b6b'];
const chartTextColor = '#8b8fa3';
const chartGridColor = '#2a2e3d';

function renderCategoryPie() {
  const ctx = document.getElementById('categoryPieChart');
  if (!ctx || typeof CORRELATIONS_DATA === 'undefined') return;

  const data = CORRELATIONS_DATA.local.byCategory;
  const labels = Object.keys(data).map(k => {
    const map = {
      'документы_jobcenter': 'Jobcenter / Документы',
      'семья': 'Семья',
      'нет_срочности': 'Нет срочности',
      'конкуренты': 'Конкуренты',
      'другое': 'Другое',
    };
    return map[k] || k;
  });
  const values = Object.values(data);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: chartColors.slice(0, labels.length), borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: chartTextColor, font: { size: 11 }, padding: 12 } }
      },
      cutout: '65%'
    }
  });
}

function renderObjectionBar() {
  const ctx = document.getElementById('objectionBarChart');
  if (!ctx || typeof CORRELATIONS_DATA === 'undefined') return;

  const themes = CORRELATIONS_DATA.local.objectionThemes;
  const sorted = Object.entries(themes).sort((a, b) => b[1].count - a[1].count);
  const themeLabels = {
    'jobcenter_процесс': 'Jobcenter',
    'уровень_языка': 'Язык',
    'интенсивность': 'Нагрузка',
    'конкуренты': 'Конкуренты',
    'текущая_работа': 'Работа',
    'семья': 'Семья',
    'другое': 'Другое',
  };
  const labels = sorted.map(([k]) => themeLabels[k] || k);
  const values = sorted.map(([, v]) => v.count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Упоминаний',
        data: values,
        backgroundColor: chartColors.slice(0, labels.length),
        borderRadius: 6,
        barThickness: 28
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { beginAtZero: true, ticks: { color: chartTextColor, stepSize: 2 }, grid: { color: chartGridColor } },
        y: { ticks: { color: chartTextColor, font: { size: 12 } }, grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderTimelineChart() {
  const ctx = document.getElementById('timelineChart');
  if (!ctx || typeof ANALYSIS_RESULTS === 'undefined') return;

  const entries = Object.values(ANALYSIS_RESULTS);

  const byDate = {};
  entries.forEach(r => {
    const d = r.date;
    if (!byDate[d]) byDate[d] = { count: 0, totalMin: 0 };
    byDate[d].count++;
    byDate[d].totalMin += r.durationMin || 0;
  });

  const sorted = Object.entries(byDate).sort((a, b) => {
    const [da, ma, ya] = a[0].split('.');
    const [db, mb, yb] = b[0].split('.');
    return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(([d]) => d),
      datasets: [{
        label: 'Звонков',
        data: sorted.map(([, v]) => v.count),
        backgroundColor: '#6c5ce7',
        borderRadius: 4,
        barThickness: 20
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { color: chartTextColor, stepSize: 1 }, grid: { color: chartGridColor } },
        x: { ticks: { color: chartTextColor, font: { size: 10 } }, grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderDurationBar() {
  const ctx = document.getElementById('durationBarChart');
  if (!ctx || typeof ANALYSIS_RESULTS === 'undefined') return;

  const entries = Object.values(ANALYSIS_RESULTS);
  const catColors = {
    'документы_jobcenter': '#6c5ce7',
    'семья': '#e74c3c',
    'нет_срочности': '#fdcb6e',
    'конкуренты': '#74b9ff',
    'другое': '#a29bfe',
  };
  const labels = entries.map(r => r.leadName?.split(' ')[0] || `Lead ${r.leadId}`);
  const durations = entries.map(r => r.durationMin);
  const colors = entries.map(r => catColors[r.category] || '#a29bfe');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Длительность (мин)',
        data: durations,
        backgroundColor: colors,
        borderRadius: 4,
        barThickness: 24
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
        x: { ticks: { color: chartTextColor, font: { size: 10 }, maxRotation: 45 }, grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderObjectionPolar() {
  const ctx = document.getElementById('objectionPolarChart');
  if (!ctx || typeof REPORT_DATA === 'undefined') return;

  const analysis = REPORT_DATA.objectionAnalysis || [];
  const themeLabels = {
    'jobcenter_процесс': 'Jobcenter',
    'уровень_языка': 'Язык',
    'интенсивность': 'Нагрузка',
    'конкуренты': 'Конкуренты',
    'текущая_работа': 'Работа',
    'семья': 'Семья',
    'другое': 'Другое',
  };

  new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: analysis.map(a => themeLabels[a.theme] || a.theme),
      datasets: [{
        data: analysis.map(a => a.count),
        backgroundColor: chartColors.map(c => c + '80'),
        borderColor: chartColors,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          ticks: { color: chartTextColor, backdropColor: 'transparent' },
          grid: { color: chartGridColor },
          pointLabels: { color: '#e4e6ed', font: { size: 12 } }
        }
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: chartTextColor, font: { size: 11 }, padding: 10 } }
      }
    }
  });
}
