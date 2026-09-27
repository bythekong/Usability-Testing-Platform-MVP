import { marked } from 'marked';

interface ActiveTask {
  id: string;
  stepOrder: number;
  instruction: string;
  maxTimeLimit: number;
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
let responses: { taskId: string; answerText: string }[] = [];

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
    <button id="ut-understand-btn" style="width:100%; background-color:#2563eb !important; color:white !important; border:none !important; padding:12px !important; border-radius:8px !important; cursor:pointer !important; font-weight:bold !important; font-size:16px !important; opacity: 1 !important;">I Understand & Continue</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  document.getElementById('ut-understand-btn')!.onclick = () => {
    modal.style.display = 'none';
  };
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

  // Floating Minimized Button
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
    width: '350px',
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
    <div id="ut-progress-text" style="font-size: 12px; margin-bottom: 8px; color: #6b7280 !important;"></div>
    <p id="ut-instruction" style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #1f2937 !important;"></p>
    <div id="ut-timer" style="margin-bottom: 12px; font-size: 18px; font-weight: bold; color: #dc2626 !important; display: none;"></div>
    
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
    document.getElementById('ut-answer')!.style.display = 'none';
    document.getElementById('ut-start-btn')!.style.display = 'none';
    document.getElementById('ut-retake-btn')!.style.display = 'none';
    document.getElementById('ut-submit-btn')!.style.display = 'none';
    document.getElementById('ut-timer')!.style.display = 'none';
    document.getElementById('ut-upload-container')!.style.display = 'none';
    document.getElementById('ut-final-submit')!.style.display = 'block';
    return;
  }

  const activeTask = tasks[currentTaskIndex];

  document.getElementById('ut-instruction')!.innerText = 'Task ' + (currentTaskIndex + 1) + ': ' + activeTask.instruction;
  document.getElementById('ut-progress-text')!.innerText = 'Task ' + (currentTaskIndex + 1) + ' of ' + tasks.length;
  
  document.getElementById('ut-start-btn')!.style.display = taskState === 'READY' ? 'block' : 'none';
  document.getElementById('ut-retake-btn')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  document.getElementById('ut-submit-btn')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  
  document.getElementById('ut-timer')!.style.display = taskState === 'RECORDING' ? 'block' : 'none';
  document.getElementById('ut-upload-container')!.style.display = taskState === 'UPLOADING' ? 'block' : 'none';
  document.getElementById('ut-final-submit')!.style.display = 'none';
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
      // Force stop
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
    taskState = 'RECORDING';
    startTimer();
    renderTask();
  });
}

function retakeTask() {
  if (taskState !== 'RECORDING') return;
  if (timerInterval) clearInterval(timerInterval);
  
  chrome.runtime.sendMessage({ type: 'RETAKE_RECORDING' }, () => {
    taskState = 'READY';
    renderTask();
  });
}

function submitTask() {
  if (taskState !== 'RECORDING') return;
  if (timerInterval) clearInterval(timerInterval);

  taskState = 'UPLOADING';
  uploadProgress = 0;
  updateProgressUI(0);
  renderTask();

  chrome.runtime.sendMessage({ 
    type: 'STOP_RECORDING',
    jobId: currentJob!.id,
    taskId: currentJob!.campaign.tasks[currentTaskIndex].id
  }, (response) => {
    if (taskState !== 'UPLOADING') return; // Cancelled
    
    if (response?.error) {
      alert('Upload failed: ' + response.error);
      taskState = 'RECORDING';
      renderTask();
      return;
    }
    
    // Upload success
    taskState = 'READY';
    currentTaskIndex++;
    renderTask();
  });
}

function cancelUpload() {
  if (taskState !== 'UPLOADING') return;
  chrome.runtime.sendMessage({ type: 'ABORT_UPLOAD' });
  
  taskState = 'RECORDING'; // Revert back to recording so they can retake or resume
  // Actually, if we cancel upload, the video is lost or incomplete. Better to treat it as a retake.
  chrome.runtime.sendMessage({ type: 'RETAKE_RECORDING' }, () => {
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
    '<p style="margin-top:8px;font-size:14px;">Please return to the Usability Hub dashboard (My Jobs) to write your final markdown review and submit the test.</p>';
}

chrome.runtime.sendMessage(
  { type: 'FETCH_ACTIVE_JOB', currentUrl: window.location.href },
  (response) => {
    if (chrome.runtime.lastError) return;
    if (response?.job) {
      currentJob = response.job as ActiveJob;
      currentJob.campaign.tasks.sort((a, b) => a.stepOrder - b.stepOrder);
      injectWelcomeModal();
      injectOverlay();
    }
  }
);
