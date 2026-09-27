/// <reference types="chrome"/>
export {};
declare var __API_BASE_URL__: string;

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return false;

  if (message.type === 'START_RECORDING') {
    startRecording()
      .then(() => sendResponse({ success: true }))
      .catch((e) => sendResponse({ error: e.message }));
    return true; // async response
  }

  if (message.type === 'STOP_RECORDING') {
    stopRecording(message.jobId, message.taskId, message.token)
      .then(() => sendResponse({ success: true }))
      .catch((e) => sendResponse({ error: e.message }));
    return true; // async response
  }
  
  if (message.type === 'RETAKE_RECORDING') {
     retakeRecording()
      .then(() => sendResponse({ success: true }))
      .catch((e) => sendResponse({ error: e.message }));
     return true;
  }
  
  return false;
});

async function startRecording() {
  if (mediaRecorder?.state === 'recording') {
    throw new Error('Already recording');
  }
  recordedChunks = [];

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'monitor'
    },
    audio: true
  });

  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.start(5000);
}

async function retakeRecording() {
  if (mediaRecorder) {
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    mediaRecorder.stop();
    mediaRecorder = null;
  }
  recordedChunks = [];
}

async function stopRecording(jobId: string, taskId: string, token: string) {
  if (!mediaRecorder) {
    throw new Error('No active recording');
  }

  return new Promise<void>((resolve, reject) => {
    mediaRecorder!.onstop = async () => {
      mediaRecorder!.stream.getTracks().forEach(t => t.stop());
      mediaRecorder = null;

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedChunks = [];

      try {
        await uploadVideo(blob, jobId, taskId, token);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    mediaRecorder!.stop();
  });
}

function uploadVideo(blob: Blob, jobId: string, taskId: string, token: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', `${__API_BASE_URL__}/api/jobs/${jobId}/tasks/${taskId}/video`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        chrome.runtime.sendMessage({ type: 'UPLOAD_PROGRESS', percent });
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(null);
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload aborted'));
    
    const abortListener = (msg: any) => {
      if (msg.type === 'ABORT_UPLOAD') {
        xhr.abort();
        chrome.runtime.onMessage.removeListener(abortListener);
      }
    };
    chrome.runtime.onMessage.addListener(abortListener);
    
    xhr.send(formData(blob));
  });
}

function formData(blob: Blob) {
  const fd = new FormData();
  fd.append('video', blob, 'video.webm');
  return fd;
}
