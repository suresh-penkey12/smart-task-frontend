import React, { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask, completeTask, exportTasks, predictCategory, generateDescription } from '../services/api';

interface Task {
  id: number;
  name: string;
  description: string;
  category: string;
  due_date: string;
  status: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<Partial<Task>>({});
  const [editing, setEditing] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [sort, setSort] = useState<'due_date'|'status'|'category'>('due_date');

  const fetchTasks = () => getTasks().then(res => { setTasks(res.data); setLoading(false); });

  useEffect(() => { fetchTasks(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateTask(editing.id, form);
      setEditing(null);
    } else {
      await createTask(form);
    }
    setForm({});
    fetchTasks();
  };

  const handleEdit = (task: Task) => {
    setEditing(task);
    setForm(task);
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    fetchTasks();
  };

  const handleComplete = async (id: number) => {
    await completeTask(id);
    fetchTasks();
  };

  const handleExport = async (type: 'csv'|'excel'|'pdf') => {
    const res = await exportTasks(type);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tasks.${type}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePredictCategory = async () => {
    if (!form.description) return;
    setAiLoading(true);
    const res = await predictCategory(form.description);
    setForm(f => ({ ...f, category: res.data.category }));
    setAiLoading(false);
  };

  const handleGenerateDescription = async () => {
    if (!form.name) return;
    setAiLoading(true);
    const res = await generateDescription(form.name);
    setForm(f => ({ ...f, description: res.data.description }));
    setAiLoading(false);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sort === 'due_date') return (a.due_date || '').localeCompare(b.due_date || '');
    if (sort === 'status') return (a.status || '').localeCompare(b.status || '');
    if (sort === 'category') return (a.category || '').localeCompare(b.category || '');
    return 0;
  });

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2>Tasks</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input name="name" placeholder="Task Name" value={form.name || ''} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description || ''} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category || ''} onChange={handleChange} />
        <input name="due_date" type="date" value={form.due_date ? form.due_date.slice(0,10) : ''} onChange={handleChange} />
        <button type="button" onClick={handlePredictCategory} disabled={aiLoading}>AI Predict Category</button>
        <button type="button" onClick={handleGenerateDescription} disabled={aiLoading}>AI Generate Description</button>
        <button type="submit">{editing ? 'Update' : 'Add'} Task</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button>}
      </form>
      <div>
        <label>Sort by: </label>
        <select value={sort} onChange={e => setSort(e.target.value as any)}>
          <option value="due_date">Due Date</option>
          <option value="status">Status</option>
          <option value="category">Category</option>
        </select>
        <button onClick={() => handleExport('csv')}>Download CSV</button>
        <button onClick={() => handleExport('excel')}>Download Excel</button>
        <button onClick={() => handleExport('pdf')}>Download PDF</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 20 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map(task => (
              <tr key={task.id} style={{ background: task.status === 'completed' ? '#e0ffe0' : undefined }}>
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td>{task.category}</td>
                <td>{task.due_date ? task.due_date.slice(0,10) : ''}</td>
                <td>{task.status}</td>
                <td>
                  <button onClick={() => handleEdit(task)}>Edit</button>
                  <button onClick={() => handleDelete(task.id)}>Delete</button>
                  {task.status !== 'completed' && <button onClick={() => handleComplete(task.id)}>Mark Complete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Tasks; 