import React, {
  ChangeEvent,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

import styles from "./EditLevel.module.scss";

const LevelSelectBox = forwardRef((props: any, ref: any) => {
	const [value, setValue] = useState<string[]>(props.value);
	const [editing, setEditing] = useState(props.value);
	const refContainer = useRef(null);

	const levels = [
		"PRIMER",
		"BEGINNER",
		"CHALLENGER",
		"FLYER",
		"DISCIPLE",
		"EVERYONE",
	];

	useImperativeHandle(ref, () => {
		return {
			getValue() {
        if (value.length === 0) {
          return ['EVERYONE']
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
      setValue(value.filter(v => v !== target.id));
    }
  }

  const isChecked = (level: string) => {
    return value.findIndex(v => v === level) > -1;
  }

	return (
		<div className={styles.boxContainer} ref={refContainer}>
			{levels.map((level, key) => {
				return (
					<div className={styles.item} key={key}>
						<input
							type="checkbox"
							id={level}
							name={level}
							checked={isChecked(level)}
              onChange={handleInputChange}
						/>
						<label htmlFor={level}>{level}</label>
					</div>
				);
			})}
			<button onClick={() => setEditing(false)}>닫기</button>
		</div>
	);
});

export default LevelSelectBox;
