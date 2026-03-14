const DATA_URL = new URL("./task-feed.sample.json", import.meta.url);

const STATUS_META = {
  pending: { label: "Pending", className: "status-pending" },
  running: { label: "Running", className: "status-running" },
  success: { label: "Success", className: "status-success" },
  complete: { label: "Complete", className: "status-success" },
  partial: { label: "Partial", className: "status-partial" },
  failed: { label: "Failed", className: "status-failed" },
  error: { label: "Error", className: "status-failed" },
  timeout: { label: "Timeout", className: "status-timeout" }
};

const TERMINAL_STATUSES = new Set(["success", "complete", "partial", "failed", "error", "timeout"]);
const SUCCESS_STATUSES = new Set(["success", "complete"]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEffectiveStatus(task) {
  return task.observed_status || task.dispatch_status;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 10 ? 2 : 0,
    maximumFractionDigits: 2
  }).format(value);
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "n/a";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return secs ? `${hours}h ${remMins}m ${secs}s` : `${hours}h ${remMins}m`;
  }
  return secs ? `${mins}m ${secs}s` : `${mins}m`;
}

function formatTimestamp(timestamp, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone
  }).format(new Date(timestamp));
}

function getSyncLabel(syncState) {
  if (syncState === "completion_only") {
    return "Completion received, dispatch table still pending";
  }
  if (syncState === "dispatch_only") {
    return "Dispatched, waiting on completion signal";
  }
  return "Dispatch and completion in sync";
}

export function summarizeTasks(data) {
  const start = new Date(data.window.start).getTime();
  const end = new Date(data.window.end).getTime();
  const tasks = data.tasks.slice();
  const tasksToday = tasks.filter((task) => {
    const dispatchedAt = new Date(task.dispatched_at).getTime();
    return dispatchedAt >= start && dispatchedAt < end;
  });
  const completedTasks = tasks.filter((task) => TERMINAL_STATUSES.has(getEffectiveStatus(task)));
  const successfulTasks = completedTasks.filter((task) => SUCCESS_STATUSES.has(getEffectiveStatus(task)));
  const durations = completedTasks
    .map((task) => task.duration_seconds)
    .filter((value) => Number.isFinite(value));
  const totalDuration = durations.reduce((sum, value) => sum + value, 0);
  const totalCost = tasks.reduce((sum, task) => sum + (Number.isFinite(task.cost_usd) ? task.cost_usd : 0), 0);
  const pendingCount = tasks.filter((task) => getEffectiveStatus(task) === "pending" || getEffectiveStatus(task) === "running").length;

  return {
    tasksToday: tasksToday.length,
    totalCost,
    successRate: completedTasks.length ? successfulTasks.length / completedTasks.length : 0,
    avgDurationSeconds: durations.length ? Math.round(totalDuration / durations.length) : null,
    completedCount: completedTasks.length,
    successfulCount: successfulTasks.length,
    pendingCount
  };
}

function renderStats(root, data, summary) {
  root.innerHTML = `
    <div class="ops-stat-card">
      <span class="ops-stat-label">Tasks Today</span>
      <strong class="ops-stat-value">${summary.tasksToday}</strong>
      <span class="ops-stat-note">${escapeHtml(data.window.label)}</span>
    </div>
    <div class="ops-stat-card">
      <span class="ops-stat-label">Total Cost</span>
      <strong class="ops-stat-value">${formatMoney(summary.totalCost)}</strong>
      <span class="ops-stat-note">${summary.completedCount} completed loops with observed cost</span>
    </div>
    <div class="ops-stat-card">
      <span class="ops-stat-label">Success Rate</span>
      <strong class="ops-stat-value">${Math.round(summary.successRate * 100)}%</strong>
      <span class="ops-stat-note">${summary.successfulCount} of ${summary.completedCount} completed tasks</span>
    </div>
    <div class="ops-stat-card">
      <span class="ops-stat-label">Avg Duration</span>
      <strong class="ops-stat-value">${summary.avgDurationSeconds == null ? "n/a" : formatDuration(summary.avgDurationSeconds)}</strong>
      <span class="ops-stat-note">${summary.pendingCount} tasks still open or awaiting sync</span>
    </div>
  `;
}

function renderWorkflow(root, workflow, summary) {
  const stepMetrics = [
    `${summary.tasksToday} tasks dispatched`,
    `${summary.completedCount} completion payloads received`,
    `${summary.pendingCount} tasks still awaiting closure`
  ];

  root.innerHTML = `
    <div class="ops-workflow-frame">
      <div class="ops-workflow-steps">
        ${workflow.steps
          .slice(0, 3)
          .map(
            (step, index) => `
              <article class="ops-workflow-node">
                <span class="ops-workflow-actor">${escapeHtml(step.actor)}</span>
                <h3>${escapeHtml(step.label)}</h3>
                <p>${escapeHtml(step.detail)}</p>
                <div class="ops-workflow-metric">${escapeHtml(stepMetrics[index] || workflow.loop_note)}</div>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="ops-workflow-return">
        <span class="ops-workflow-return-line"></span>
        <span class="ops-workflow-return-copy">${escapeHtml(workflow.loop_note)}</span>
      </div>
    </div>
  `;
}

function renderFeed(root, data) {
  const items = data.tasks
    .map((task) => {
      const status = getEffectiveStatus(task);
      const meta = STATUS_META[status] || STATUS_META.pending;
      const chips = [
        { label: task.backend.toUpperCase(), className: "task-chip task-chip-neutral" },
        { label: task.repo, className: "task-chip task-chip-neutral" }
      ];

      if (Number.isFinite(task.duration_seconds)) {
        chips.push({ label: formatDuration(task.duration_seconds), className: "task-chip task-chip-neutral" });
      }
      if (Number.isFinite(task.cost_usd)) {
        chips.push({ label: formatMoney(task.cost_usd), className: "task-chip task-chip-cost" });
      }
      if (task.commit_hash) {
        chips.push({ label: `commit ${task.commit_hash}`, className: "task-chip task-chip-neutral" });
      }
      if (task.depends_on.length) {
        chips.push({ label: `depends on ${task.depends_on.length}`, className: "task-chip task-chip-neutral" });
      }

      return `
        <article class="task-feed-card ${meta.className}">
          <div class="task-feed-card-top">
            <div>
              <div class="task-feed-time">${escapeHtml(formatTimestamp(task.dispatched_at, data.timezone))}</div>
              <h3 class="task-feed-title">${escapeHtml(task.title)}</h3>
            </div>
            <span class="task-feed-status ${meta.className}">${escapeHtml(meta.label)}</span>
          </div>
          <div class="task-feed-id">${escapeHtml(task.task_id)}</div>
          <p class="task-feed-summary">${escapeHtml(task.result_summary || task.prompt_excerpt)}</p>
          <div class="task-feed-chips">
            ${chips
              .map((chip) => `<span class="${chip.className}">${escapeHtml(chip.label)}</span>`)
              .join("")}
          </div>
          <div class="task-feed-footer">
            <span class="task-feed-sync">${escapeHtml(getSyncLabel(task.sync_state))}</span>
            ${task.thread_ref ? `<span class="task-feed-thread">${escapeHtml(task.thread_ref)}</span>` : ""}
          </div>
        </article>
      `;
    })
    .join("");

  root.innerHTML = items;
}

function renderMeta(root, data, summary) {
  root.innerHTML = `
    <p class="ops-panel-kicker">Schema-driven feed</p>
    <h3>Composite task state</h3>
    <p>The feed keeps raw dispatch rows intact and layers completion-side observations on top. That matches the current March 13, 2026 ops reality: completions are landing, but the VPS table is still lagging.</p>
    <div class="ops-meta-stack">
      <div class="ops-meta-row">
        <span>Status rule</span>
        <strong>${escapeHtml(data.source.status_precedence.replace(/_/g, " "))}</strong>
      </div>
      <div class="ops-meta-row">
        <span>Primary table</span>
        <strong>${escapeHtml(data.source.primary_table)}</strong>
      </div>
      <div class="ops-meta-row">
        <span>Observed fields</span>
        <strong>${data.source.completion_fields.length}</strong>
      </div>
      <div class="ops-meta-row">
        <span>Completion-only rows</span>
        <strong>${data.tasks.filter((task) => task.sync_state === "completion_only").length}</strong>
      </div>
    </div>
    <div class="ops-meta-links">
      <a href="/build/task-feed.schema.json">Schema</a>
      <a href="/build/task-feed.sample.json">Sample JSON</a>
    </div>
    <p class="ops-meta-caption">Average duration is computed from completed tasks only. Cost is based on observed completion payloads with numeric `cost_usd`.</p>
  `;
}

function setGeneratedAt(root, generatedAt, timezone) {
  root.textContent = `Feed snapshot ${formatTimestamp(generatedAt, timezone)}`;
}

async function loadData(url = DATA_URL) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load task feed (${response.status})`);
  }
  return response.json();
}

export async function initTaskFeed(options = {}) {
  const statsRoot = document.getElementById(options.statsId || "build-task-stats");
  const feedRoot = document.getElementById(options.feedId || "build-task-feed");
  const workflowRoot = document.getElementById(options.workflowId || "build-workflow-loop");
  const metaRoot = document.getElementById(options.metaId || "build-task-meta");
  const generatedRoot = document.getElementById(options.generatedId || "build-task-generated");

  if (!statsRoot || !feedRoot || !workflowRoot || !metaRoot || !generatedRoot) {
    return;
  }

  const render = async () => {
    const data = await loadData(options.dataUrl || DATA_URL);
    const summary = summarizeTasks(data);
    renderStats(statsRoot, data, summary);
    renderWorkflow(workflowRoot, data.workflow, summary);
    renderFeed(feedRoot, data);
    renderMeta(metaRoot, data, summary);
    setGeneratedAt(generatedRoot, data.generated_at, data.timezone);
  };

  try {
    await render();
  } catch (error) {
    feedRoot.innerHTML = `<div class="task-feed-error">${escapeHtml(error.message)}</div>`;
    return;
  }

  if (options.pollMs !== 0) {
    window.setInterval(() => {
      render().catch(() => {});
    }, options.pollMs || 60000);
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initTaskFeed().catch(() => {});
    });
  } else {
    initTaskFeed().catch(() => {});
  }
}
