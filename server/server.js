const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

uri = "mongodb+srv://dmytrochupryna:uQLnkY84mCsVwwd5@kp.u17s6dm.mongodb.net/to-do"
mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true 
    })

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
      
mongoose.connection.on('error', (err) => {
    console.log(`Error connecting to MongoDB: ${err}`);
});

// Schema and Model for a Task

const taskSchema = new mongoose.Schema({
    name: String,
    spentTime: Number,
  });

const Task = mongoose.model('Task', taskSchema);

// API routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await Task.find();
      res.status(200).json(tasks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Add a task

// Add a new task
app.post('/api/tasks', async (req, res) => {
    const task = new Task(req.body);
  
    try {
      const savedTask = await task.save();
      res.status(201).json(savedTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });  

// Update a task
app.patch('/api/tasks/:id', async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(200).json(task);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Task deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });



const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server started on port ${port}`));