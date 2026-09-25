interface ActiveTask {
  id: string;
  stepOrder: number;
  instruction: string;
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
let submitting = false;

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

  const title = document.createElement('h3');
  title.innerText = 'Active Usability Test';
  title.style.margin = '0 0 12px 0';
  title.style.fontSize = '16px';
  title.style.fontWeight = 'bold';

  const instruction = document.createElement('p');
  instruction.id = 'ut-instruction';
  instruction.style.margin = '0 0 12px 0';
  instruction.style.fontSize = '14px';

  const textarea = document.createElement('textarea');
  textarea.id = 'ut-answer';
  textarea.placeholder = 'Your answer / notes...';
  textarea.style.width = '100%';
  textarea.style.height = '60px';
  textarea.style.marginBottom = '12px';
  textarea.style.padding = '8px';
  textarea.style.boxSizing = 'border-box';
  textarea.style.border = '1px solid #d1d5db';
  textarea.style.borderRadius = '4px';

  const actionContainer = document.createElement('div');
  actionContainer.style.display = 'flex';
  actionContainer.style.justifyContent = 'space-between';

  const progress = document.createElement('span');
  progress.id = 'ut-progress';
  progress.style.fontSize = '12px';
  progress.style.alignSelf = 'center';

  const nextBtn = document.createElement('button');
  nextBtn.id = 'ut-next-btn';
  nextBtn.style.backgroundColor = '#2563eb';
  nextBtn.style.color = 'white';
  nextBtn.style.border = 'none';
  nextBtn.style.padding = '8px 16px';
  nextBtn.style.borderRadius = '4px';
  nextBtn.style.cursor = 'pointer';

  actionContainer.appendChild(progress);
  actionContainer.appendChild(nextBtn);
  overlay.appendChild(title);
  overlay.appendChild(instruction);
  overlay.appendChild(textarea);
  overlay.appendChild(actionContainer);
  document.body.appendChild(overlay);

  renderTask();

  nextBtn.onclick = () => {
    if (!currentJob || submitting) return;

    const activeTask = currentJob.campaign.tasks[currentTaskIndex];
    const response = {
      taskId: activeTask.id,
      answerText: textarea.value
    };

    responses[currentTaskIndex] = response;

    if (currentTaskIndex < currentJob.campaign.tasks.length - 1) {
      currentTaskIndex += 1;
      textarea.value = responses[currentTaskIndex]?.answerText || '';
      renderTask();
      return;
    }

    submitJob();
  };
}

function renderTask() {
  if (!currentJob) return;

  const instructionEl = document.getElementById('ut-instruction');
  const progressEl = document.getElementById('ut-progress');
  const nextBtn = document.getElementById('ut-next-btn') as HTMLButtonElement | null;
  const textarea = document.getElementById('ut-answer') as HTMLTextAreaElement | null;

  if (!instructionEl || !progressEl || !nextBtn || !textarea) return;

  const tasks = currentJob.campaign.tasks;
  const activeTask = tasks[currentTaskIndex];

  instructionEl.innerText = 'Task ' + (currentTaskIndex + 1) + ': ' + activeTask.instruction;
  progressEl.innerText = (currentTaskIndex + 1) + ' / ' + tasks.length;
  textarea.value = responses[currentTaskIndex]?.answerText || '';

  const isLast = currentTaskIndex === tasks.length - 1;
  nextBtn.innerText = isLast ? 'Submit Test' : 'Next Task';
  nextBtn.style.backgroundColor = isLast ? '#16a34a' : '#2563eb';
  nextBtn.disabled = submitting;
}

function submitJob() {
  if (!currentJob || submitting) return;

  submitting = true;
  const nextBtn = document.getElementById('ut-next-btn') as HTMLButtonElement | null;
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.innerText = 'Submitting...';
  }

  chrome.runtime.sendMessage(
    {
      type: 'SUBMIT_JOB',
      jobId: currentJob.id,
      responses
    },
    (response) => {
      if (chrome.runtime.lastError) {
        submitting = false;
        alert('Failed to submit job: ' + (chrome.runtime.lastError.message || 'Chrome runtime error'));
        renderTask();
        return;
      }

      if (response?.success) {
        const overlay = document.getElementById('usability-testing-overlay');
        if (overlay) {
          overlay.innerHTML =
            '<h3 style="margin:0;color:#16a34a;">Test Submitted Successfully!</h3>' +
            '<p style="margin-top:8px;font-size:14px;">You can now close this page.</p>';
        }
        return;
      }

      submitting = false;
      alert('Failed to submit job: ' + (response?.error || 'Unknown error'));
      renderTask();
    }
  );
}

chrome.runtime.sendMessage(
  { type: 'FETCH_ACTIVE_JOB', currentUrl: window.location.href },
  (response) => {
    if (chrome.runtime.lastError) {
      console.warn('Usability Testing extension:', chrome.runtime.lastError.message);
      return;
    }

    if (response?.job) {
      currentJob = response.job as ActiveJob;
      currentJob.campaign.tasks.sort((a, b) => a.stepOrder - b.stepOrder);
      injectOverlay();
    }
  }
);
