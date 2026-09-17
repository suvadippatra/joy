import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';

export interface ExamReport {
  id: string; // unique report ID
  testId: string;
  testTitle: string;
  subject: string;
  date: string;
  score: number;
  correct: number;
  wrong: number;
  accuracy: number;
  attempt: number;
  time: string;
}

export function useReports() {
  const [reports, setReports] = useState<ExamReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      const data: ExamReport[] = (await localforage.getItem('cbt_reports')) || [];
      setReports(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error('Failed to load reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const addReport = useCallback(async (report: Omit<ExamReport, 'id' | 'date'>) => {
    try {
      const data: ExamReport[] = (await localforage.getItem('cbt_reports')) || [];
      const newReport: ExamReport = {
        ...report,
        id: 'rep_' + Date.now(),
        date: new Date().toISOString()
      };
      const updated = [newReport, ...data];
      await localforage.setItem('cbt_reports', updated);
      setReports(updated);
    } catch (e) {
      console.error('Failed to save report', e);
    }
  }, []);

  const clearAllReports = useCallback(async () => {
    await localforage.removeItem('cbt_reports');
    setReports([]);
  }, []);

  return { reports, loading, addReport, clearAllReports, refresh: loadReports };
}
