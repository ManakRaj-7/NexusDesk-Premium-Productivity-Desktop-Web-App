import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MainLayout } from '../../components/layout';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import { tasksService } from '../../services';
import { setTasks, addTask } from '../../store/slices/tasksSlice';
import { Plus } from 'lucide-react';

const STATUS_COLORS = {
  todo: 'bg-slate-700',
  doing: 'bg-primary-500/20 text-primary-400',
  done: 'bg-green-500/20 text-green-400',
};

const PRIORITY_COLORS = {
  low: 'text-slate-400',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export default function TasksPage() {
  const dispatch = useDispatch();
  const { items: tasks } = useSelector((state) => state.tasks);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await tasksService.getAll(1, 100, {
          status: filter === 'all' ? null : filter,
        });
        dispatch(setTasks(response.data.tasks));
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    fetchTasks();
  }, [dispatch, filter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await tasksService.create(formData);
      dispatch(addTask(response.data.task));
      setFormData({ title: '', description: '', priority: 'medium' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const groupedTasks = {
    todo: tasks.filter((t) => t.status === 'todo'),
    doing: tasks.filter((t) => t.status === 'doing'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Tasks</h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['todo', 'doing', 'done'].map((status) => (
            <div key={status}>
              <h2 className="text-lg font-semibold text-slate-100 mb-4 capitalize">{status}</h2>
              <div className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <Card key={task._id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-100 flex-1">{task.title}</h3>
                      <Badge variant="default" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-slate-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Task"
          size="md"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-slate-100 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-slate-100 focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
