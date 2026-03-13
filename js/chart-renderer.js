/*
 * chart-renderer.js — Renders charts from data/chart-data.json using Chart.js
 *
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1"></script>
 *   <script src="/js/chart-renderer.js"></script>
 *   <div id="my-chart" style="max-width:600px"></div>
 *   <script>renderChart('my-chart', 'automation-by-role');</script>
 *
 * Requires Chart.js 4.x loaded before this script.
 */

(function () {
  'use strict';

  var DATA_URL = '/data/chart-data.json';
  var _cache = null;

  var PALETTE = [
    '#D4A05A', // gold
    '#E07A5F', // coral
    '#5B8FA8', // river
    '#6B8F71', // forest
    '#9B8EC4', // lavender
    '#D4785C', // amber
    '#4E9FAF', // teal
    '#C4A76C'  // sand
  ];

  function fetchData() {
    if (_cache) return _cache;
    _cache = fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load chart-data.json: ' + res.status);
        return res.json();
      });
    return _cache;
  }

  function applyDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#94909A';
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    Chart.defaults.font.size = 11;
  }

  function tooltipConfig() {
    return {
      backgroundColor: '#0E1219',
      borderColor: 'rgba(212,160,90,0.3)',
      borderWidth: 1,
      titleColor: '#D4A05A',
      bodyColor: '#EAE7E3',
      padding: 12
    };
  }

  function buildBarChart(ctx, entry) {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: entry.data_values.map(function (d) { return d.label; }),
        datasets: [{
          label: entry.topic_tags[0] || entry.id,
          data: entry.data_values.map(function (d) { return d.value; }),
          backgroundColor: entry.data_values.map(function (_, i) { return PALETTE[i % PALETTE.length]; }),
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: tooltipConfig(),
          title: {
            display: true,
            text: entry.quote,
            color: '#EAE7E3',
            font: { size: 12, style: 'italic', weight: 'normal' },
            padding: { bottom: 16 }
          },
          subtitle: {
            display: true,
            text: entry.speaker + ' — ' + entry.source.podcast + ' ' + entry.source.episode,
            color: '#94909A',
            font: { size: 10 },
            padding: { bottom: 8 }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94909A' } },
          y: { grid: { color: 'rgba(148,144,154,0.1)' }, ticks: { color: '#94909A' } }
        }
      }
    });
  }

  function buildLineChart(ctx, entry) {
    var datasets = [{
      label: entry.topic_tags[0] || entry.id,
      data: entry.data_values.map(function (d) { return d.value; }),
      borderColor: PALETTE[0],
      backgroundColor: 'rgba(212,160,90,0.1)',
      fill: true,
      tension: 0.35,
      pointBackgroundColor: PALETTE[0],
      pointRadius: 4
    }];

    var hasSecondary = entry.data_values.some(function (d) { return d.secondary != null; });
    if (hasSecondary) {
      datasets.push({
        label: 'Power (GW)',
        data: entry.data_values.map(function (d) { return d.secondary; }),
        borderColor: PALETTE[2],
        backgroundColor: 'rgba(91,143,168,0.1)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: PALETTE[2],
        pointRadius: 4
      });
    }

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: entry.data_values.map(function (d) { return d.label; }),
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: hasSecondary, labels: { color: '#94909A' } },
          tooltip: tooltipConfig(),
          title: {
            display: true,
            text: entry.quote,
            color: '#EAE7E3',
            font: { size: 12, style: 'italic', weight: 'normal' },
            padding: { bottom: 16 }
          },
          subtitle: {
            display: true,
            text: entry.speaker + ' — ' + entry.source.podcast + ' ' + entry.source.episode,
            color: '#94909A',
            font: { size: 10 },
            padding: { bottom: 8 }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94909A' } },
          y: { grid: { color: 'rgba(148,144,154,0.1)' }, ticks: { color: '#94909A' } }
        }
      }
    });
  }

  function buildDoughnutChart(ctx, entry) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: entry.data_values.map(function (d) { return d.label; }),
        datasets: [{
          data: entry.data_values.map(function (d) { return d.value; }),
          backgroundColor: entry.data_values.map(function (_, i) { return PALETTE[i % PALETTE.length]; }),
          borderColor: '#07090E',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94909A', padding: 12 } },
          tooltip: tooltipConfig(),
          title: {
            display: true,
            text: entry.quote,
            color: '#EAE7E3',
            font: { size: 12, style: 'italic', weight: 'normal' },
            padding: { bottom: 16 }
          },
          subtitle: {
            display: true,
            text: entry.speaker + ' — ' + entry.source.podcast + ' ' + entry.source.episode,
            color: '#94909A',
            font: { size: 10 },
            padding: { bottom: 8 }
          }
        }
      }
    });
  }

  var builders = {
    bar: buildBarChart,
    line: buildLineChart,
    doughnut: buildDoughnutChart
  };

  /**
   * renderChart — Fetch chart-data.json and render a Chart.js chart.
   * @param {string} containerId  The DOM element id to render into.
   * @param {string} dataId       The `id` field from chart-data.json.
   */
  function renderChart(containerId, dataId) {
    var container = document.getElementById(containerId);
    if (!container) {
      console.warn('renderChart: element #' + containerId + ' not found');
      return;
    }

    if (typeof Chart === 'undefined') {
      console.error('renderChart: Chart.js is not loaded');
      return;
    }

    applyDefaults();

    var canvas = document.createElement('canvas');
    container.appendChild(canvas);

    fetchData().then(function (entries) {
      var entry = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].id === dataId) { entry = entries[i]; break; }
      }
      if (!entry) {
        console.warn('renderChart: no entry with id "' + dataId + '"');
        return;
      }

      var build = builders[entry.chart_type] || builders.bar;
      build(canvas.getContext('2d'), entry);
    }).catch(function (err) {
      console.error('renderChart error:', err);
    });
  }

  window.renderChart = renderChart;
})();
