import React, { useState } from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
// import { hiddenContentStyle, mergeStyles } from '@fluentui/react/lib/Styling';
import { useId, useBoolean } from '@fluentui/react-hooks';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { Icon } from '@fluentui/react/lib/Icon';

import styles from './FileUploadDialog.module.scss';
import UploadFileItem from '../UploadFileItem/UploadFileItem';
import { LectureDoc } from '../../lib/1/schema';

// const screenReaderOnly = mergeStyles(hiddenContentStyle);
const dialogContentProps = {
  type: DialogType.normal,
  title: '파일 업로드',
  closeButtonAriaLabel: '취소',
};

const FileUploadDialog: React.FC<{ lecture: LectureDoc }> = (props) => {
	const { lecture } = props;
	const [files, setFiles] = useState<FileList>();
	const [errorMsg, setErrorMsg] = useState<string | undefined>();
	const [startUpload, setStartUpload] = useState(false);
	const [progresses, setProgresses] = useState<boolean[]>([]);
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const labelId: string = useId('dialogLabel');
  const subTextId: string = useId('subTextLabel');

  const modalProps = React.useMemo(
    () => ({
      titleAriaId: labelId,
      subtitleAriaId: subTextId,
      isBlocking: true,
    }),
    [labelId, subTextId],
  );

	const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			// const fileObject = Object.fromEntries(Object.values(event.target.files).map(file => {
			// 	return [file.name, file];
			// }));
			setFiles(event.target.files);
		}
	};

	const closeFileUpload = () => {
		setFiles(undefined);
		setProgresses([]);
		setStartUpload(false);
		toggleHideDialog();
		// this.fileInputElem.nativeElement.value = ''; // 선택한 파일이 없습니다 부활
	}

	const fileUpload = async () => {
		if (!(files && files.length > 0)) {
			setErrorMsg('업로드할 파일이 없습니다.');
			return;
		}

		setStartUpload(true);
		setProgresses(Array(files!.length).fill(false));
	};

	const setProgress = (key: number) => {
		progresses[key] = true;
		setProgresses([...progresses]);
	}

  return (
    <>
      <DefaultButton className={styles.uploadButton} secondaryText='파일 업로드' onClick={toggleHideDialog} text='파일 업로드' />
      {/* <label id={labelId} className={screenReaderOnly}>
        파일 업로드
      </label>
      <label id={subTextId} className={screenReaderOnly}>
        업로드할 파일을 선택해주세요
      </label> */}

      <Dialog
        hidden={hideDialog}
        onDismiss={closeFileUpload}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
				minWidth={420}
				maxWidth={540}
      >
				<div className={styles.header}>
					<p>강의실: {lecture.classRoom}</p>
					<p>강의명: {lecture.title}</p>
				</div>
				<div className={styles.inputBox}>
					<label className={startUpload ? styles.disabled : ''} htmlFor='file_uploads'><Icon iconName='Upload' style={{marginRight: '6px'}}/>업로드할 파일을 선택해주세요.</label>
					<input type='file' id='file_uploads' name='file_uploads' multiple onChange={onFileChange}
					disabled={startUpload}/>
				</div>
				<div className={styles.preview}>
						{
							(files && Object.values(files).length > 0)
								? Object.values(files).map((file, key) => (
									<UploadFileItem key={key} path={`lecture/${lecture._id}`} file={file} startUpload={startUpload} complete={() => setProgress(key)}/>
								))
								: <p>업로드할 파일이 없습니다.</p>
						}
				</div>
				{errorMsg && <p>{errorMsg}</p>}
				{progresses.filter(p => p === false).length > 0
					? <Spinner size={SpinnerSize.medium} />
					: startUpload === false ? <DialogFooter>
						<PrimaryButton disabled={!(files && Object.values(files).length > 0)} onClick={fileUpload} text='업로드' />
						<DefaultButton onClick={closeFileUpload} text='취소' />
					</DialogFooter> : <DialogFooter>
						<DefaultButton onClick={closeFileUpload} text='완료' />
					</DialogFooter>
				}
      </Dialog>
    </>
  );
};

export default FileUploadDialog;
