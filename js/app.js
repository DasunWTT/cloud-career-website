let tasks = JSON.parse(localStorage.getItem("tasks")) || {
  networking: [],
  aws: [],
  linux: [],
  others: [],
};

function addTask(topic) {
  let input = document.getElementById(topic + "TaskInput");
  if (!input.value) return;

  tasks[topic].push({
    text: input.value,
    done: false,
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  input.value = "";

  loadTasks(topic);
  loadProgress();
}

function toggleTask(topic, index) {
  tasks[topic][index].done = !tasks[topic][index].done;

  localStorage.setItem("tasks", JSON.stringify(tasks));

  loadTasks(topic);
  loadProgress();
}

function loadTasks(topic) {
  let list = document.getElementById(topic + "Tasks");
  if (!list) return;

  list.innerHTML = "";

  tasks[topic].forEach((task, index) => {
    let li = document.createElement("li");

    li.innerText = task.text;

    if (task.done) {
      li.style.textDecoration = "line-through";
      li.style.color = "gray";
    }

    li.onclick = () => toggleTask(topic, index);

    list.appendChild(li);
  });
}

function calculateProgress(topic) {
  let completed = tasks[topic].filter((t) => t.done).length;

  let progress = (completed / 5) * 100;
  if (progress > 100) progress = 100;

  return Math.floor(progress);
}

function loadProgress() {
  let topics = ["networking", "aws", "linux", "others"];
  let total = 0;

  topics.forEach((topic) => {
    let progress = calculateProgress(topic);
    total += progress;

    let el = document.getElementById(topic + "Progress");
    if (el) {
      el.style.width = progress + "%";
      el.innerText = progress + "%";
    }
  });

  let overall = document.getElementById("overallProgress");
  if (overall) {
    let avg = total / 4;
    overall.style.width = avg + "%";
    overall.innerText = Math.floor(avg) + "%";
  }
}

["networking", "aws", "linux", "others"].forEach(loadTasks);
loadProgress();
