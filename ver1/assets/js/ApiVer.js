const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
  if (!token) {
    window.location.href = '../pages/login.html';
    return;
  }
  fetchTasks();
});

async function fetchTasks() {
  const Tasks = []
  try {
    const { data } = await axios.get(`https://to-do-list-backend-rd9g.onrender.com/tasks`, { headers: { Authorization: `${token}` } });
    data.tasks.map(async (task, index) => {
      const { data } = await axios.get(`https://to-do-list-backend-rd9g.onrender.com/tasks/${task}`, { headers: { Authorization: `${token}` } });
      console.log(task)
      const taskitem = data.task
      console.log(taskitem)
      Tasks.push(taskitem);
    });
    localStorage.setItem('tasks', JSON.stringify(Tasks));

  } catch (error) {
    console.error(error);
  }
}

document.getElementById('display-btn').addEventListener('click', (event) => {
  event.preventDefault();
  renderTasks();
});


// Function to handle task completion
async function handleTaskCompletion(taskId, isCompleted) {
  try {
    const status = isCompleted ? 'Completed' : 'Pending';

    // Commented out until backend is ready
    // await axios.put(`https://to-do-list-backend-rd9g.onrender.com/tasks/${taskId}`, { status }, { headers: { Authorization: `${token}` } });
    console.log(`Task ${taskId} updated to ${status}`);
  } catch (error) {
    console.error(`Error updating task: ${error}`);
  }
}


document.getElementById('hide-btn').addEventListener('click', (event) => {
  event.preventDefault();
  const taskList = document.getElementById('taskList');
  taskList.style.display = 'none';
  taskList.innerHTML = '';
})


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


function renderTasks(){
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskList = document.getElementById('taskList');
  taskList.style.display = 'block';
  taskList.innerHTML = '';

  tasks.map(async (task, index) => {
    const { data } = await axios.get(`https://to-do-list-backend-rd9g.onrender.com/tasks/${task}`, { headers: { Authorization: `${token}` } });
    
    const divItem = document.createElement('div');
    divItem.className = 'task-item';

    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.checked = data.task.status === 'Completed';
    checkBox.addEventListener('change', () => handleTaskCompletion(data.task._id, checkBox.checked));

    const listItem = document.createElement('li');
    listItem.textContent = `Task: ${data.task.task}`;
    
    const dueDateItem = document.createElement('p');
    const dueDate = new Date(data.task.dueDate).toLocaleDateString();
    dueDateItem.textContent = `Due: ${dueDate}`;

    const statusItem = document.createElement('p');
    statusItem.textContent = `${data.task.status}`;

    if(data.task.status == 'Pending'){
      statusItem.style.color ='orange';
      const taskDueDate = new Date(data.task.dueDate); // Convert dueDate to a Date object

      if (taskDueDate < Date.now()) { // Compare dates
        statusItem.textContent += ' - Task overdue'; // Append 'Task overdue' to the status
        statusItem.style.color = 'red'; // Change text color to red for overdue tasks
      }
    } else if(data.task.status == 'Done'){
      listItem.style.textDecoration ='line-through';
      statusItem.style.color ='green';
    }

    const iconsDiv = document.createElement('div');
    iconsDiv.className = 'iconsDiv';

    const editIcon = document.createElement('i');
    editIcon.className = 'fas fa-pen edit-icon';
    editIcon.setAttribute('taskid', index);

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-times delete-icon';
    deleteIcon.setAttribute('taskid', index);

    iconsDiv.appendChild(editIcon);
    iconsDiv.appendChild(deleteIcon);

    divItem.appendChild(checkBox);
    divItem.appendChild(listItem);
    divItem.appendChild(dueDateItem);
    divItem.appendChild(statusItem);
    divItem.appendChild(iconsDiv);

    taskList.appendChild(divItem);
  });
}
