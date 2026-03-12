import { useLocalStorage } from './useLocalStorage';
import { Activity } from '../types';

const INITIAL_ACTIVITIES: Activity[] = [];

export function useActivityLog() {
  const [activities, setActivities] = useLocalStorage<Activity[]>('mission-activities', INITIAL_ACTIVITIES);

  const addActivity = (type: Activity['type'], message: string, metadata?: Record<string, any>) => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setActivities([newActivity, ...activities].slice(0, 100)); // Keep last 100 activities
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
