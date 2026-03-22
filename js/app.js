// ----------------------
// LOAD TASKS
// ----------------------
async function loadTasks(topic) {
  const list = document.getElementById(topic + "Tasks");
  if (!list) return;

  const doc = await db.collection("tasks").doc(topic).get();

  list.innerHTML = "";

  if (!doc.exists) return;

  const tasks = doc.data().items;

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    li.innerText = task.text;

    if (task.done) {
      li.style.textDecoration = "line-through";
      li.style.color = "gray";
    }

    li.onclick = () => toggleTask(topic, index);

    list.appendChild(li);
  });
}

// ----------------------
// ADD TASK
// ----------------------
async function addTask(topic) {
  const input = document.getElementById(topic + "TaskInput");

  if (!input.value) return;

  const ref = db.collection("tasks").doc(topic);
  const doc = await ref.get();

  let tasks = doc.exists ? doc.data().items : [];

  tasks.push({
    text: input.value,
    done: false,
  });

  await ref.set({ items: tasks });

  input.value = "";

  loadTasks(topic);
  loadProgress();
}

// ----------------------
// TOGGLE TASK
// ----------------------
async function toggleTask(topic, index) {
  const ref = db.collection("tasks").doc(topic);
  const doc = await ref.get();

  let tasks = doc.data().items;

  tasks[index].done = !tasks[index].done;

  await ref.set({ items: tasks });

  loadTasks(topic);
  loadProgress();
}

// ----------------------
// CALCULATE PROGRESS
// ----------------------
async function calculateProgress(topic) {
  const doc = await db.collection("tasks").doc(topic).get();

  if (!doc.exists) return 0;

  const tasks = doc.data().items;

  const completed = tasks.filter((t) => t.done).length;

  let progress = (completed / 5) * 100;

  if (progress > 100) progress = 100;

  return Math.floor(progress);
}

// ----------------------
// LOAD PROGRESS
// ----------------------
async function loadProgress() {
  const topics = ["networking", "aws", "linux", "others"];

  let total = 0;

  for (let topic of topics) {
    const progress = await calculateProgress(topic);
    total += progress;

    const el = document.getElementById(topic + "Progress");

    if (el) {
      el.style.width = progress + "%";
      el.innerText = progress + "%";
    }
  }

  const overall = document.getElementById("overallProgress");

  if (overall) {
    const avg = total / 4;

    overall.style.width = avg + "%";
    overall.innerText = Math.floor(avg) + "%";
  }
}

// ----------------------
// INIT
// ----------------------
["networking", "aws", "linux", "others"].forEach(loadTasks);
loadProgress();
