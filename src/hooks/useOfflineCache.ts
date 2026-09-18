import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { CBTTest } from '../data/cbtData';

export function useOfflineCache() {
  const [downloadedTests, setDownloadedTests] = useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});

  const checkCache = useCallback(async () => {
    try {
      const keys = await localforage.keys();
      const downloadedMap: Record<string, boolean> = {};
      keys.forEach(key => {
        if (key.endsWith('_html')) {
          const testId = key.replace('_html', '');
          downloadedMap[testId] = true;
        }
      });
      setDownloadedTests(downloadedMap);
    } catch (e) {
      console.error('Failed to check offline cache', e);
    }
  }, []);

  useEffect(() => {
    checkCache();
  }, [checkCache]);

  const downloadTest = async (test: CBTTest) => {
    if (test.isLocal || downloadedTests[test.id]) return; // Already local or cached

    setIsDownloading(prev => ({ ...prev, [test.id]: true }));
    try {
      const basePath = import.meta.env.BASE_URL;
      const normalizedPath = test.filename?.startsWith('/') ? test.filename.slice(1) : (test.filename || '');
      const res = await fetch(basePath + normalizedPath);
      if (!res.ok) throw new Error('Failed to fetch test HTML');
      const html = await res.text();
      
      await localforage.setItem(test.id + '_html', html);
      setDownloadedTests(prev => ({ ...prev, [test.id]: true }));
    } catch (e) {
      console.error('Failed to download test for offline use', e);
      alert('Failed to download test. Please check your connection.');
    } finally {
      setIsDownloading(prev => ({ ...prev, [test.id]: false }));
    }
  };

  const removeDownload = async (testId: string) => {
    try {
      await localforage.removeItem(testId + '_html');
      setDownloadedTests(prev => {
        const next = { ...prev };
        delete next[testId];
        return next;
      });
    } catch (e) {
      console.error('Failed to remove offline test', e);
    }
  };

  return { downloadedTests, isDownloading, downloadTest, removeDownload, checkCache };
}
