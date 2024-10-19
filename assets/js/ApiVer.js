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
  }
}

document.getElementById('display-btn').addEventListener('click', (event) => {
  event.preventDefault();
  const statusFilter = document.getElementById('statusFilter');
  statusFilter.value = 'all';
  fetchTasks();
  renderTasks();
});

async function handleTaskCompletion(taskId, isCompleted) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskIndex = tasks.findIndex(task => task._id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = isCompleted ? 'Done' : 'Pending';
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    try {
      const status = isCompleted ? 'Done' : 'Pending';
      await axios.put(`https://to-do-list-backend-rd9g.onrender.com/tasks/${taskId}`, { status }, { headers: { Authorization: `${token}` } });
    } catch (error) {
      console.error(`Error updating task: ${error}`);
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

document.addEventListener('click', async function (event) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskid = event.target.getAttribute('taskid');

  if (event.target.classList.contains('edit-icon')) {
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
    const { data } = await axios.delete(`https://to-do-list-backend-rd9g.onrender.com/tasks/${taskid}`, { headers: { Authorization: `${token}` } });
    if (data.message == 'success') {
      alert("Task deleted successfully!");
      const updatedTasks = tasks.filter(task => task._id !== taskid);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      renderTasks();
    }
  }
});

let currentPage = 1;
const tasksPerPage = 5;

async function renderTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const taskList = document.getElementById('taskList');
  const selectedFilter = document.getElementById('statusFilter').value;

  taskList.style.display = 'block';
  taskList.innerHTML = '';

  try {
    const filteredTasks = tasks.filter(task => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'pending') return task.status === 'Pending';
      if (selectedFilter === 'done') return task.status === 'Done';
    });

    const totalTasks = filteredTasks.length;
    const totalPages = Math.ceil(totalTasks / tasksPerPage);

    // Paginate tasks
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const tasksToDisplay = filteredTasks.slice(startIndex, endIndex);

    for (let i = 0; i < tasksToDisplay.length; i++) {
      const divItem = document.createElement('div');
      divItem.className = 'task-item';

      const checkBox = document.createElement('input');
      checkBox.type = 'checkbox';
      checkBox.checked = tasksToDisplay[i].status === 'Done';
      checkBox.addEventListener('change', () => handleTaskCompletion(tasksToDisplay[i]._id, checkBox.checked));

      const listItem = document.createElement('li');
      listItem.textContent = `Task: ${tasksToDisplay[i].task}`;

      const dueDateItem = document.createElement('p');
      const dueDate = new Date(tasksToDisplay[i].dueDate).toLocaleDateString();
      dueDateItem.textContent = `Due: ${dueDate}`;

      const statusItem = document.createElement('p');
      statusItem.textContent = `${tasksToDisplay[i].status}`;

      if (tasksToDisplay[i].status === 'Pending') {
        statusItem.style.color = 'orange';
        const taskDueDate = new Date(tasksToDisplay[i].dueDate);
        if (taskDueDate < Date.now()) {
          statusItem.textContent += ' - Task overdue';
          statusItem.style.color = 'red';
        }
      } else if (tasksToDisplay[i].status === 'Done') {
        listItem.style.textDecoration = 'line-through';
        statusItem.style.color = 'green';
      }

      const iconsDiv = document.createElement('div');
      iconsDiv.className = 'iconsDiv';

      const editIcon = document.createElement('i');
      editIcon.className = 'fas fa-pen edit-icon';
      editIcon.setAttribute('taskid', tasksToDisplay[i]._id);

      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'fas fa-times delete-icon';
      deleteIcon.setAttribute('taskid', tasksToDisplay[i]._id);

      iconsDiv.appendChild(editIcon);
      iconsDiv.appendChild(deleteIcon);

      divItem.appendChild(checkBox);
      divItem.appendChild(listItem);
      divItem.appendChild(dueDateItem);
      divItem.appendChild(statusItem);
      divItem.appendChild(iconsDiv);

      taskList.appendChild(divItem);
    }

    // Create pagination controls
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.className = i === currentPage ? 'active-page pagination-button' : 'pagination-button';
      pageButton.addEventListener('click', () => {
        currentPage = i;
        renderTasks();
      });
      paginationDiv.appendChild(pageButton);
    }

    taskList.appendChild(paginationDiv);

  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}


document.getElementById('taskForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const today = new Date().toISOString().split('T')[0]; 
  const errorMessage = document.getElementById('errorMessage');
  const task = document.getElementById('taskInput').value;
  const date = document.getElementById('date').value;
  const status = 'Pending';

  if (date < today) {
    errorMessage.textContent = 'The date cannot be in the past. Please select a valid date.';
    return;
  } else {
    errorMessage.textContent = '';
  }

  const Formdata = {
    task,
    status,
    dueDate: date
  };

  try {
    const { data } = await axios.post(`https://to-do-list-backend-rd9g.onrender.com/tasks`, Formdata, {
      headers: { Authorization: `${token}` }
    });

    if (data.message == 'success') {
      alert('Task added successfully!');
      const newTask = {
        _id: data.task._id,
        task: data.task.task,
        status,
        dueDate: date,
      };
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    }
  } catch (error) {
    console.error('Error adding task:', error);
  }
});
