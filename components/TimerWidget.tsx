
import React, { useState, useEffect } from 'react';

const TimerItem = ({ id, onDelete }: any) => {
    const [label, setLabel] = useState(`Chat ${id}`);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [initialTime, setInitialTime] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            // Timer finished logic (visual handled in render)
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const addTime = (minutes) => {
        const seconds = minutes * 60;
        setTimeLeft(prev => {
            const newTime = prev + seconds;
            setInitialTime(newTime);
            return newTime;
        });
        setIsRunning(true);
    };

    const toggleTimer = () => setIsRunning(!isRunning);
    
    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(0);
        setInitialTime(0);
    };

    const isAlarm = timeLeft === 0 && initialTime > 0;

    return (
        <div className={`p-3 rounded-xl border transition-all duration-300 ${isAlarm ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-pulse' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
            <div className="flex justify-between items-center mb-2">
                <input 
                    type="text" 
                    value={label} 
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-transparent text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide focus:outline-none focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors w-24"
                />
                <button onClick={() => onDelete(id)} className="text-zinc-400 hover:text-red-500 transition-colors" title="Remove Timer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div className="flex items-center justify-between mb-3">
                <div className={`text-3xl font-mono font-bold tracking-tight ${isAlarm ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="flex gap-1">
                    {timeLeft > 0 ? (
                         <button 
                            onClick={toggleTimer}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isRunning ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}
                        >
                            {isRunning ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ) : (
                        <button onClick={resetTimer} className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => addTime(2)} className="py-1 px-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">+2m</button>
                <button onClick={() => addTime(5)} className="py-1 px-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">+5m</button>
                <button onClick={() => addTime(15)} className="py-1 px-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">+15m</button>
            </div>
        </div>
    );
};

const TimerWidget = () => {
    const [timers, setTimers] = useState([{ id: Date.now() }]);

    const addTimer = () => {
        setTimers([...timers, { id: Date.now() }]);
    };

    const removeTimer = (id: number) => {
        setTimers(timers.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Timers</h3>
                <button 
                    onClick={addTimer}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add
                </button>
            </div>
            <div className="space-y-3">
                {timers.map(timer => (
                    <TimerItem key={timer.id} id={timer.id} onDelete={removeTimer} />
                ))}
                {timers.length === 0 && (
                    <div className="text-center py-6 bg-zinc-50 dark:bg-white/5 rounded-xl border border-dashed border-zinc-200 dark:border-white/10">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">No active timers</p>
                        <button onClick={addTimer} className="mt-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline">Create one</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimerWidget;
