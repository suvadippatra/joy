import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { CBTTest, staticCbtTests } from '../data/cbtData';

export function useCBTData() {
  const [tests, setTests] = useState<CBTTest[]>(staticCbtTests);
  const [loading, setLoading] = useState(true);

  const loadTests = async () => {
    try {
      const localTests: CBTTest[] = (await localforage.getItem('local_cbts')) || [];
      setTests([...staticCbtTests, ...localTests]);
    } catch (e) {
      console.error('Failed to load local tests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const addLocalTest = async (test: CBTTest, htmlContent: string) => {
    const localTests: CBTTest[] = (await localforage.getItem('local_cbts')) || [];
    const newLocalTests = [...localTests, test];
    await localforage.setItem('local_cbts', newLocalTests);
    await localforage.setItem(test.id + '_html', htmlContent);
    setTests([...staticCbtTests, ...newLocalTests]);
  };

  const deleteLocalTest = async (id: string) => {
    const localTests: CBTTest[] = (await localforage.getItem('local_cbts')) || [];
    const newLocalTests = localTests.filter(t => t.id !== id);
    await localforage.setItem('local_cbts', newLocalTests);
    await localforage.removeItem(id + '_html');
    setTests([...staticCbtTests, ...newLocalTests]);
  };

  return { tests, loading, addLocalTest, deleteLocalTest, refresh: loadTests };
}
