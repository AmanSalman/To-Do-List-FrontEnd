const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
  if (!token) {
    window.location.href = '../pages/login.html';
    return;
  }
  await fetchTasks();
  setupFilter();
});


function setupFilter() {
  const statusFilter = document.getElementById('statusFilter');
  statusFilter.addEventListener('change', () => {
    renderTasks();
  });
}

async function fetchTasks() {
  const Tasks = [];
  try {
    const { data } = await axios.get(`https://to-do-list-backend-rd9g.onrender.com/tasks`, {
      headers: { Authorization: `${token}` },
    });

    for (let task of data.tasks) {
      const { data } = await axios.get(`https://to-do-list-backend-rd9g.onrender.com/tasks/${task}`, {
        headers: { Authorization: `${token}` },
      });
      const taskItem = data.task;
      Tasks.push(taskItem);
    }

    localStorage.setItem('tasks', JSON.stringify(Tasks));
  } catch (error) {
    console.error(error);
  } finally {
    console.log(localStorage.getItem('tasks'));
  }
}

document.getElementById('display-btn').addEventListener('click', (event) => {
  event.preventDefault();
  const statusFilter = document.getElementById('statusFilter');
  statusFilter.value = 'all';
  renderTasks();
});

// Function to handle task completion with optimistic UI update
async function handleTaskCompletion(taskId, isCompleted) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskIndex = tasks.findIndex(task => task._id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = isCompleted ? 'Done' : 'Pending';
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(); // Update the UI optimistically

    try {
      const status = isCompleted ? 'Done' : 'Pending';
      await axios.put(`https://to-do-list-backend-rd9g.onrender.com/tasks/${taskId}`, { status }, { headers: { Authorization: `${token}` } });
      console.log(`Task ${taskId} updated to ${status}`);
    } catch (error) {
      console.error(`Error updating task: ${error}`);
      // Optionally revert the UI if the update fails
      tasks[taskIndex].status = isCompleted ? 'Pending' : 'Done';
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    }
  }
}

document.getElementById('hide-btn').addEventListener('click', (event) => {
  event.preventDefault();
  const taskList = document.getElementById('taskList');
  taskList.style.display = 'none';
  taskList.innerHTML = '';
});

document.addEventListener('click', function (event) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskid = event.target.getAttribute('taskid');

  if (event.target.classList.contains('edit-icon')) {
    console.log('Edit icon clicked');
    const taskContent = tasks[taskid];
    const inputToEdit = document.createElement('input');
    inputToEdit.type = 'text';
    inputToEdit.value = taskContent;

    const DivItem = event.target.closest('.task-item');
    const listItem = DivItem.querySelector('li');
    listItem.textContent = '';
    listItem.appendChild(inputToEdit);

    const savebutton = document.createElement('button');
    savebutton.textContent = 'Save';
    savebutton.style.marginTop = '7px';
    listItem.appendChild(savebutton);

    savebutton.addEventListener('click', (e) => {
      e.preventDefault();
      const newTask = inputToEdit.value.trim();
      editTaskByIndex(tasks, taskid, newTask);
    });
  } else if (event.target.classList.contains('delete-icon')) {
    console.log('Delete icon clicked');
    deleteTaskByIndex(tasks, taskid);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  }
});

async function renderTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskList = document.getElementById('taskList');
  const selectedFilter = document.getElementById('statusFilter').value;
  
  taskList.style.display = 'block';
  taskList.innerHTML = '';

  try{
  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') return task.status === 'Pending';
    if (selectedFilter === 'done') return task.status === 'Done';
  });

  for (let i = 0; i < filteredTasks.length; i++) {
    const divItem = document.createElement('div');
    divItem.className = 'task-item';

    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.checked = filteredTasks[i].status === 'Done';
    checkBox.addEventListener('change', () => handleTaskCompletion(filteredTasks[i]._id, checkBox.checked));

    const listItem = document.createElement('li');
    listItem.textContent = `Task: ${filteredTasks[i].task}`;

    const dueDateItem = document.createElement('p');
    const dueDate = new Date(filteredTasks[i].dueDate).toLocaleDateString();
    dueDateItem.textContent = `Due: ${dueDate}`;

    const statusItem = document.createElement('p');
    statusItem.textContent = `${filteredTasks[i].status}`;

    if (filteredTasks[i].status === 'Pending') {
      statusItem.style.color = 'orange';
      const taskDueDate = new Date(filteredTasks[i].dueDate);

      if (taskDueDate < Date.now()) {
        statusItem.textContent += ' - Task overdue';
        statusItem.style.color = 'red';
      }
    } else if (filteredTasks[i].status === 'Done') {
      listItem.style.textDecoration = 'line-through';
      statusItem.style.color = 'green';
    }

    const iconsDiv = document.createElement('div');
    iconsDiv.className = 'iconsDiv';

    const editIcon = document.createElement('i');
    editIcon.className = 'fas fa-pen edit-icon';
    editIcon.setAttribute('taskid', i);

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-times delete-icon';
    deleteIcon.setAttribute('taskid', i);

    iconsDiv.appendChild(editIcon);
    iconsDiv.appendChild(deleteIcon);

    divItem.appendChild(checkBox);
    divItem.appendChild(listItem);
    divItem.appendChild(dueDateItem);
    divItem.appendChild(statusItem);
    divItem.appendChild(iconsDiv);

    taskList.appendChild(divItem);
  }
} catch (error) {
  console.error('Error fetching tasks:', error);
}
}
