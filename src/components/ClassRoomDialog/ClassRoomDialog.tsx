import { useCallback, useState } from "react";
import { Dialog, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { useBoolean } from "@fluentui/react-hooks";
import {
	ComboBox,
	IComboBox,
	IComboBoxOption,
	IModalProps,
	TextField,
} from "@fluentui/react";

import { ClassRoom, Level } from "../../lib/1/schema";
import { Levels, Teachers } from "../../lib/1/string-map";
import { FirebaseManager } from "../../lib/2/firebase-manager";

const firebaseManager = FirebaseManager.getInstance();

const modalProps: IModalProps = {
	isBlocking: true,
};
const dialogContentProps = {
	title: "신규 강의실 추가",
};
const initialTeacherOptions = Teachers.map((v) => ({ key: v, text: v }));
const initialLevelOptions = Levels.map((v) => ({ key: v, text: v }));
const urlRegex = new RegExp(
	/[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi
);

const ClassRoomDialog: React.FC = () => {
	const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
	const [ClassRoomInputs, setClassRoomInputs] = useState({
		sortKey: "",
		roomNo: "",
		roomName: "",
		thumbnail: "",
		description: "",
		price: "",
	});
	const [selectedTeachers, setSelectedTeachers] = useState<string[]>(["Paul"]);
	const [selectedLevels, setSelectedLevels] = useState<Level[]>(["EVERYONE"]);

	const onChangeClassRoomInputs = useCallback(
		(
			event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
			newValue?: string
		) => {
			const field = event.currentTarget.name;
			const newInput = { ...ClassRoomInputs, [field]: newValue };
			setClassRoomInputs(newInput);
		},
		[ClassRoomInputs]
	);

	const onGetErrorMessage = (value: string, regex?: RegExp) => {
		if (value.length === 0) {
			return "필수 필드입니다.";
		}

		if (regex) {
			return value.match(regex) === null
				? "올바른 URL 형식을 입력해주세요."
				: undefined;
		}

		return undefined;
	};

	const onChangeTeachers = useCallback(
		(event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
			let selected = option?.selected;
			setSelectedTeachers((prevSelectedKeys) =>
				selected
					? [...prevSelectedKeys, option!.key as string]
					: prevSelectedKeys.filter((k) => k !== option!.key)
			);
		},
		[]
	);
	const onChangeLevels = useCallback(
		(event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
			let selected = option?.selected;
			setSelectedLevels((prevSelectedKeys) =>
				selected
					? [...prevSelectedKeys, option!.key as Level]
					: prevSelectedKeys.filter((k) => k !== option!.key)
			);
		},
		[]
	);

	const isDisabled = () => {
		const invalidFields = Object.entries(ClassRoomInputs)
			.filter(([key, value]) => {
				// 필수 요소가 채워지지 않은 경우
				return ["sortKey", "roomNo", "roomName", "thumbnail"].includes(key)
					? value.length < 1
					: false;
			})
			.map(([key, _]) => key);

		if (invalidFields.length > 0) {
			return true;
		}

		if (selectedTeachers.length === 0 || selectedLevels.length === 0) {
			return true;
		}

		return false;
	};

	const submit = async () => {
		const doc: ClassRoom = {
			sortKey: Number(ClassRoomInputs.sortKey),
			roomNo: Number(ClassRoomInputs.roomNo),
			roomName: ClassRoomInputs.roomName,
			thumbnail: ClassRoomInputs.thumbnail,
			teachers: selectedTeachers,
			levels: selectedLevels,
			price: Number(ClassRoomInputs.price),
			description: ClassRoomInputs.description,
		};
		const id = ClassRoomInputs.roomName
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-");
		try {
			await firebaseManager.createDoc("classRoom", id, doc);
			toggleHideDialog();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<DefaultButton
				secondaryText="신규 강의실 추가 다이얼로그"
				onClick={toggleHideDialog}
				text="신규 강의실 추가"
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
					label="강의실 번호"
					name="roomNo"
					value={ClassRoomInputs.roomNo}
					onChange={onChangeClassRoomInputs}
					placeholder="1"
					type="number"
					pattern="\d+"
					onGetErrorMessage={onGetErrorMessage}
					required
				/>
				<TextField
					label="강의실 이름"
					name="roomName"
					value={ClassRoomInputs.roomName}
					onChange={onChangeClassRoomInputs}
					type="text"
					placeholder="English Brush Up"
				/>
				<TextField
					label="정렬키"
					name="sortKey"
					value={ClassRoomInputs.sortKey}
					onChange={onChangeClassRoomInputs}
					placeholder="101"
					type="number"
					pattern="\d+"
					onGetErrorMessage={onGetErrorMessage}
					required
				/>
				<TextField
					label="설명"
					name="description"
					value={ClassRoomInputs.description}
					onChange={onChangeClassRoomInputs}
					type="text"
					placeholder="강의실 소개내용"
				/>
				<TextField
					label="thumbnail"
					name="thumbnail"
					value={ClassRoomInputs.thumbnail}
					onChange={onChangeClassRoomInputs}
					placeholder="https://i.vimeocdn.com/video/1336174143-9a2c2f59ac85d9f7fbc7f6c14c42724a4281c09ec32e85a3159b479ecf947eed-d?mw=2300&mh=1294&q=70"
					type="url"
					onGetErrorMessage={(value) => onGetErrorMessage(value, urlRegex)}
					required
				/>
				<ComboBox
					label="teachers"
					multiSelect
					selectedKey={selectedTeachers}
					options={initialTeacherOptions}
					errorMessage={
						selectedTeachers.length === 0 ? "필수 필드입니다." : undefined
					}
					onChange={onChangeTeachers}
				/>
				<ComboBox
					label="levels"
					multiSelect
					selectedKey={selectedLevels}
					options={initialLevelOptions}
					errorMessage={
						selectedLevels.length === 0 ? "필수 필드입니다." : undefined
					}
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

export default ClassRoomDialog;
