import React, { useState } from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { useId, useBoolean } from '@fluentui/react-hooks';
import { deleteField } from "firebase/firestore";

import { LectureDoc } from '../../lib/1/schema';
import { FirebaseManager } from '../../lib/2/firebase-manager';

import styles from './DeleteFileDialog.module.scss';

const firebaseManager = FirebaseManager.getInstance();

const dialogContentProps = {
	type: DialogType.normal,
	title: '파일 삭제',
	closeButtonAriaLabel: '취소',
};

const DeleteFileDialog: React.FC<{ lecture: LectureDoc, fullPath: string, fileName: string }> = (props) => {
	const { lecture, fullPath, fileName } = props;
	const [errorMsg, setErrorMsg] = useState<string | undefined>();
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

	const deleteFile = async () => {
		console.log(fullPath);
		toggleHideDialog();

		try {
			await firebaseManager.deleteFile(fullPath);
			const fieldPath = `files.${fileName}`;
			await firebaseManager.updateDoc('lecture', lecture._id, { [fieldPath]: deleteField() })
		} catch (error) {
			if (error instanceof Error) {
				setErrorMsg(error.message);
			}
			console.error(error);
		}
	}

	return (
		<>
			<DefaultButton className={styles.deleteButton} secondaryText='파일 삭제' onClick={toggleHideDialog} text='파일 삭제' />
			<Dialog
				hidden={hideDialog}
				onDismiss={toggleHideDialog}
				dialogContentProps={dialogContentProps}
				modalProps={modalProps}
				minWidth={420}
				maxWidth={540}
			>
				<div className={styles.header}>
					<p>강의실: {lecture.classRoom}</p>
					<p>강의명: {lecture.title}</p>
					<p>파일명: {fileName}</p>
				</div>
				{errorMsg && <p>{errorMsg}</p>}
				<DialogFooter>
					<PrimaryButton onClick={deleteFile} text='삭제' />
					<DefaultButton onClick={toggleHideDialog} text='취소' />
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default DeleteFileDialog;
