import { useState, useCallback } from 'react';

import { FirebaseManager } from '../lib/2/firebase-manager';

const firebaseManager = FirebaseManager.getInstance();

const useUploadFile = () => {
	const [percent, setPercent] = useState(0);
	const [error, setError] = useState<string | null>(null);

  // task를 시작하는 함수를 같이 내보낸다.
  const uploadFile = useCallback((path: string, file: File) => {
    setPercent(0);
    setError(null);

    try {
      const [collection, id] = path.split('/');
      const fileName = file.name.replace(/\s/g,'').replace(/\./g,'-');
      const task = firebaseManager.uploadTask(`${collection}/${fileName}`, file);
      return new Promise((resolve, reject) => {
        task.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setPercent(progress);
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          reject(error.message);
        },
        async () => {
          const downloadURL = await firebaseManager.setDownloadURL(task.snapshot.ref);

          // downloadURL,
          // fullPath: filePath,
          // fileName,
          // fileTitle: `${monthlyBillingFeeDoc.subCategory} 비용`
          const fieldPath = `files.${fileName}`;
          const result = await firebaseManager.updateDoc(collection, id, { [fieldPath]: {
            downloadURL,
            fullPath: `${collection}/${fileName}`,
            fileName: fileName
          }});
          resolve(result);
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('알 수 없는 에러발생');
        console.error(error);
      }
    }
  }, []);

  return {
    percent,
    error,
    uploadFile
  }
};

export default useUploadFile;
