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
      <h2>Backlog</h2>
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
    <NewTask handleChange={handleChange} addTask={addTask}/>
    <Backlog backlog={backlog}/>
    </>
  );
}

export default App;

