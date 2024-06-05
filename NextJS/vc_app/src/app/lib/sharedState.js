// sharedState.js
let currentThreadId = null;

export function setCurrentThreadId(threadId) {
  currentThreadId = threadId;
}

export function getCurrentThreadId() {
  return currentThreadId;
}
