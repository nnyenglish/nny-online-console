import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { useBoolean } from "@fluentui/react-hooks";
import { ComboBox, IComboBox, IComboBoxOption, IModalProps, TextField } from "@fluentui/react";

import { ClassRoomDoc, Lecture, Level } from "../../lib/1/schema";
import { Levels, Teachers } from "../../lib/1/string-map";
import { FirebaseManager } from "../../lib/2/firebase-manager";

const firebaseManager = FirebaseManager.getInstance();

const classRoomCollectionPath = "classRoom";
const modalProps: IModalProps = {
	isBlocking: true,
};
const dialogContentProps = {
	title: "신규 강의 추가",
};
const initialTeacherOptions = Teachers.map((v) => ({ key: v, text: v }));
const initialLevelOptions = Levels.map((v) => ({ key: v, text: v }));
const urlRegex = new RegExp(/[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/ig);

const LectureDialog: React.FunctionComponent = () => {
	const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
	const [initialClassRoomOptions, setInitialClassRoomOptions] = useState<{key: string, text: string }[]>([]);
	const [lectureInputs, setLectureInputs] = useState({
		title: "",
		subTitle: "",
		lectureNo: "",
		description: "",
		sortKey: "",
		vimeoUrl: "",
	});
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(["Paul"]);
  const [selectedLevels, setSelectedLevels] = useState<Level[]>(["EVERYONE"]);
	const [selectedClassRooms, setSelectedClassRooms] = useState<string[]>([]);

	useEffect(() => {
		firebaseManager.getDocsArrayWithWhere<ClassRoomDoc>(classRoomCollectionPath, []).then(classRooms => {
			setInitialClassRoomOptions(classRooms.map(cr => ({key: cr._id, text: cr.roomName})));
		});
	}, []);

	const onChangeLectureInputs = useCallback(
		(
			event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
			newValue?: string
		) => {
			const field = event.currentTarget.name;
			const newInput = { ...lectureInputs, [field]: newValue };
			setLectureInputs(newInput);
		},
		[lectureInputs]
	);

	const onGetErrorMessage = (value: string, regex?: RegExp) => {
		if (value.length === 0) {
			return '필수 필드입니다.';
		}

		if (regex) {
			return value.match(regex) === null ? '올바른 URL 형식을 입력해주세요.' : undefined;
		}

		return undefined;
	}

  const onChangeTeachers = useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
      let selected = option?.selected;
      setSelectedTeachers(prevSelectedKeys =>
        selected ? [...prevSelectedKeys, option!.key as string] : prevSelectedKeys.filter(k => k !== option!.key),
      );
    },
    [],
  );
  const onChangeLevels = useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
      let selected = option?.selected;
      setSelectedLevels(prevSelectedKeys =>
        selected ? [...prevSelectedKeys, option!.key as Level] : prevSelectedKeys.filter(k => k !== option!.key),
      );
    },
    [],
  );
  const onChangeClassRooms = useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
      let selected = option?.selected;
      setSelectedClassRooms(prevSelectedKeys =>
        selected ? [...prevSelectedKeys, option!.key as Level] : prevSelectedKeys.filter(k => k !== option!.key),
      );
    },
    [],
  );

	const isDisabled = () => {
		const invalidFields = Object.entries(lectureInputs).filter(([key, value]) => {
			// 필수 요소가 채워지지 않은 경우
			return ["title", "lectureNo", "sortKey", "vimeoUrl"].includes(key) ? value.length < 1 : false;
		}).map(([key, _]) => key);
		
		if (invalidFields.length > 0) {
			return true;
		}

		if (selectedTeachers.length === 0 || selectedLevels.length === 0) {
			return true;
		}

		return false
	}

  const submit = async () => {
		const doc: Lecture = {
			teachers: selectedTeachers,
			levels: selectedLevels,
			// TODO: 선택으로 변경
			classRoom: 'temp-room-id',
			description: lectureInputs.description,
			videoUrl: lectureInputs.vimeoUrl,
			sortKey: Number(lectureInputs.sortKey),
			lectureNo: Number(lectureInputs.lectureNo),
			title: lectureInputs.title,
			subTitle: lectureInputs.subTitle
		};
		try {
			await firebaseManager.createDoc('lecture', undefined, doc);
			toggleHideDialog();
		} catch (error) {
			console.error(error);
		}
  };

	return (
		<>
			<DefaultButton
				secondaryText="신규 강의 추가 다이얼로그"
				onClick={toggleHideDialog}
				text="신규 강의 추가"
			/>
			<Dialog
				hidden={hideDialog}
				onDismiss={toggleHideDialog}
				dialogContentProps={dialogContentProps}
				modalProps={modalProps}
				minWidth={420}
				maxWidth={540}
			>
				<TextField
					label="title"
					name="title"
					value={lectureInputs.title}
					onChange={onChangeLectureInputs}
					type="text"
					placeholder="New Brush up 4-1 (셋째달)"
					onGetErrorMessage={onGetErrorMessage}
					required
				/>
				<TextField
					label="subTitle"
					name="subTitle"
					value={lectureInputs.subTitle}
					onChange={onChangeLectureInputs}
					type="text"
					placeholder="소제목"
				/>
				<TextField
					label="description"
					name="description"
					value={lectureInputs.description}
					onChange={onChangeLectureInputs}
					type="text"
					placeholder="추가 안내사항"
				/>
				{/* number인 경우 숫자 이외의 값은 처리하지 않는다. */}
				<TextField
					label="lectureNo"
					name="lectureNo"
					value={lectureInputs.lectureNo}
					onChange={onChangeLectureInputs}
					type="number"
					pattern="\d+"
					placeholder="1"
					onGetErrorMessage={onGetErrorMessage}
          required
				/>
				<TextField
					label="sortKey"
					name="sortKey"
					value={lectureInputs.sortKey}
					onChange={onChangeLectureInputs}
					placeholder="1001"
					type="number"
					pattern="\d+"
					onGetErrorMessage={onGetErrorMessage}
					required
				/>
				<TextField
					label="vimeoUrl"
					name="vimeoUrl"
					value={lectureInputs.vimeoUrl}
					onChange={onChangeLectureInputs}
					placeholder="https://vimeo.com/283335192/cd25d662b0"
					type="url"
					onGetErrorMessage={(value) => onGetErrorMessage(value, urlRegex)}
					required
				/>
        <ComboBox
          label="teachers"
					multiSelect
          selectedKey={selectedTeachers}
          options={initialTeacherOptions}
					errorMessage={selectedTeachers.length === 0 ? '필수 필드입니다.' : undefined}
          onChange={onChangeTeachers}
        />
        <ComboBox
          label="levels"
          multiSelect
          selectedKey={selectedLevels}
          options={initialLevelOptions}
					errorMessage={selectedLevels.length === 0 ? '필수 필드입니다.' : undefined}
          onChange={onChangeLevels}
        />
        <ComboBox
          label="classRooms"
          multiSelect
          selectedKey={selectedClassRooms}
          options={initialClassRoomOptions}
					errorMessage={selectedClassRooms.length === 0 ? '필수 필드입니다.' : undefined}
          onChange={onChangeClassRooms}
        />
				<DialogFooter>
					<PrimaryButton onClick={submit} disabled={isDisabled()} text="추가" />
					<DefaultButton onClick={toggleHideDialog} text="취소" />
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default LectureDialog;
