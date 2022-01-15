import {
	ChangeEvent,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { ClassRoomDoc } from "../../lib/1/schema";

import useGetDocsArray from "../../hooks/use-get-docs-array";

import styles from "./AgMultiSelectBox.module.scss";

const classRoomCollectionPath = 'classRoom';

const AgMultiSelectBox = (options: string[], defaultValue: string) => {
	const selectBoxRef = forwardRef((props: any, ref: any) => {
		const [value, setValue] = useState<string[]>(props.value);
		const [editing, setEditing] = useState(props.value);
		const refContainer = useRef(null);

		useImperativeHandle(ref, () => {
			return {
				getValue() {
					if (value.length === 0) {
						return [defaultValue];
					}
					return value;
				},
				isPopup() {
					return true;
				},
			};
		});

		useEffect(() => {
			if (!editing) {
				props.api.stopEditing();
			}
		}, [editing, props.api]);

		const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
			const { target } = e;
			const checked = target.checked;

			if (checked) {
				setValue([...value, target.id]);
			} else {
				setValue(value.filter((v) => v !== target.id));
			}
		};

		const isChecked = (option: string) => {
			return value.findIndex((v) => v === option) > -1;
		};

		return (
			<div className={styles.boxContainer} ref={refContainer}>
				{options.map((option, key) => {
					return (
						<div className={styles.item} key={key}>
							<input
								type="checkbox"
								id={option}
								name={option}
								checked={isChecked(option)}
								onChange={handleInputChange}
							/>
							<label htmlFor={option}>{option}</label>
						</div>
					);
				})}
				<button onClick={() => setEditing(false)}>닫기</button>
			</div>
		);
	});

	return selectBoxRef;
};

const ClassRoomAgMultiSelectBox = forwardRef((props: any, ref: any) => {
	const { getDocsArray: getClassRoomDocs } = useGetDocsArray<ClassRoomDoc>();
	const [value, setValue] = useState<string[]>(props.value);
	const [editing, setEditing] = useState(props.value);
	const [classRooms, setClassRooms] = useState<string[]>([]);
	const refContainer = useRef(null);

	useImperativeHandle(ref, () => {
		return {
			getValue() {
				if (value.length === 0) {
					return [classRooms[0] ?? ''];
				}
				return value;
			},
			isPopup() {
				return true;
			},
		};
	});

	useEffect(() => {
		// 창을 닫으면 편집을 멈춘다.
		if (!editing) {
			props.api.stopEditing();
		}

		getClassRoomDocs(classRoomCollectionPath, [], docs => {
			console.log('setClassRooms');
			setClassRooms(docs.map(doc => doc._id));
		});
	}, [editing, props.api, getClassRoomDocs]);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { target } = e;
		const checked = target.checked;

		if (checked) {
			setValue([...value, target.id]);
		} else {
			setValue(value.filter((v) => v !== target.id));
		}
	};

	const isChecked = (option: string) => {
		return value.findIndex((v) => v === option) > -1;
	};

	return (
		<div className={styles.boxContainer} ref={refContainer}>
			{classRooms.map((option, key) => {
				return (
					<div className={styles.item} key={key}>
						<input
							type="checkbox"
							id={option}
							name={option}
							checked={isChecked(option)}
							onChange={handleInputChange}
						/>
						<label htmlFor={option}>{option}</label>
					</div>
				);
			})}
			<button onClick={() => setEditing(false)}>닫기</button>
		</div>
	);
});

export { AgMultiSelectBox, ClassRoomAgMultiSelectBox };
