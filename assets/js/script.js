document.getElementById("form-section").addEventListener("submit", (event) => {
  event.preventDefault();
  const taskInput = document.getElementById("taskInput");
  const taskValue = taskInput.value;
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  tasks.push(taskValue);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  taskInput.value = '';
  renderTasks();

  const toast = document.getElementById('toast');
  toast.textContent = "Get it done, girl! 🎀💖";
  toast.style.display = "block"; // Show the toast
  toast.style.opacity = 1; // Set opacity for fade-in

  setTimeout(() => {
    toast.style.opacity = 0; // Fade out
    setTimeout(() => {
      toast.style.display = "none"; // Hide after fade out
    }, 500);
  }, 3000); // Show for 3 seconds
});

function renderTasks(){
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskList = document.getElementById('taskList');
  taskList.style.display = 'block';
  taskList.innerHTML = '';
  tasks.forEach((task,index) => {
    const divItem = document.createElement('div');
    divItem.className = 'task-item';

    const iconsDiv = document.createElement('div');
    iconsDiv.className = 'iconsDiv'
  
    const listItem = document.createElement('li');
    listItem.textContent = task;
  
    const editIcon = document.createElement('i');
    editIcon.className = 'fas fa-pen edit-icon';
    editIcon.setAttribute('taskid', index)
  
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-times delete-icon';
    deleteIcon.setAttribute('taskid', index)
  
    iconsDiv.appendChild(editIcon)
    iconsDiv.appendChild(deleteIcon)
    divItem.appendChild(listItem);
    divItem.appendChild(iconsDiv);
    taskList.appendChild(divItem);
  });
  
  console.log(tasks);
}

document.getElementById('display-btn').addEventListener('click', (event)=>{
  event.preventDefault();
  renderTasks();
})

document.getElementById('hide-btn').addEventListener('click', (event)=>{
  event.preventDefault()
  const taskList = document.getElementById('taskList');
  taskList.style.display = 'none';
})


// document.getElementsByClassName('.edit-icon').addEventListener('click', (event)=>{
//   event.preventDefault()
//   const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
//   console.log(tasks)
// })

document.addEventListener('click', function(event) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskid = event.target.getAttribute('taskid')
  if (event.target.classList.contains('edit-icon')) {
    console.log('Edit icon clicked');
    const taskContent = tasks[taskid]
    const inputToEdit = document.createElement('input')
    inputToEdit.type = 'text'
    inputToEdit.value = taskContent

    const DivItem = event.target.closest('.task-item')
    const listItem = DivItem.querySelector('li')
    listItem.textContent =''
    listItem.appendChild(inputToEdit)

    const savebutton = document.createElement('button')
    savebutton.textContent = 'Save'
    savebutton.style.marginTop = '7px'

    listItem.appendChild(savebutton)

    savebutton.addEventListener('click', (e)=>{
      e.preventDefault()
      const newTask = inputToEdit.value.trim()
      editTaskByIndex(tasks, taskid, newTask);
    })
  } else if (event.target.classList.contains('delete-icon')) {
    console.log('Delete icon clicked');
    deleteTaskByIndex(tasks, taskid);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  }
});


function deleteTaskByIndex(tasks, index) {
  if (index >= 0 && index < tasks.length) {
    tasks.splice(index, 1);
    console.log(`Task at index ${index} has been deleted.`);
  } else {
    console.log('Invalid index. Task not found.');
  }
}


function editTaskByIndex(tasks, index, newTask) {
  if (index >= 0 && index < tasks.length) {
    tasks[index] = newTask;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  } else {
    console.log('Invalid index. Task not found.');
  }
}