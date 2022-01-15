import React, { useEffect, useState } from "react";
import { onSnapshot } from "@firebase/firestore";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import { ColDef, ValueSetterParams } from "ag-grid-community";

import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";

import { ClassRoomDoc, LectureDoc } from "../../lib/1/schema";
import LectureDialog from "../../components/LectureDialog/LectureDialog";
import { AgMultiSelectBox } from "../../components/AgMultiSelectBox/AgMultiSelectBox";
import { getDocsArrayWithWhere, queryCollection, updateDoc } from "../../firebase";

const lectureCollectionPath = "lecture";
const classRoomCollectionPath = "classRoom";
const levelSelectBox = AgMultiSelectBox(
	["PRIMER", "BEGINNER", "CHALLENGER", "FLYER", "DISCIPLE", "EVERYONE"],
	"EVERYONE"
);

const Lecture = () => {
	const [rowData, setRowData] = useState<LectureDoc[]>([]);
	const [classRoomList, setClassRoomList] = useState<string[]>();
	// const [gridColumnApi, setGridColumnApi] = useState<any>(null);

	useEffect(() => {
		const query = queryCollection<LectureDoc>(lectureCollectionPath, []);
		const unsubscribe = onSnapshot(query, (snapshot) => {
			const docs = snapshot.docs.map((doc) => doc.data());
			docs.sort((a, b) => b.sortKey - a.sortKey);
			console.log(docs);
			setRowData(docs);
		});

		getDocsArrayWithWhere<ClassRoomDoc>(classRoomCollectionPath, []).then(classRooms => {
			setClassRoomList(classRooms.map(cr => cr._id));
		});

		return () => {
			console.log("unsubscribe!");
			unsubscribe();
		};
	}, [setRowData]);

	// const onGridReady = (params: any) => {
	// 	setGridColumnApi(params.columnApi);
	// };

	const defaultColDef: ColDef = {
		flex: 1,
		minWidth: 100,
		sortable: true,
		resizable: true,
		autoHeight: true,
	};

	const valueSetter = (props: ValueSetterParams): boolean => {
		const lecture = props.data as LectureDoc;
		const fieldPath = props.colDef.field;
		if (fieldPath) {
			updateDoc(lectureCollectionPath, lecture._id, {
				[fieldPath]: props.newValue,
			});
			return true;
		}
		return false;
	};

	return (
		<div className="pageContainer">
			<header className="option-header">
				<LectureDialog />
			</header>
			<div className="ag-theme-balham-dark agContainer">
				<AgGridReact
					defaultColDef={defaultColDef}
					groupDefaultExpanded={1}
					groupDisplayType={"custom"}
					suppressScrollOnNewData={true}
					// onGridReady={onGridReady}
					rowData={rowData}
					stopEditingWhenCellsLoseFocus={true}
					frameworkComponents={{
						multiLevelSelectBoxEditor: levelSelectBox
					}}
				>
					<AgGridColumn
						headerName="강의실"
						cellRenderer="agGroupCellRenderer"
						showRowGroup={true}
						minWidth={210}
					/>
					<AgGridColumn
						field="classRoom"
						headerName="강의실"
						editable={true}
						cellEditor="agRichSelectCellEditor"
            cellEditorParams={{ values: classRoomList }}
						valueSetter={valueSetter}
						rowGroup={true}
					/>
					<AgGridColumn
						field="levels"
						headerName="레벨"
						editable={true}
						cellEditor="multiLevelSelectBoxEditor"
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
						field="lectureNo"
						headerName="강의번호"
						editable={true}
						maxWidth={100}
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="title"
						headerName="제목"
						editable={true}
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="subTitle"
						headerName="소제목"
						editable={true}
						valueSetter={valueSetter}
					/>
					<AgGridColumn
						field="videoUrl"
						headerName="영상링크"
						tooltipField="videoUrl"
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

export default Lecture;
