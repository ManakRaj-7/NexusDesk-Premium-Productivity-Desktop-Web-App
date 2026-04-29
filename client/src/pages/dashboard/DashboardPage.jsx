import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import { dashboardService } from '../../services';
import { setSummary } from '../../store/slices/dashboardSlice';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardService.getSummary();
        dispatch(setSummary(response.data));
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      }
    };

    fetchDashboard();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">Welcome back!</h1>
          <p className="text-slate-400">Here's what's happening in your workspace today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-slate-400 text-sm mb-2">To Do</p>
            <p className="text-3xl font-bold text-primary-400">{data.tasksStats.todo}</p>
          </Card>
          <Card className="p-6">
            <p className="text-slate-400 text-sm mb-2">In Progress</p>
            <p className="text-3xl font-bold text-accent-400">{data.tasksStats.doing}</p>
          </Card>
          <Card className="p-6">
            <p className="text-slate-400 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-400">{data.tasksStats.done}</p>
          </Card>
          <Card className="p-6">
            <p className="text-slate-400 text-sm mb-2">Focus Time Today</p>
            <p className="text-3xl font-bold text-primary-400">{data.focusTimeToday} min</p>
          </Card>
        </div>

        {/* Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-100">Today's Tasks</h2>
              <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
                <Plus size={16} />
                Add Task
              </Button>
            </div>
            <div className="space-y-3">
              {data.todaysTasks?.length > 0 ? (
                data.todaysTasks.map((task) => (
                  <Card key={task._id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-100">{task.title}</p>
                      <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-primary-500/20 text-primary-400">
                        {task.priority}
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="p-8 border-2 border-dashed border-dark-border rounded-xl text-center flex flex-col items-center justify-center bg-dark-card/50">
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4">
                    <span className="text-3xl">☕</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-1">You're all caught up!</h3>
                  <p className="text-sm text-slate-400">No tasks due today. Take a break or plan ahead.</p>
                </div>
              )}
            </div>

            {/* Quick Scratchpad Feature */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-100">Quick Scratchpad</h2>
                <span className="text-xs text-slate-400">Saves automatically</span>
              </div>
              <Card className="p-0 overflow-hidden border-dark-border focus-within:border-primary-500 transition-colors">
                <textarea
                  className="w-full h-40 bg-transparent text-slate-100 p-4 resize-none focus:outline-none placeholder-slate-500"
                  placeholder="Jot down a quick thought, idea, or phone number..."
                  defaultValue={localStorage.getItem('nexus_scratchpad') || ''}
                  onChange={(e) => localStorage.setItem('nexus_scratchpad', e.target.value)}
                />
              </Card>
            </div>
          </div>

          {/* Streak & Stats */}
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Current Streak</p>
              <p className="text-4xl font-bold text-primary-400 mb-2">{data.currentStreak} 🔥</p>
              <p className="text-xs text-slate-400">Keep up the momentum!</p>
            </Card>

            <Card className="p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Longest Streak</p>
              <p className="text-3xl font-bold text-accent-400">{data.longestStreak} days</p>
            </Card>

            <Card className="p-6">
              <p className="text-slate-400 text-sm mb-4">Quick Stats</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Notes</span>
                  <span className="font-medium text-slate-100">{data.totalNotes}</span>
                </div>
                <div className="flex justify-between border-t border-dark-border pt-3">
                  <span className="text-slate-400">Total Tasks</span>
                  <span className="font-medium text-slate-100">{data.totalTasks}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
