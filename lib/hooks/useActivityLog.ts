import { useLocalStorage } from './useLocalStorage';
import { Activity } from '../types';

const INITIAL_ACTIVITIES: Activity[] = [];

export function useActivityLog() {
  const [activities, setActivities] = useLocalStorage<Activity[]>('mission-activities', INITIAL_ACTIVITIES);

  const addActivity = (type: Activity['type'], message: string, metadata?: Record<string, unknown>) => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setActivities((currentActivities) => [newActivity, ...currentActivities].slice(0, 100));
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const getRecentActivities = (limit: number = 20) => activities.slice(0, limit);

  return {
    activities,
    addActivity,
    clearActivities,
    getRecentActivities,
  };
}
