let currentThreadId = null;

export function getCurrentThreadId() {
    console.log("getcurrentThreadId")
    console.log(currentThreadId)
  return currentThreadId;
}

export function setCurrentThreadId(threadId) {
  currentThreadId = threadId;
  console.log("setcurrentThreadId")
  console.log(currentThreadId)
}