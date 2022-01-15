import { useState, useCallback } from 'react';

import { FirebaseManager, WHERE } from '../lib/2/firebase-manager';

const firebaseManager = FirebaseManager.getInstance();

const useGetDocsArray: <T>() => {
  isLoading: boolean;
  error: string | null;
  getDocsArray: (collectionPath: string, wheres: WHERE[], applyData: (docs: T[]) => void) => Promise<void>;
} = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocsArray = useCallback(async (collectionPath: string, wheres: WHERE[], applyData: (docs: any[]) => void) => {
    setIsLoading(true);
    setError(null);

    try {
      const docs = await firebaseManager.getDocsArrayWithWhere(collectionPath, wheres);
      applyData(docs);
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
    getDocsArray
  };
};

export default useGetDocsArray;
