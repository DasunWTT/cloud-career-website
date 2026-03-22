// ----------------------
// CHECK LOGIN
// ----------------------
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    initApp(user);
  }
});

// ----------------------
// INIT APP AFTER LOGIN
// ----------------------
function initApp(user) {
  const topics = ["networking", "aws", "linux", "others"];

  topics.forEach((topic) => loadTasks(user, topic));
  loadProgress(user);
}

// ----------------------
// LOAD TASKS
// ----------------------
async function loadTasks(user, topic) {
  const list = document.getElementById(topic + "Tasks");
  if (!list) return;

  const docRef = db.collection("tasks").doc(user.uid + "_" + topic);
  const doc = await docRef.get();

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

    li.onclick = () => toggleTask(user, topic, index);

    list.appendChild(li);
  });
}

// ----------------------
// ADD TASK
// ----------------------
async function addTask(topic) {
  const user = auth.currentUser;
  if (!user) return;

  const input = document.getElementById(topic + "TaskInput");
  if (!input.value) return;

  const docRef = db.collection("tasks").doc(user.uid + "_" + topic);
  const doc = await docRef.get();

  let tasks = doc.exists ? doc.data().items : [];

  tasks.push({
    text: input.value,
    done: false,
  });

  await docRef.set({ items: tasks });

  input.value = "";

  loadTasks(user, topic);
  loadProgress(user);
}

// ----------------------
// TOGGLE TASK
// ----------------------
async function toggleTask(user, topic, index) {
  const docRef = db.collection("tasks").doc(user.uid + "_" + topic);
  const doc = await docRef.get();

  let tasks = doc.data().items;

  tasks[index].done = !tasks[index].done;

  await docRef.set({ items: tasks });

  loadTasks(user, topic);
  loadProgress(user);
}

// ----------------------
// CALCULATE PROGRESS
// ----------------------
async function calculateProgress(user, topic) {
  const doc = await db
    .collection("tasks")
    .doc(user.uid + "_" + topic)
    .get();

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
async function loadProgress(user) {
  const topics = ["networking", "aws", "linux", "others"];

  let total = 0;

  for (let topic of topics) {
    const progress = await calculateProgress(user, topic);
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
// LOGOUT
// ----------------------
function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
