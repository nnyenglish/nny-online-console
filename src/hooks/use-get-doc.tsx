import { useState, useCallback } from 'react';

import { FirebaseManager } from '../lib/2/firebase-manager';

const firebaseManager = FirebaseManager.getInstance();

const useGetDoc = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDoc = useCallback(async (docPath: string, applyData: (doc: any) => void) => {
    setIsLoading(true);
    setError(null);

    try {
      const doc = await firebaseManager.getDoc(docPath);
      applyData(doc);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong!')
      }
    }
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    getDoc
  };
};

export default useGetDoc;
