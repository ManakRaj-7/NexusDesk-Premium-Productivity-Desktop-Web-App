import { useEffect, useMemo, useRef, useState } from 'react';
import { MainLayout } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import { sessionsService } from '../../services';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

const SESSION_DURATIONS = {
  pomodoro: 25 * 60,
  focus: 60 * 60,
};

export default function FocusPage() {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('pomodoro');
  const [statusMessage, setStatusMessage] = useState('');
  const completedRef = useRef(false);

  const durationMinutes = useMemo(
    () => Math.round(SESSION_DURATIONS[sessionType] / 60),
    [sessionType]
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    completedRef.current = false;
    setStatusMessage('');
    setTimeLeft(SESSION_DURATIONS[sessionType]);
  };

  const handleSessionTypeChange = (type) => {
    setSessionType(type);
    setIsRunning(false);
    completedRef.current = false;
    setStatusMessage('');
    setTimeLeft(SESSION_DURATIONS[type]);
  };

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = window.setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft > 0 || !isRunning || completedRef.current) return;

    const saveSession = async () => {
      completedRef.current = true;
      setIsRunning(false);
      try {
        await sessionsService.create({
          type: sessionType,
          duration: durationMinutes,
        });
        setStatusMessage('Session saved. Nice work.');
      } catch (error) {
        console.error('Failed to save focus session:', error);
        setStatusMessage('Session completed, but saving failed.');
      }
    };

    saveSession();
  }, [durationMinutes, isRunning, sessionType, timeLeft]);

  return (
    <MainLayout>
      <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-100 mb-2">Focus Mode</h1>
            <p className="text-slate-400">Stay focused, one session at a time</p>
          </div>

          <Card className="p-12 text-center border-2 border-primary-500/30">
            <div className="text-7xl font-bold text-primary-400 font-mono mb-4">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-slate-400 mb-6 capitalize">{sessionType} Session</p>
            {statusMessage && (
              <p className="text-sm text-primary-300 mb-6">{statusMessage}</p>
            )}

            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={handleStart}
                disabled={isRunning}
                className="p-4 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Play size={24} className="text-white" />
              </button>
              <button
                onClick={handlePause}
                disabled={!isRunning}
                className="p-4 rounded-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                <Pause size={24} className="text-white" />
              </button>
              <button
                onClick={handleReset}
                className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                <RotateCcw size={24} className="text-white" />
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSessionTypeChange('pomodoro')}
              className={`p-4 rounded-lg font-medium transition-all ${
                sessionType === 'pomodoro'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-card text-slate-400 hover:text-slate-100'
              }`}
            >
              Pomodoro (25m)
            </button>
            <button
              onClick={() => handleSessionTypeChange('focus')}
              className={`p-4 rounded-lg font-medium transition-all ${
                sessionType === 'focus'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-card text-slate-400 hover:text-slate-100'
              }`}
            >
              Focus (60m)
            </button>
          </div>

          <Card className="p-6 bg-slate-700/20 border-slate-700">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Clock size={16} />
              <div>
                <p className="font-medium">Tips for productive focus</p>
                <p className="text-xs text-slate-400 mt-1">Eliminate distractions, silence notifications, and take breaks between sessions.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
