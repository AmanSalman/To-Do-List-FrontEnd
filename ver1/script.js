document.getElementById("form-section").addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("hi");

  const taskInput = document.getElementById("taskInput");
  const taskValue = taskInput.value;
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  tasks.push(taskValue);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  console.log(localStorage.getItem('tasks'));
  taskInput.value = '';
});

console.log(JSON.parse(localStorage.getItem('tasks')));


document.getElementById('display-btn').addEventListener('click', (event)=>{
  event.preventDefault();
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskList = document.getElementById('taskList');
  taskList.style.display = 'block';
  taskList.innerHTML = '';
  tasks.forEach((task) => {
    const listItem = document.createElement('li');
    listItem.textContent = task;
    taskList.appendChild(listItem);
  });
  console.log(tasks);
})

document.getElementById('hide-btn').addEventListener('click', (event)=>{
  event.preventDefault()
  const taskList = document.getElementById('taskList');
  taskList.style.display = 'none';
})