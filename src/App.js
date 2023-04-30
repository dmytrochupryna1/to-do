import React, { useState, useEffect } from 'react';

const NewTask = ({ handleChange, addTask, newTask }) => {
  return (
    <>
      <input
        type="text"
        placeholder="Enter new task"
        onChange={handleChange}
        value={newTask}
      />
      <button onClick={addTask}>Add</button>
    </>
  );
};

const formatTime = (timeInSeconds) => {
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

const Backlog = ({ backlog, moveToActive }) => {
  return (
    <div>
      <h4>Backlog</h4>
      <table>
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Spent Time</th>
          </tr>
        </thead>
        <tbody>
          {backlog.map((task, index) => (
            <tr key={index}>
              <td>
                <button onClick={() => moveToActive(task)}>{task.name}</button>
              </td>
              <td>{formatTime(task.spentTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Active = ({ activeTask, pauseTask, timer, setTimer }) => {

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
      <h3>In progress</h3>
      {activeTask ? (
        <>
          <div>
            {activeTask.name} - {formatTime(timer)}
          </div>
          <button onClick={() => pauseTask(timer)}>Pause</button>
        </>
      ) : (
        <div>No active task</div>
      )}
    </>
  );
};


function App() {
  // VARIABLES
  // ------------------------------------------
  const [newTask, setNewTask] = useState('');
  const [backlog, setBacklog] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);



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

  return (
    <>
      <Active activeTask={activeTask} pauseTask={pauseTask} timer={timer} setTimer={setTimer}/>
      <Backlog backlog={backlog} moveToActive={moveToActive} />
      <NewTask handleChange={handleChange} addTask={addTask} newTask={newTask}/>
    </>
  );
}

export default App