import React, { useState, useEffect } from 'react';
import axios from 'axios';

////////////////
////////////////
// UTILS ///////

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
});

const formatTime = (timeInSeconds) => {
  if (timeInSeconds === 0) {
    return "Not started";
  }

  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  return [
    hours ? `${hours} hr${hours > 1 ? 's' : ''}` : null,
    minutes ? `${minutes} min${minutes > 1 ? 's' : ''}` : null,
    seconds ? `${seconds} sec${seconds > 1 ? 's' : ''}` : null,
  ]
    .filter((part) => part !== null)
    .join(' ');
};



////////////////
////////////////
// COMPONENTS //

const NewTask = ({ handleChange, addTask, newTask }) => {

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      addTask();
    }
  };
  return (
    <>
      <input
        type="text"
        placeholder="Enter new task"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={newTask}
      />
      <button onClick={addTask}>Add</button>
    </>
  );
};

const Backlog = ({ backlog, moveToActive, deleteTask, completeFromBacklog }) => {
  const sortedBacklog = backlog.sort((a, b) => b.spentTime - a.spentTime);

  return (
    <div>
      {/* <h4>Backlog</h4> */}
      <table>
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Spent Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedBacklog.map((task, index) => (
            <tr key={index}>
              <td>
                <button onClick={() => moveToActive(task)}>{task.name}</button>
              </td>
              <td>{formatTime(task.spentTime)}</td>
              <button onClick={() => completeFromBacklog(task)}>🏁</button>
              <button onClick={() => deleteTask(task)}>💀</button>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Active = ({ activeTask, pauseTask, completeTask, timer, setTimer }) => {

  useEffect(() => {
    if (activeTask) {
      setTimer(activeTask.spentTime);
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTask]);

  return (
    <>
      <h4>In progress... ⌛</h4>
      {activeTask ? (
        <>
          <div>
            {activeTask.name} - {formatTime(timer)}
          </div>
          <button onClick={() => pauseTask(timer)}>Pause</button>
          <button onClick={() => completeTask(timer)}>Done</button>

        </>
      ) : (
        <div>No active task</div>
      )}
    </>
  );

  


};

const Completed = ({ completed }) => {
  return (
    <div>
      <h4>Completed</h4>
      <table>
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Spent Time</th>
          </tr>
        </thead>
        <tbody>
          {completed.map((task, index) => (
            <tr key={index}>
              <td>{task.name}</td>
              <td>{formatTime(task.spentTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Today = ({ completedToday, spentTimeToday }) => {
  return (
    <div>
      <h4>Today's Progress</h4>
      <p>
        Today you completed {completedToday} {completedToday === 1 ? 'task' : 'tasks'} in {formatTime(spentTimeToday)}
      </p>
    </div>
  );
};


////////////////
////////////////
// APP /////////

function App() {
  
  //////////////
  //////////////
  // VARIABLES /
  
  const [newTask, setNewTask] = useState('');
  const [backlog, setBacklog] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0);
  const [spentTimeToday, setSpentTimeToday] = useState(0);

////////////////
////////////////
// FUNCTION ////


  const handleChange = (event) => {
    setNewTask(event.target.value);
  };

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/api/tasks');
      const tasks = response.data;
      setBacklog(tasks.filter((task) => !task.active && !task.completed));
      setCompleted(tasks.filter((task) => task.completed));

      // Calculate tasksCompletedToday and spentTimeToday
      const today = new Date();
      const tasksCompletedToday = tasks.filter(
        (task) => task.completed && new Date(task.completedAt).toDateString() === today.toDateString()
      );
      setTasksCompletedToday(tasksCompletedToday.length);
      setSpentTimeToday(tasksCompletedToday.reduce((acc, task) => acc + task.spentTime, 0));

    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (newTask.trim() !== '') {
      const taskData = { name: newTask, spentTime: 0, active: false, completed: false };
      try {
        const response = await axiosInstance.post('/api/tasks', taskData);
        setBacklog([...backlog, response.data]);
        setNewTask('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };
  
  const moveToActive = async (task) => {
    if (activeTask) {
      try {
        await axiosInstance.patch(`/api/tasks/${activeTask._id}`, { spentTime: timer, active: false });
        setBacklog((prevBacklog) => [
          ...prevBacklog,
          {
            ...activeTask,
            spentTime: timer,
          },
        ]);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  
    try {
      await axiosInstance.patch(`/api/tasks/${task._id}`, { active: true });
      setActiveTask(task);
      setBacklog((prevBacklog) => prevBacklog.filter((t) => t !== task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const pauseTask = async (timer) => {
    const currentActiveTask = activeTask;
    setActiveTask(null);
    try {
      await axiosInstance.patch(`/api/tasks/${currentActiveTask._id}`, { spentTime: timer, active: false });
      setBacklog((prevBacklog) => [
        ...prevBacklog,
        {
          ...currentActiveTask,
          spentTime: timer,
        },
      ]);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const completeTask = async (timer) => {
    const currentActiveTask = activeTask;
    setActiveTask(null);
    try {
      await axiosInstance.patch(`/api/tasks/${currentActiveTask._id}`, { spentTime: timer, active: false, completed: true });
      setCompleted([
        ...completed,
        {
          ...currentActiveTask,
          spentTime: timer,
        },
      ]);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const deleteTask = async (task) => {
    try {
      await axiosInstance.delete(`/api/tasks/${task._id}`);
      setBacklog((prevBacklog) => prevBacklog.filter((t) => t !== task));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  
  const completeFromBacklog = async (task) => {
    try {
      await axiosInstance.patch(`/api/tasks/${task._id}`, { completed: true });
      setBacklog((prevBacklog) => prevBacklog.filter((t) => t !== task));
      setCompleted([...completed, task]);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  

  return (
    <>
      <Today completedToday={tasksCompletedToday} spentTimeToday={spentTimeToday} />
      {activeTask && <Active activeTask={activeTask} pauseTask={pauseTask} completeTask={completeTask} timer={timer} setTimer={setTimer}/>}
      {backlog.length > 0 && <Backlog backlog={backlog} moveToActive={moveToActive} deleteTask={deleteTask} completeFromBacklog={completeFromBacklog}/>}
      <NewTask handleChange={handleChange} addTask={addTask} newTask={newTask}/>
      {completed.length > 0 && <Completed completed={completed} />}

    </>
  );
}

export default App