import { marked } from 'marked';

interface ActiveTask {
  id: string;
  stepOrder: number;
  instruction: string;
  maxTimeLimit: number;
  taskType: string;
  choices: string[];
  ratingMin: number | null;
  ratingMax: number | null;
  ratingMinLabel: string | null;
  ratingMaxLabel: string | null;
}

interface ActiveJob {
  id: string;
  campaign: {
    targetUrl: string;
    scenario?: string;
    tasks: ActiveTask[];
  };
}

let currentJob: ActiveJob | null = null;
let currentTaskIndex = 0;

// Tracks the in-session structured answer for current task (locked on submit)
let currentStructuredAnswer: { type: string; value: string | number } | null = null;

type TaskState = 'READY' | 'RECORDING' | 'UPLOADING';
let taskState: TaskState = 'READY';
let submitting = false;
let timerInterval: any = null;
let remainingTime = 0;
let uploadProgress = 0;

function injectWelcomeModal() {
  if (!currentJob || document.getElementById('ut-welcome-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'ut-welcome-modal';
  Object.assign(modal.style, {
    position: 'fixed',
    inset: '0',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9999999',
    fontFamily: 'system-ui, sans-serif',
    opacity: '1'
  });

  const content = document.createElement('div');
  Object.assign(content.style, {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    opacity: '1'
  });

  const scenarioText = currentJob.campaign.scenario || 'Please follow the instructions on the bottom right to complete the test.';
  const htmlScenario = marked.parse(scenarioText) as string;

  content.innerHTML = `
    <h2 style="margin-top:0; color:#111827; font-size:24px;">Welcome to this Usability Test</h2>
    <div style="margin:24px 0; color:#374151; font-size:16px; line-height:1.5;">
      ${htmlScenario}
    </div>
    <button id="ut-understand-btn" style="width:100%; background-color:#2563eb !important; color:white !important; border:none !important; padding:12px !important; border-radius:8px !important; cursor:pointer !important; font-weight:bold !important; font-size:16px !important; opacity: 1 !important;">I Understand &amp; Continue</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  document.getElementById('ut-understand-btn')!.onclick = () => {
    modal.style.display = 'none';
  };
}

function getTaskTypeBadge(taskType: string): string {
  if (taskType === 'MULTIPLE_CHOICE') return '☑️ Multiple Choice';
  if (taskType === 'RATING_SCALE') return '⭐ Rating Scale';
  return '🎙️ Free Response';
}

/** Render the task-type-specific answer UI inside the overlay */
function renderAnswerUI(task: ActiveTask): string {
  if (taskState !== 'RECORDING') return '';

  if (task.taskType === 'MULTIPLE_CHOICE' && task.choices.length > 0) {
    const choicesHtml = task.choices
      .map((choice, i) => `
        <label style="display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:6px; border:2px solid #e5e7eb; cursor:pointer; font-size:13px; background:white; margin-bottom:6px; transition:border-color 0.15s;"
          id="ut-choice-label-${i}">
          <input type="radio" name="ut-mc-choice" value="${escapeHtml(choice)}" 
            style="accent-color:#2563eb; cursor:pointer;"
            onchange="window.__utSelectChoice(${i}, '${escapeJs(choice)}')"
          />
          <span style="color:#1f2937; font-weight:500;">${escapeHtml(choice)}</span>
        </label>
      `)
      .join('');

    return `
      <div id="ut-answer-ui" style="margin-bottom:10px;">
        <p style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280; margin-bottom:8px;">Select your answer:</p>
        <div id="ut-choices">${choicesHtml}</div>
        <p id="ut-answer-status" style="font-size:11px; color:#dc2626; margin-top:4px;"></p>
      </div>
    `;
  }

  if (task.taskType === 'RATING_SCALE') {
    const min = task.ratingMin ?? 1;
    const max = task.ratingMax ?? 5;
    const buttons = Array.from({ length: max - min + 1 }, (_, i) => min + i)
      .map(n => `
        <button type="button" id="ut-rating-${n}"
          onclick="window.__utSelectRating(${n})"
          style="width:34px; height:34px; border-radius:50%; border:2px solid #d1d5db; background:white; cursor:pointer; font-size:13px; font-weight:bold; color:#374151; transition:all 0.15s; flex-shrink:0;"
        >${n}</button>
      `)
      .join('');

    return `
      <div id="ut-answer-ui" style="margin-bottom:10px;">
        <p style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280; margin-bottom:8px;">Select your rating:</p>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          ${task.ratingMinLabel ? `<span style="font-size:11px; color:#6b7280;">${escapeHtml(task.ratingMinLabel)}</span>` : ''}
          ${buttons}
          ${task.ratingMaxLabel ? `<span style="font-size:11px; color:#6b7280;">${escapeHtml(task.ratingMaxLabel)}</span>` : ''}
        </div>
        <p id="ut-answer-status" style="font-size:11px; color:#dc2626; margin-top:4px;"></p>
      </div>
    `;
  }

  return ''; // FREE_RESPONSE — no structured answer UI
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeJs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function injectOverlay() {
  if (!currentJob || document.getElementById('usability-testing-overlay')) return;

  const overlayContainer = document.createElement('div');
  overlayContainer.id = 'usability-testing-overlay-container';
  Object.assign(overlayContainer.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '999999',
    fontFamily: 'system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
    opacity: '1'
  });

  const minBtn = document.createElement('button');
  minBtn.id = 'ut-minimized-btn';
  Object.assign(minBtn.style, {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    cursor: 'pointer',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
    padding: '0',
    opacity: '1'
  });
  minBtn.innerHTML = '📋';
  minBtn.title = 'Open Usability Test Panel';

  const overlay = document.createElement('div');
  overlay.id = 'usability-testing-overlay';
  Object.assign(overlay.style, {
    width: '360px',
    backgroundColor: 'white',
    border: '2px solid #2563eb',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    color: '#1f2937',
    display: 'block',
    opacity: '1'
  });

  overlay.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937 !important;">Active Usability Test</h3>
      <div style="display: flex; gap: 8px;">
        <button id="ut-view-brief-btn" style="background: none !important; border: none !important; color: #2563eb !important; font-size: 12px !important; cursor: pointer !important; text-decoration: underline !important; opacity: 1 !important; padding: 0 !important; font-weight: normal !important;">📖 Brief</button>
        <button id="ut-minimize-btn" style="background: none !important; border: none !important; color: #6b7280 !important; font-size: 14px !important; cursor: pointer !important; padding: 0 4px !important; opacity: 1 !important; font-weight: normal !important;" title="Minimize">_</button>
      </div>
    </div>
    <div id="ut-progress-text" style="font-size: 12px; margin-bottom: 4px; color: #6b7280 !important;"></div>
    <div id="ut-task-type-badge" style="font-size: 11px; font-weight: 600; margin-bottom: 8px; color: #6b7280;"></div>
    <p id="ut-instruction" style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #1f2937 !important;"></p>
    <div id="ut-timer" style="margin-bottom: 12px; font-size: 18px; font-weight: bold; color: #dc2626 !important; display: none;"></div>
    
    <div id="ut-answer-ui-container" style="margin-bottom: 4px;"></div>

    <div id="ut-upload-container" style="display: none; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 12px; font-weight: bold; color: #1f2937 !important;">Uploading Video... <span id="ut-upload-percent">0</span>%</span>
        <button id="ut-cancel-btn" style="background: none !important; border: none !important; cursor: pointer !important; color: #dc2626 !important; font-weight: bold !important; opacity: 1 !important; padding: 0 !important;">✕</button>
      </div>
      <div style="width: 100%; background-color: #e5e7eb !important; border-radius: 4px; height: 8px;">
        <div id="ut-upload-bar" style="width: 0%; background-color: #2563eb !important; height: 100%; border-radius: 4px; transition: width 0.2s;"></div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; gap: 8px;">
      <button id="ut-start-btn" style="flex: 1; background-color: #2563eb !important; color: white !important; border: none !important; padding: 8px !important; border-radius: 4px !important; cursor: pointer !important; font-weight: bold !important; font-size: 14px !important; opacity: 1 !important;">Start Task</button>
      <button id="ut-retake-btn" style="flex: 1; background-color: #ef4444 !important; color: white !important; border: none !important; padding: 8px !important; border-radius: 4px !important; cursor: pointer !important; display: none; font-weight: bold !important; font-size: 14px !important; opacity: 1 !important;">Retake</button>
      <button id="ut-submit-btn" style="flex: 1; background-color: #16a34a !important; color: white !important; border: none !important; padding: 8px !important; border-radius: 4px !important; cursor: pointer !important; display: none; font-weight: bold !important; font-size: 14px !important; opacity: 1 !important;">Submit Task</button>
    </div>
    
    <div id="ut-final-submit" style="display: none; margin-top: 12px;">
      <button id="ut-finish-job-btn" style="width: 100%; background-color: #16a34a !important; color: white !important; border: none !important; padding: 12px !important; border-radius: 4px !important; cursor: pointer !important; font-weight: bold !important; font-size: 14px !important; opacity: 1 !important;">Finish Recording</button>
    </div>
  `;

  overlayContainer.appendChild(minBtn);
  overlayContainer.appendChild(overlay);
  document.body.appendChild(overlayContainer);

  // Global handlers for dynamic elements (radio/rating buttons injected via innerHTML)
  (window as any).__utSelectChoice = (idx: number, value: string) => {
    currentStructuredAnswer = { type: 'MULTIPLE_CHOICE', value };
    // Visual highlight
    document.querySelectorAll('[id^="ut-choice-label-"]').forEach((el, i) => {
      const label = el as HTMLElement;
      label.style.borderColor = i === idx ? '#2563eb' : '#e5e7eb';
      label.style.backgroundColor = i === idx ? '#eff6ff' : 'white';
    });
    const statusEl = document.getElementById('ut-answer-status');
    if (statusEl) { statusEl.textContent = ''; }
  };

  (window as any).__utSelectRating = (value: number) => {
    currentStructuredAnswer = { type: 'RATING_SCALE', value };
    // Visual highlight
    const task = currentJob!.campaign.tasks[currentTaskIndex];
    const min = task.ratingMin ?? 1;
    const max = task.ratingMax ?? 5;
    Array.from({ length: max - min + 1 }, (_, i) => min + i).forEach(n => {
      const btn = document.getElementById(`ut-rating-${n}`) as HTMLButtonElement | null;
      if (btn) {
        btn.style.borderColor = n === value ? '#2563eb' : '#d1d5db';
        btn.style.backgroundColor = n === value ? '#2563eb' : 'white';
        btn.style.color = n === value ? 'white' : '#374151';
      }
    });
    const statusEl = document.getElementById('ut-answer-status');
    if (statusEl) { statusEl.textContent = ''; }
  };

  document.getElementById('ut-minimize-btn')!.onclick = () => {
    overlay.style.display = 'none';
    minBtn.style.display = 'flex';
  };

  minBtn.onclick = () => {
    minBtn.style.display = 'none';
    overlay.style.display = 'block';
  };

  document.getElementById('ut-start-btn')!.onclick = startTask;
  document.getElementById('ut-retake-btn')!.onclick = retakeTask;
  document.getElementById('ut-submit-btn')!.onclick = submitTask;
  document.getElementById('ut-cancel-btn')!.onclick = cancelUpload;
  document.getElementById('ut-finish-job-btn')!.onclick = submitJob;

  const briefBtn = document.getElementById('ut-view-brief-btn');
  if (briefBtn) {
    briefBtn.onclick = () => {
      let modal = document.getElementById('ut-welcome-modal');
      if (modal) {
        modal.style.display = 'flex';
      } else {
        injectWelcomeModal();
      }
    };
  }

  renderTask();
}

function renderTask() {
  if (!currentJob) return;

  const tasks = currentJob.campaign.tasks;
  const isFinished = currentTaskIndex >= tasks.length;

  if (isFinished) {
    document.getElementById('ut-instruction')!.innerText = 'All tasks completed!';
    document.getElementById('ut-progress-text')!.innerText = '';
    document.getElementById('ut-task-type-badge')!.innerText = '';
    document.getElementById('ut-start-btn')!.style.display = 'none';
    document.getElementById('ut-retake-btn')!.style.display = 'none';
    document.getElementById('ut-submit-btn')!.style.display = 'none';
    document.getElementById('ut-timer')!.style.display = 'none';
    document.getElementById('ut-upload-container')!.style.display = 'none';
    document.getElementById('ut-answer-ui-container')!.innerHTML = '';
    document.getElementById('ut-final-submit')!.style.display = 'block';
    return;
  }

  const activeTask = tasks[currentTaskIndex];

  document.getElementById('ut-instruction')!.innerText = 'Task ' + (currentTaskIndex + 1) + ': ' + activeTask.instruction;
  document.getElementById('ut-progress-text')!.innerText = 'Task ' + (currentTaskIndex + 1) + ' of ' + tasks.length;
  document.getElementById('ut-task-type-badge')!.innerText = getTaskTypeBadge(activeTask.taskType || 'FREE_RESPONSE');
  
  document.getElementById('ut-start-btn')!.style.display = taskState === 'READY' ? 'block' : 'none';
  document.getElementById('ut-retake-btn')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  document.getElementById('ut-submit-btn')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  
  document.getElementById('ut-timer')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  document.getElementById('ut-upload-container')!.style.display = taskState === 'UPLOADING' ? 'block' : 'none';
  document.getElementById('ut-final-submit')!.style.display = 'none';

  // Render dynamic answer UI (MC/Rating) when recording
  document.getElementById('ut-answer-ui-container')!.innerHTML = renderAnswerUI(activeTask);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  const timerEl = document.getElementById('ut-timer')!;
  
  const updateDisplay = () => {
    const m = Math.floor(remainingTime / 60);
    const s = remainingTime % 60;
    timerEl.innerText = `${m}:${s.toString().padStart(2, '0')}`;
  };

  updateDisplay();
  timerInterval = setInterval(() => {
    remainingTime--;
    updateDisplay();
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      submitTask();
    }
  }, 1000);
}

function startTask() {
  if (taskState !== 'READY') return;
  
  chrome.runtime.sendMessage({ type: 'START_RECORDING' }, (response) => {
    if (response?.error) {
      alert('Failed to start recording: ' + response.error);
      return;
    }
    const task = currentJob!.campaign.tasks[currentTaskIndex];
    remainingTime = task.maxTimeLimit || 300;
    currentStructuredAnswer = null; // Reset for new task
    taskState = 'RECORDING';
    startTimer();
    renderTask();
  });
}

function retakeTask() {
  if (taskState !== 'RECORDING') return;
  if (timerInterval) clearInterval(timerInterval);
  currentStructuredAnswer = null; // Reset on retake
  
  chrome.runtime.sendMessage({ type: 'RETAKE_RECORDING' }, () => {
    taskState = 'READY';
    renderTask();
  });
}

function submitTask() {
  if (taskState !== 'RECORDING') return;

  const task = currentJob!.campaign.tasks[currentTaskIndex];
  const taskType = task.taskType || 'FREE_RESPONSE';

  // Validate structured answer is selected for MC/Rating tasks
  if (taskType === 'MULTIPLE_CHOICE' && !currentStructuredAnswer) {
    const statusEl = document.getElementById('ut-answer-status');
    if (statusEl) statusEl.textContent = 'Please select an answer before submitting.';
    return;
  }
  if (taskType === 'RATING_SCALE' && !currentStructuredAnswer) {
    const statusEl = document.getElementById('ut-answer-status');
    if (statusEl) statusEl.textContent = 'Please select a rating before submitting.';
    return;
  }

  if (timerInterval) clearInterval(timerInterval);

  taskState = 'UPLOADING';
  uploadProgress = 0;
  updateProgressUI(0);
  renderTask();

  chrome.runtime.sendMessage({ 
    type: 'STOP_RECORDING',
    jobId: currentJob!.id,
    taskId: task.id,
    structuredAnswer: currentStructuredAnswer // pass to background → offscreen
  }, (response) => {
    if (taskState !== 'UPLOADING') return; // Cancelled
    
    if (response?.error) {
      alert('Upload failed: ' + response.error);
      taskState = 'RECORDING';
      renderTask();
      return;
    }
    
    // Upload success
    currentStructuredAnswer = null;
    taskState = 'READY';
    currentTaskIndex++;
    renderTask();
  });
}

function cancelUpload() {
  if (taskState !== 'UPLOADING') return;
  chrome.runtime.sendMessage({ type: 'ABORT_UPLOAD' });
  
  chrome.runtime.sendMessage({ type: 'RETAKE_RECORDING' }, () => {
    currentStructuredAnswer = null;
    taskState = 'READY';
    renderTask();
  });
}

function updateProgressUI(percent: number) {
  const percentEl = document.getElementById('ut-upload-percent');
  const barEl = document.getElementById('ut-upload-bar');
  if (percentEl) percentEl.innerText = percent.toString();
  if (barEl) barEl.style.width = percent + '%';
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'UPLOAD_PROGRESS' && taskState === 'UPLOADING') {
    updateProgressUI(request.percent);
  }
});

function submitJob() {
  if (!currentJob) return;

  const btn = document.getElementById('ut-finish-job-btn') as HTMLButtonElement;
  btn.disabled = true;

  document.getElementById('usability-testing-overlay')!.innerHTML =
    '<h3 style="margin:0;color:#16a34a;">Recording Complete!</h3>' +
    '<p style="margin-top:8px;font-size:14px;">Please return to the Usability Hub dashboard (My Jobs) to write your final review and submit the test.</p>';
}

chrome.runtime.sendMessage(
  { type: 'FETCH_ACTIVE_JOB', currentUrl: window.location.href },
  (response) => {
    console.log('CONTENT SCRIPT: RECEIVED RESPONSE', response, chrome.runtime.lastError);
    if (chrome.runtime.lastError) return;
    if (response?.job) {
      currentJob = response.job as ActiveJob;
      currentJob.campaign.tasks.sort((a, b) => a.stepOrder - b.stepOrder);
      injectWelcomeModal();
      injectOverlay();
    }
  }
);
