import React, {useState} from 'react';

const NewTask = ({handleChange, addTask }) => {
  return (
    <>
    <input 
      type="text"
      placeholder="Enter new task"
      onChange={handleChange}
    />
    <button
      onClick={addTask}
    >Add</button>
    </>
  );
}

const Backlog = ({ backlog }) => {

  const handleButtonClick = (task) => {
    console.log(`Clicked on ${task}`)
  }

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
              <button onClick={() => handleButtonClick(task)}>{task}</button>
                </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Active = () => {
  
  return (
    <>
    <h3>in progress</h3>
    </>
  )
}




function App() {

  // VARIABLES
  // ------------------------------------------
  const [newTask, setNewTask] = useState('');
  const [backlog, setBacklog] = useState([]);


  // FUNCTIONS
  // ------------------------------------------
  const handleChange = (event) => {
    setNewTask(event.target.value);
  }

  const addTask = () => {
    if (newTask.trim() !== '') {
      setBacklog([...backlog, newTask]);
      setNewTask('');
    }
  }

  return (
    <>
    <Active />    
    <Backlog backlog={backlog}/>
    <NewTask handleChange={handleChange} addTask={addTask}/>
    </>
  );
}

export default App;

