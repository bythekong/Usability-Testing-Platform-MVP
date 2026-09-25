let currentJob: any = null;
let currentTaskIndex = 0;
let responses: { taskId: string; answerText: string }[] = [];

function injectOverlay() {
  if (document.getElementById('usability-testing-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'usability-testing-overlay';
  overlay.style.position = 'fixed';
  overlay.style.bottom = '20px';
  overlay.style.right = '20px';
  overlay.style.width = '350px';
  overlay.style.backgroundColor = 'white';
  overlay.style.border = '2px solid #2563eb';
  overlay.style.borderRadius = '8px';
  overlay.style.padding = '16px';
  overlay.style.zIndex = '999999';
  overlay.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
  overlay.style.fontFamily = 'system-ui, sans-serif';
  overlay.style.color = '#1f2937';

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
    const activeTask = currentJob.campaign.tasks[currentTaskIndex];
    responses.push({
      taskId: activeTask.id,
      answerText: textarea.value
    });

    if (currentTaskIndex < currentJob.campaign.tasks.length - 1) {
      currentTaskIndex++;
      textarea.value = '';
      renderTask();
    } else {
      submitJob();
    }
  };
}

function renderTask() {
  const instructionEl = document.getElementById('ut-instruction');
  const progressEl = document.getElementById('ut-progress');
  const nextBtn = document.getElementById('ut-next-btn');

  if (!instructionEl || !progressEl || !nextBtn || !currentJob) return;

  const tasks = currentJob.campaign.tasks;
  const activeTask = tasks[currentTaskIndex];

  instructionEl.innerText = `Task ${currentTaskIndex + 1}: ${activeTask.instruction}`;
  progressEl.innerText = `${currentTaskIndex + 1} / ${tasks.length}`;

  if (currentTaskIndex === tasks.length - 1) {
    nextBtn.innerText = 'Submit Test';
    nextBtn.style.backgroundColor = '#16a34a';
  } else {
    nextBtn.innerText = 'Next Task';
    nextBtn.style.backgroundColor = '#2563eb';
  }
}

function submitJob() {
  const nextBtn = document.getElementById('ut-next-btn');
  if (nextBtn) nextBtn.innerText = 'Submitting...';

  chrome.runtime.sendMessage({
    type: 'SUBMIT_JOB',
    jobId: currentJob.id,
    responses
  }, (res) => {
    if (res.success) {
      document.getElementById('usability-testing-overlay')!.innerHTML = '<h3 style="margin:0;color:#16a34a;">Test Submitted Successfully!</h3><p style="margin-top:8px;font-size:14px;">You can now close this page.</p>';
    } else {
      alert('Failed to submit job: ' + res.error);
      if (nextBtn) nextBtn.innerText = 'Try Again';
    }
  });
}

// Initialization check
chrome.runtime.sendMessage({ type: 'FETCH_ACTIVE_JOB' }, (response) => {
  if (response && response.job) {
    // Only inject if we are on the target URL (rough check)
    const targetUrl = new URL(response.job.campaign.targetUrl);
    if (window.location.hostname === targetUrl.hostname) {
      currentJob = response.job;
      injectOverlay();
    }
  }
});