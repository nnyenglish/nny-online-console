import React, { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { ColDef, ValueSetterParams } from "ag-grid-community";
import { AgGridColumn, AgGridReact } from "ag-grid-react";

import { queryCollection, updateDoc } from "../../firebase";
import { ClassRoomDoc } from "../../lib/1/schema";
import { Levels, Teachers } from "../../lib/1/string-map";

import { AgMultiSelectBox } from "../../components/AgMultiSelectBox/AgMultiSelectBox";
import ClassRoomDialog from "../../components/ClassRoomDialog/ClassRoomDialog";

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
		const query = queryCollection<ClassRoomDoc>(classRoomCollectionPath, []);
		const unsubscribe = onSnapshot(query, (snapshot) => {
			const docs = snapshot.docs.map((doc) => doc.data());
			docs.sort((a, b) => b.sortKey - a.sortKey);
			setRowData(docs);
		});

		return () => {
			console.log("unsubscribe");
			unsubscribe();
		};
	}, [setRowData]);

	const valueSetter = (props: ValueSetterParams): boolean => {
		const lecture = props.data as ClassRoomDoc;
		const fieldPath = props.colDef.field;
		if (fieldPath) {
			updateDoc(classRoomCollectionPath, lecture._id, {
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
						cellStyle={() => ({ "white-space": "normal" })}
						editable={true}
						valueSetter={valueSetter}
					/>
				</AgGridReact>
			</div>
		</div>
	);
};

export default ClassRoom;
