import { ProgressIndicator } from "@fluentui/react";
import { FC, useEffect, useState } from "react";
import useUploadFile from "../../hooks/use-upload-file";

interface IUploadFileItemProps {
  file: File;
  path: string;
  startUpload: boolean;
  complete: () => void;
};

const returnFileSize = (num: number) => {
  if(num < 1024) {
    return num + 'bytes';
  } else if(num >= 1024 && num < 1048576) {
    return (num/1024).toFixed(1) + 'KB';
  } else if(num >= 1048576) {
    return (num/1048576).toFixed(1) + 'MB';
  }
}

const UploadFileItem: FC<IUploadFileItemProps> = (props) => {
  const { file, path, startUpload, complete } = props;
  const [started, setStarted] = useState(false);
  const { percent, error, uploadFile } = useUploadFile();

  useEffect(() => {
    if (startUpload && !started) {
      setStarted(true);
      uploadFile(path, file)?.then(result => {
        console.log('result: ');
        console.log(result);
        complete();
      });
    }
  }, [uploadFile, file, startUpload, complete, started, path]);
  
  return (
    <div>
      <p>{`파일명: ${file.name} (${returnFileSize(file.size)})`}</p>
      <ProgressIndicator label="Example title" description="Example description" percentComplete={percent} />
      {error ? <p>{error}</p> : ''}
    </div>
  )
}

export default UploadFileItem;