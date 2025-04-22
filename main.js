let taskList;
let addTask;
let tasks = [];

window.addEventListener('load', () => {
    taskList = document.querySelector('#task-list');
    addTask = document.querySelector('#add-task');

    if (localStorage.getItem('token')) {
        loadTasksFromServer();
    } else {
        window.location.href = 'login.html';  
    }

    addTask.addEventListener('click', async () => {
        const newTask = await createTaskOnServer();
        tasks.push(newTask);
        const taskRow = createTaskRow(newTask);
        taskList.appendChild(taskRow);
    });
});

async function loadTasksFromServer() {
    const response = await fetch('/api/tasks', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });

    if (!response.ok) {
        console.error("Failed to load tasks", response.statusText);
        return;
    }

    tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskRow = createTaskRow(task);
        taskList.appendChild(taskRow);
    });
}

async function createTaskOnServer() {
    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            title: 'New Task',
            description: '',
            marked_as_done: false  
        })
    });

    if (!response.ok) {
        console.error("Failed to create task", response.statusText);
        return null;
    }

    return await response.json();
}

async function updateTaskOnServer(task) {
    console.log(`Updating task with ID: ${task.id} | marked_as_done: ${task.marked_as_done}`);

    const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            title: task.title,
            description: task.description,
            marked_as_done: task.marked_as_done  
        })
    });

    if (!response.ok) {
        console.error(`Failed to update task with id ${task.id}`, response.statusText);
    } else {
        console.log(`Updated task:`, task);
    }
}

async function deleteTaskFromServer(taskId) {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });

    if (!response.ok) {
        console.error(`Failed to delete task with id ${taskId}`, response.statusText);
    }
}

function createTaskRow(task) {
    let taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.classList.remove('hidden');
    taskRow.removeAttribute('data-template');

    const name = taskRow.querySelector("[name='name']");
    name.value = task.title;
    name.addEventListener('blur', () => {
        task.title = name.value;
        updateTaskOnServer(task);  
    });

    const input = taskRow.querySelector('.ant-checkbox-input');
    const checkbox = taskRow.querySelector('.ant-checkbox');

    input.checked = task.marked_as_done; 
    if (input.checked) {
        checkbox.classList.add('ant-checkbox-checked');
    }

    input.addEventListener('change', () => {
        checkbox.classList.toggle('ant-checkbox-checked');
        task.marked_as_done = input.checked; 
        updateTaskOnServer(task); 
    });

    const deleteButton = taskRow.querySelector('.delete-task');
    deleteButton.addEventListener('click', () => {
        taskList.removeChild(taskRow);
        tasks = tasks.filter(t => t.id !== task.id);
        deleteTaskFromServer(task.id);  
    });

    return taskRow;
}
