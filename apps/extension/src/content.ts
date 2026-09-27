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

function injectOverlay() {
  if (!currentJob || document.getElementById('usability-testing-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'usability-testing-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    backgroundColor: 'white',
    border: '2px solid #2563eb',
    borderRadius: '8px',
    padding: '16px',
    zIndex: '999999',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontFamily: 'system-ui, sans-serif',
    color: '#1f2937'
  });

  overlay.innerHTML = `
    <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">Active Usability Test</h3>
    <div id="ut-progress-text" style="font-size: 12px; margin-bottom: 8px; color: #6b7280;"></div>
    <p id="ut-instruction" style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold;"></p>
    <div id="ut-timer" style="margin-bottom: 12px; font-size: 18px; font-weight: bold; color: #dc2626; display: none;"></div>
    
    <textarea id="ut-answer" placeholder="Your answer / notes..." style="width: 100%; height: 60px; margin-bottom: 12px; padding: 8px; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 4px;"></textarea>
    
    <div id="ut-upload-container" style="display: none; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 12px; font-weight: bold;">Uploading Video... <span id="ut-upload-percent">0</span>%</span>
        <button id="ut-cancel-btn" style="background: none; border: none; cursor: pointer; color: #dc2626; font-weight: bold;">✕</button>
      </div>
      <div style="width: 100%; background-color: #e5e7eb; border-radius: 4px; height: 8px;">
        <div id="ut-upload-bar" style="width: 0%; background-color: #2563eb; height: 100%; border-radius: 4px; transition: width 0.2s;"></div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; gap: 8px;">
      <button id="ut-start-btn" style="flex: 1; background-color: #2563eb; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">Start Task</button>
      <button id="ut-retake-btn" style="flex: 1; background-color: #ef4444; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; display: none;">Retake</button>
      <button id="ut-submit-btn" style="flex: 1; background-color: #16a34a; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; display: none;">Submit Task</button>
    </div>
    
    <div id="ut-final-submit" style="display: none; margin-top: 12px;">
      <button id="ut-finish-job-btn" style="width: 100%; background-color: #16a34a; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Finish & Submit Test</button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('ut-start-btn')!.onclick = startTask;
  document.getElementById('ut-retake-btn')!.onclick = retakeTask;
  document.getElementById('ut-submit-btn')!.onclick = submitTask;
  document.getElementById('ut-cancel-btn')!.onclick = cancelUpload;
  document.getElementById('ut-finish-job-btn')!.onclick = submitJob;

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
  
  const textarea = document.getElementById('ut-answer') as HTMLTextAreaElement;
  textarea.value = responses[currentTaskIndex]?.answerText || '';
  textarea.disabled = taskState !== 'RECORDING';

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
  
  const textarea = document.getElementById('ut-answer') as HTMLTextAreaElement;
  responses[currentTaskIndex] = {
    taskId: currentJob!.campaign.tasks[currentTaskIndex].id,
    answerText: textarea.value
  };

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
  if (!currentJob || submitting) return;

  submitting = true;
  const btn = document.getElementById('ut-finish-job-btn') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerText = 'Submitting...';

  chrome.runtime.sendMessage(
    {
      type: 'SUBMIT_JOB',
      jobId: currentJob.id,
      responses
    },
    (response) => {
      if (chrome.runtime.lastError || response?.error) {
        submitting = false;
        alert('Failed to submit job: ' + (chrome.runtime.lastError?.message || response?.error));
        btn.disabled = false;
        btn.innerText = 'Finish & Submit Test';
        return;
      }

      document.getElementById('usability-testing-overlay')!.innerHTML =
        '<h3 style="margin:0;color:#16a34a;">Test Submitted Successfully!</h3>' +
        '<p style="margin-top:8px;font-size:14px;">You can now close this page.</p>';
    }
  );
}

chrome.runtime.sendMessage(
  { type: 'FETCH_ACTIVE_JOB', currentUrl: window.location.href },
  (response) => {
    if (chrome.runtime.lastError) return;
    if (response?.job) {
      currentJob = response.job as ActiveJob;
      currentJob.campaign.tasks.sort((a, b) => a.stepOrder - b.stepOrder);
      injectOverlay();
    }
  }
);
