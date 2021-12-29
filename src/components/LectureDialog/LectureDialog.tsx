import React, { useCallback, useState } from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { useBoolean } from "@fluentui/react-hooks";
import { ComboBox, Dropdown, IComboBox, IComboBoxOption, IDropdownOption, IModalProps, TextField } from "@fluentui/react";

const modalProps: IModalProps = {
	isBlocking: true,
	styles: { 
    main: { minWidth: 420, maxWidth: 540 }
  },
};
const dialogContentProps = {
	type: DialogType.largeHeader,
	title: "신규 강의 추가",
	// subText: "테스트",
};
const teacherOptions = [
  { key: 'paul', text: 'Paul' },
  { key: 'sidney', text: 'Sidney' },
  { key: 'hubert', text: 'Hubert' },
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
	const [title, setTitle] = useState("");
	const [lectureNo, setLectureNo] = useState("");
	const [discription, setSubTitle] = useState("");
	const [sortKey, setSortKey] = useState("");
	const [vimeoUrl, setVimeoUrl] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<IDropdownOption>();
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["EVERYONE"]);

	const onChangeTitle = useCallback(
		(
			event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
			newValue?: string
		) => {
			setTitle(newValue || "");
		},
		[]
	);
	const onChangeLectureNo = useCallback(
		(
			event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
			newValue?: string
		) => {
			setLectureNo(newValue || "");
		},
		[]
	);
	const onChangeDiscription = useCallback(
		(
			event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
			newValue?: string
		) => {
			setSubTitle(newValue || "");
		},
		[]
	);
	const onChangeSortKey = useCallback(
		(
			event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
			newValue?: string
		) => {
			setSortKey(newValue || "");
		},
		[]
	);

	const onChangeVimeoUrl = useCallback(
		(
			event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
			newValue?: string
		) => {
			setVimeoUrl(newValue || "");
		},
		[]
	);

  const onChangeTeacher = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    setSelectedTeacher(option);
  };

  const onChangeLevels = useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void => {
      let selected = option?.selected;
      setSelectedLevels(prevSelectedKeys =>
        selected ? [...prevSelectedKeys, option!.key as string] : prevSelectedKeys.filter(k => k !== option!.key),
      );
    },
    [],
  );

  const submit = () => {
    console.log(hideDialog);
    console.log(title);
    console.log(lectureNo);
    console.log(discription);
    console.log(sortKey);
    console.log(vimeoUrl);
    console.log(selectedTeacher);
    console.log(selectedLevels);
    toggleHideDialog();
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
			>
				<TextField
					label="title"
					value={title}
					onChange={onChangeTitle}
					type="text"
					placeholder="New Brush up 4-1 (셋째달)"
					required
				/>
				<TextField
					label="lectureNo"
					value={lectureNo}
					onChange={onChangeLectureNo}
					type="number"
					placeholder="1"
          required
				/>
				<TextField
					label="discription"
					value={discription}
					onChange={onChangeDiscription}
					type="text"
					placeholder="추가 안내사항"
				/>
				<TextField
					label="sortKey"
					value={sortKey}
					onChange={onChangeSortKey}
					placeholder="1001"
					type="number"
					required
				/>
				<TextField
					label="vimeoUrl"
					value={vimeoUrl}
					onChange={onChangeVimeoUrl}
					placeholder="https://vimeo.com/283335192/cd25d662b0"
					type="url"
					required
				/>
        <Dropdown
          label="teacher"
          selectedKey={selectedTeacher ? selectedTeacher.key : undefined}
          onChange={onChangeTeacher}
          placeholder="select teacher"
          options={teacherOptions}
          required
        />
        <ComboBox
          multiSelect
          selectedKey={selectedLevels}
          label="Levels"
          options={initialLevelOptions}
          onChange={onChangeLevels}
        />
				<DialogFooter>
					<PrimaryButton onClick={submit} text="추가" />
					<DefaultButton onClick={toggleHideDialog} text="취소" />
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default LectureDialog;
