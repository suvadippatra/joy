import { useState, useEffect, useCallback } from 'react';

export const DEFAULT_SUBJECTS_MAP: Record<string, string[]> = {
  'Botany': ['Kattar Tests', 'Practice Sets'],
  'Zoology': ['Kattar Tests', 'Practice Sets'],
  'Physics': ['Kattar Tests', 'Practice Sets'],
  'Chemistry': ['Kattar Tests', 'Practice Sets'],
};

const STORAGE_KEY = 'cbt_subject_categories';
const CHANGE_EVENT = 'cbt_subjects_changed';

function loadStoredSubjectMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        // Ensure every subject has an array of categories
        const normalized: Record<string, string[]> = {};
        for (const [subj, cats] of Object.entries(parsed)) {
          if (Array.isArray(cats) && cats.length > 0) {
            normalized[subj] = cats.map(c => String(c).trim()).filter(Boolean);
          } else {
            normalized[subj] = ['Kattar Tests', 'Practice Sets'];
          }
        }
        return normalized;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored subject categories:', e);
  }
  return { ...DEFAULT_SUBJECTS_MAP };
}

function saveSubjectMap(map: Record<string, string[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (e) {
    console.error('Failed to save subject categories:', e);
  }
}

export function useSubjectCategories() {
  const [subjectMap, setSubjectMap] = useState<Record<string, string[]>>(loadStoredSubjectMap);

  const reload = useCallback(() => {
    setSubjectMap(loadStoredSubjectMap());
  }, []);

  useEffect(() => {
    window.addEventListener(CHANGE_EVENT, reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(CHANGE_EVENT, reload);
      window.removeEventListener('storage', reload);
    };
  }, [reload]);

  const subjects = Object.keys(subjectMap);

  const getCategoriesForSubject = useCallback((subject: string): string[] => {
    if (!subject) return ['Kattar Tests', 'Practice Sets'];
    // Find case-insensitive match
    const key = Object.keys(subjectMap).find(k => k.toLowerCase() === subject.toLowerCase());
    if (key && subjectMap[key] && subjectMap[key].length > 0) {
      return subjectMap[key];
    }
    return ['Kattar Tests', 'Practice Sets'];
  }, [subjectMap]);

  const getAllCategories = useCallback((): string[] => {
    const set = new Set<string>();
    (Object.values(subjectMap) as string[][]).forEach(cats => {
      cats.forEach(c => set.add(c));
    });
    return Array.from(set);
  }, [subjectMap]);

  const addSubject = useCallback((name: string, initialCategories?: string[]): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const exists = Object.keys(subjectMap).some(k => k.toLowerCase() === trimmed.toLowerCase());
    if (exists) return false;

    const cats = (initialCategories && initialCategories.length > 0) 
      ? initialCategories.map(c => c.trim()).filter(Boolean)
      : ['Kattar Tests', 'Practice Sets'];

    const next = { ...subjectMap, [trimmed]: cats };
    setSubjectMap(next);
    saveSubjectMap(next);
    return true;
  }, [subjectMap]);

  const deleteSubject = useCallback((name: string): boolean => {
    const key = Object.keys(subjectMap).find(k => k.toLowerCase() === name.toLowerCase());
    if (!key) return false;

    const next = { ...subjectMap };
    delete next[key];
    // Keep at least one subject
    if (Object.keys(next).length === 0) {
      return false;
    }
    setSubjectMap(next);
    saveSubjectMap(next);
    return true;
  }, [subjectMap]);

  const addCategory = useCallback((subject: string, category: string): boolean => {
    const trimmedCat = category.trim();
    if (!trimmedCat) return false;

    const key = Object.keys(subjectMap).find(k => k.toLowerCase() === subject.toLowerCase()) || subject;
    const currentCats = subjectMap[key] ? [...subjectMap[key]] : ['Kattar Tests', 'Practice Sets'];

    if (currentCats.some(c => c.toLowerCase() === trimmedCat.toLowerCase())) {
      return false; // Already exists in this subject
    }

    currentCats.push(trimmedCat);
    const next = { ...subjectMap, [key]: currentCats };
    setSubjectMap(next);
    saveSubjectMap(next);
    return true;
  }, [subjectMap]);

  const deleteCategory = useCallback((subject: string, category: string): boolean => {
    const key = Object.keys(subjectMap).find(k => k.toLowerCase() === subject.toLowerCase());
    if (!key || !subjectMap[key]) return false;

    const currentCats = subjectMap[key];
    if (currentCats.length <= 1) {
      // Must keep at least one category in a subject
      return false;
    }

    const nextCats = currentCats.filter(c => c.toLowerCase() !== category.toLowerCase());
    const next = { ...subjectMap, [key]: nextCats };
    setSubjectMap(next);
    saveSubjectMap(next);
    return true;
  }, [subjectMap]);

  const resetToDefault = useCallback(() => {
    setSubjectMap(DEFAULT_SUBJECTS_MAP);
    saveSubjectMap(DEFAULT_SUBJECTS_MAP);
  }, []);

  return {
    subjects,
    subjectMap,
    getCategoriesForSubject,
    getAllCategories,
    addSubject,
    deleteSubject,
    addCategory,
    deleteCategory,
    resetToDefault,
  };
}
