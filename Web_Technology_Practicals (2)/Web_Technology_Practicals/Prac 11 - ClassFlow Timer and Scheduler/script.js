const timer = document.getElementById('timer');
const minutesInput = document.getElementById('minutes');
const progressBar = document.getElementById('progressBar');
const timerMessage = document.getElementById('timerMessage');
let duration = 25 * 60;
let remaining = duration;
let endTime = 0;
let interval = null;
let running = false;
let classes = [];
try {
  classes = JSON.parse(localStorage.getItem('classflowClasses')) || [];
  if (!Array.isArray(classes)) classes = [];
} catch {
  classes = [];
}

function showTime() {
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  timer.textContent =
    String(min).padStart(2, '0') + ':' +
    String(sec).padStart(2, '0');
  progressBar.style.width =
    (duration > 0 ? remaining / duration * 100 : 0) + '%';
}

function updateStatus() {
  document.getElementById('focusStatus').textContent =
    running ? 'Active' : remaining === 0 ? 'Complete' : 'Ready';
}

function stopInterval() {
  clearInterval(interval);
  interval = null;
}

function tick() {
  remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  showTime();
  if (remaining === 0) {
    stopInterval();
    running = false;
    timerMessage.textContent = 'Focus session completed!';
    updateStatus();
    alert('Time is up! Great work.');
  }
}

function startTimer() {
  if (running) return;
  if (remaining === 0) {
    remaining = duration;
  }
  running = true;
  endTime = Date.now() + remaining * 1000;
  timerMessage.textContent = 'Stay focused. Timer is running.';
  updateStatus();
  tick();
  if (remaining > 0) {
    interval = setInterval(tick, 200);
  }
}

function pauseTimer() {
  if (!running) return;
  remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  stopInterval();
  running = false;
  showTime();
  updateStatus();
  timerMessage.textContent = 'Timer paused';
  if (remaining === 0) {
    timerMessage.textContent = 'Focus session completed!';
  }
}

function resetTimer() {
  stopInterval();
  running = false;
  remaining = duration;
  showTime();
  updateStatus();
  timerMessage.textContent = 'Timer reset. Ready to focus.';
}

document.getElementById('start').addEventListener('click', startTimer);
document.getElementById('pause').addEventListener('click', pauseTimer);
document.getElementById('reset').addEventListener('click', resetTimer);

minutesInput.addEventListener('change', function() {
  if (running) {
    alert('Pause the timer before changing the duration.');
    minutesInput.value = Math.round(duration / 60);
    return;
  }
  const minutes = Number(minutesInput.value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
    alert('Enter a duration between 1 and 180 minutes.');
    minutesInput.value = Math.round(duration / 60);
    return;
  }
  duration = minutes * 60;
  remaining = duration;
  showTime();
  updateStatus();
  timerMessage.textContent = 'Duration updated';
});

function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
}

function saveClasses() {
  try {
    localStorage.setItem('classflowClasses', JSON.stringify(classes));
  } catch {
    alert('Unable to save classes in this browser.');
  }
  renderClasses();
}

function renderClasses() {
  const list = document.getElementById('classList');
  list.replaceChildren();
  classes.sort((a, b) => a.time.localeCompare(b.time));
  document.getElementById('classCount').textContent = classes.length;
  document.getElementById('emptyMessage').style.display =
    classes.length ? 'none' : 'block';

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const next = classes.find(item => {
    const parts = item.time.split(':').map(Number);
    return parts[0] * 60 + parts[1] >= currentTime;
  });
  document.getElementById('nextClass').textContent =
    next ? next.subject : 'None';

  classes.forEach(item => {
    const row = document.createElement('div');
    row.className = 'class-item';
    const details = document.createElement('div');
    details.className = 'class-details';
    const subject = document.createElement('strong');
    subject.textContent = item.subject;
    const info = document.createElement('p');
    info.textContent = item.time + (item.room ? ' | ' + item.room : '');
    const button = document.createElement('button');
    button.className = 'delete-button';
    button.textContent = 'Delete';
    button.addEventListener('click', function() {
      classes = classes.filter(c => c.id !== item.id);
      saveClasses();
    });
    details.append(subject, info);
    row.append(details, button);
    list.appendChild(row);
  });
}

document.getElementById('classForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const time = document.getElementById('classTime').value;
  const room = document.getElementById('room').value.trim();
  if (!subject || !time) {
    alert('Enter the subject and class time.');
    return;
  }
  classes.push({
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    subject: subject,
    time: time,
    room: room
  });
  saveClasses();
  this.reset();
});

showTime();
updateClock();
renderClasses();
updateStatus();
setInterval(updateClock, 1000);
