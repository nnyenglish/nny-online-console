import { useEffect, useState } from "react";
import { ColDef, ValueSetterParams } from "ag-grid-community";
import { AgGridColumn, AgGridReact } from "ag-grid-react";

import { ClassRoomDoc } from "../../lib/1/schema";
import { Levels, Teachers } from "../../lib/1/string-map";
import { FirebaseManager } from "../../lib/2/firebase-manager";

import { AgMultiSelectBox } from "../../components/AgMultiSelectBox/AgMultiSelectBox";
import ClassRoomDialog from "../../components/ClassRoomDialog/ClassRoomDialog";

const firebaseManager = FirebaseManager.getInstance();
const classRoomCollectionPath = "classRoom";

const defaultColDef: ColDef = {
	flex: 1,
	minWidth: 100,
	sortable: true,
	resizable: true,
	autoHeight: true,
};
const LevelSelectBox = AgMultiSelectBox(Levels, "EVERYONE");
const TeacherSelectBox = AgMultiSelectBox(Teachers, "Paul");

const ClassRoom = () => {
	const [rowData, setRowData] = useState<ClassRoomDoc[]>([]);

	useEffect(() => {
		const classRoomSubscription = firebaseManager.observe<ClassRoomDoc>(classRoomCollectionPath, []).subscribe(docs => {
			docs.sort((a, b) => b.sortKey - a.sortKey);
			setRowData(docs);
		});

		return () => {
			classRoomSubscription.unsubscribe();
		};
	}, [setRowData]);

	const valueSetter = (props: ValueSetterParams): boolean => {
		const lecture = props.data as ClassRoomDoc;
		const fieldPath = props.colDef.field;
		if (fieldPath) {
			// 변화가 없으면 아무것도 하지 않는다.
			if (props.oldValue === props.newValue) {
				return false;
			}

			firebaseManager.updateDoc(classRoomCollectionPath, lecture._id, {
				[fieldPath]: props.newValue,
			});
			return true;
		}
		return false;
	};

	return (
		<div className="pageContainer">
			<header className="option-header">
				<ClassRoomDialog />
			</header>
			<div className="ag-theme-balham-dark agContainer">
				<AgGridReact
					defaultColDef={defaultColDef}
					groupDefaultExpanded={1}
					groupDisplayType={"custom"}
					suppressScrollOnNewData={true}
					rowData={rowData}
					stopEditingWhenCellsLoseFocus={true}
					frameworkComponents={{
						LevelSelectBoxEditor: LevelSelectBox,
						TeacherSelectBoxEditor: TeacherSelectBox,
					}}
				>
					<AgGridColumn
						field="roomNo"
						headerName="강의실 번호"
						editable={true}
						maxWidth={100}
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="sortKey"
						headerName="정렬키"
						editable={true}
						maxWidth={100}
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="price"
						// TODO: number 포멧팅
						type="number"
						headerName="수강료"
						editable={true}
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="roomName"
						headerName="강의실 이름"
						editable={true}
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="levels"
						headerName="레벨"
						editable={true}
						cellEditor="LevelSelectBoxEditor"
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="teachers"
						headerName="선생님"
						editable={true}
						cellEditor="TeacherSelectBoxEditor"
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="thumbnail"
						headerName="대표이미지"
						editable={true}
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="description"
						headerName="설명"
						tooltipField="description"
						editable={true}
						cellEditor="agLargeTextCellEditor"
            minWidth={420}
						valueSetter={valueSetter}
					/>
				</AgGridReact>
			</div>
		</div>
	);
};

export default ClassRoom;
