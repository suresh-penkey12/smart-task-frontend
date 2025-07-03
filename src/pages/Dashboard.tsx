import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Task {
  id: number;
  name: string;
  description: string;
  category: string;
  due_date: string;
  status: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF6699'];

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks().then(res => {
      setTasks(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const today = new Date().toISOString().slice(0, 10);
  const tasksDueToday = tasks.filter(t => t.due_date && t.due_date.slice(0, 10) === today);
  const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completedLast7 = tasks.filter(t => t.status === 'completed' && t.due_date && new Date(t.due_date) >= last7);
  const upcoming = tasks.filter(t => t.due_date && t.due_date.slice(0, 10) > today);
  const categoryCounts = tasks.reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2>Dashboard</h2>
      <div>Tasks due today: {tasksDueToday.length}</div>
      <div>Upcoming tasks: {upcoming.length}</div>
      <div>Tasks completed in last 7 days: {completedLast7.length}</div>
      <h3>Most Popular Task Categories</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {categoryData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <h3>Tasks Completed in Last 7 Days</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={completedLast7.map(t => ({ name: t.name, value: 1 }))}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#0088FE" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard; 