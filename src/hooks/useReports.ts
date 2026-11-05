import React, { useState, useEffect, useCallback } from 'react';
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
      
      // Intelligently deduplicate: if there's a report for this test within the last 12 hours, update it instead of duplicating.
      const now = new Date();
      const existingIndex = data.findIndex(r => {
        if (r.testId !== report.testId) return false;
        const rDate = new Date(r.date);
        const hoursDiff = (now.getTime() - rDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 12;
      });

      let updated;
      if (existingIndex !== -1) {
        // Update existing report with latest stats (live sync)
        const updatedReport = {
          ...data[existingIndex],
          ...report,
          date: now.toISOString() // refresh date to now
        };
        updated = [...data];
        updated[existingIndex] = updatedReport;
      } else {
        // Create new report
        const newReport: ExamReport = {
          ...report,
          id: 'rep_' + Date.now(),
          date: now.toISOString()
        };
        updated = [newReport, ...data];
      }

      await localforage.setItem('cbt_reports', updated);
      // Sort by newest first
      updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
