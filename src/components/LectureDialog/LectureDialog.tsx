import React, { useCallback, useState } from "react";
import { Dialog, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { useBoolean } from "@fluentui/react-hooks";
import { ComboBox, IComboBox, IComboBoxOption, IModalProps, TextField } from "@fluentui/react";
import { fbCreateDoc } from "../../firebase";
import { Lecture, Level } from "../../lib/1/schema";

const modalProps: IModalProps = {
	isBlocking: true,
};
const dialogContentProps = {
	title: "신규 강의 추가",
};
const initialTeacherOptions = [
  { key: "Paul", text: "Paul" },
  { key: "Sidney", text: "Sidney" },
  { key: "Hubert", text: "Hubert" },
];

const initialLevelOptions = [
  { key: "PRIMER", text: "PRIMER" },
  { key: "BEGINNER", text: "BEGINNER" },
  { key: "CHALLENGER", text: "CHALLENGER" },
  { key: "FLYER", text: "FLYER" },
  { key: "DISCIPLE", text: "DISCIPLE" },
  { key: "EVERYONE", text: "EVERYONE" },
];

const LectureDialog: React.FunctionComponent = () => {
	const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
	const [lectureInputs, setLectureInputs] = useState({
		title: "",
		subTitle: "",
		lectureNo: "",
		discription: "",
		sortKey: "",
		vimeoUrl: "",
	});
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(["Paul"]);
  const [selectedLevels, setSelectedLevels] = useState<Level[]>(["EVERYONE"]);

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

  const onChangeTeachers = useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void => {
      let selected = option?.selected;
      setSelectedTeachers(prevSelectedKeys =>
        selected ? [...prevSelectedKeys, option!.key as string] : prevSelectedKeys.filter(k => k !== option!.key),
      );
    },
    [],
  );
  const onChangeLevels = useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void => {
      let selected = option?.selected;
      setSelectedLevels(prevSelectedKeys =>
        selected ? [...prevSelectedKeys, option!.key as Level] : prevSelectedKeys.filter(k => k !== option!.key),
      );
    },
    [],
  );

	const isDisabled = () => {
		const unvalidFields = Object.entries(lectureInputs).filter(([key, value]) => {
			// 필수 요소가 채워지지 않은 경우
			return ["title", "lectureNo", "sortKey", "vimeoUrl"].includes(key) ? value.length < 1 : false;
		}).map(([key, _]) => key);
		
		if (unvalidFields.length > 0) {
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
			room: 'temp-room-id',
			description: lectureInputs.discription,
			videoUrl: lectureInputs.vimeoUrl,
			sortKey: Number(lectureInputs.sortKey),
			lectureNo: Number(lectureInputs.lectureNo),
			title: lectureInputs.title,
			subTitle: lectureInputs.subTitle
		}
		try {
			await fbCreateDoc('lecture', undefined, doc);
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
					label="discription"
					name="discription"
					value={lectureInputs.discription}
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
					placeholder="1"
          required
				/>
				<TextField
					label="sortKey"
					name="sortKey"
					value={lectureInputs.sortKey}
					onChange={onChangeLectureInputs}
					placeholder="1001"
					type="number"
					required
				/>
				<TextField
					label="vimeoUrl"
					name="vimeoUrl"
					value={lectureInputs.vimeoUrl}
					onChange={onChangeLectureInputs}
					placeholder="https://vimeo.com/283335192/cd25d662b0"
					type="url"
					required
				/>
        <ComboBox
          label="teachers"
					multiSelect
          selectedKey={selectedTeachers}
          options={initialTeacherOptions}
          onChange={onChangeTeachers}
        />
        <ComboBox
          label="levels"
          multiSelect
          selectedKey={selectedLevels}
          options={initialLevelOptions}
          onChange={onChangeLevels}
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
