import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../shared/lib/axiosClient';

export interface DashboardData {
  userName: string;
  dailyGoal: { current: number; target: number; };
  streak: number;
  flashcard: { new: number; ready: number; overdue: number };
  nextQuiz: { date: string; title: string };
  mastered: { count: number; percentage: number };
  weeklyProgress: number[]; 
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setError('');
    try {
      const response = await axiosClient.get('/dashboard');
      setData(response.data.data); 
      
    } catch {
      setError('Không thể tải dữ liệu Dashboard. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { 
    data, 
    isLoading, 
    error, 
    refetch: fetchDashboardData 
  };
};