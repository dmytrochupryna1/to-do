import React, { useState, useEffect } from 'react';

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


const Backlog = ({ backlog, moveToActive, deleteTask, completeFromBacklog }) => {
  const sortedBacklog = backlog.sort((a, b) => b.spentTime - a.spentTime);

  return (
    <div>
      <h4>Backlog</h4>
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

function App() {
  // VARIABLES
  // ------------------------------------------
  const [newTask, setNewTask] = useState('');
  const [backlog, setBacklog] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const [completed, setCompleted] = useState([]);




  // FUNCTIONS
  // ------------------------------------------
  const handleChange = (event) => {
    setNewTask(event.target.value);
  };

  const addTask = () => {
    if (newTask.trim() !== '') {
      setBacklog([...backlog, { name: newTask, spentTime: 0 }]);
      setNewTask('');
    }
  };

  const moveToActive = (task) => {
    if (activeTask) {
      setBacklog((prevBacklog) => [
        ...prevBacklog,
        {
          name: activeTask.name,
          spentTime: timer,
        },
      ]);
    }
  
    setActiveTask(task);
    setBacklog((prevBacklog) => prevBacklog.filter((t) => t !== task));
  };
  
  const pauseTask = (timer) => {
    const currentActiveTask = activeTask; // Save the active task in a temporary variable
    setActiveTask(null);
    setBacklog((prevBacklog) => [
      ...prevBacklog,
      {
        name: currentActiveTask.name,
        spentTime: timer,
      },
    ]);
  };

  const completeTask = (timer) => {
    const currentActiveTask = activeTask;
    setActiveTask(null);
    setCompleted([
      ...completed,
      {
        name: currentActiveTask.name,
        spentTime: timer,
      },
    ]);
  };

  const deleteTask = (task) => {
    setBacklog((prevBacklog) => prevBacklog.filter((t) => t !== task));
  };
  
  const completeFromBacklog = (task) => {
    setBacklog((prevBacklog) => prevBacklog.filter((t) => t !== task));
    setCompleted([...completed, task]);
  };

  return (
    <>
      {activeTask && <Active activeTask={activeTask} pauseTask={pauseTask} completeTask={completeTask} timer={timer} setTimer={setTimer}/>}
      {backlog.length > 0 && <Backlog backlog={backlog} moveToActive={moveToActive} deleteTask={deleteTask} completeFromBacklog={completeFromBacklog}/>}
      <NewTask handleChange={handleChange} addTask={addTask} newTask={newTask}/>
      {completed.length > 0 && <Completed completed={completed} />}

    </>
  );
}

export default App