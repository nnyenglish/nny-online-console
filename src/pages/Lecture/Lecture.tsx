import { deleteField } from 'firebase/firestore';
import { useEffect, useMemo, useState } from "react";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import { ColDef, ValueSetterParams } from "ag-grid-community";

import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";

import { ClassRoomDoc, LectureDoc } from "../../lib/1/schema";
import { FirebaseManager } from "../../lib/2/firebase-manager";

import LectureDialog from "../../components/LectureDialog/LectureDialog";
import FileUploadDialog from "../../components/FileUploadDialog/FileUploadDialog";
import { AgMultiSelectBox } from "../../components/AgMultiSelectBox/AgMultiSelectBox";
import useGetDocsArray from "../../hooks/use-get-docs-array";
import DeleteFileDialog from "../../components/DeleteFileDialog/DeleteFileDialog";

const firebaseManager = FirebaseManager.getInstance();
const lectureCollectionPath = "lecture";
const classRoomCollectionPath = "classRoom";
const levelSelectBox = AgMultiSelectBox(
	["PRIMER", "BEGINNER", "CHALLENGER", "FLYER", "DISCIPLE", "EVERYONE"],
	"EVERYONE"
);

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
		// 변화가 없으면 아무것도 하지 않는다.
		if (props.oldValue === props.newValue) {
			return false;
		}

		// 입력한 값이 없으면 삭제한다.
		if (props.newValue === undefined) {
			firebaseManager.updateDoc(lectureCollectionPath, lecture._id, {
				[fieldPath]: deleteField(),
			});
		} else {
			firebaseManager.updateDoc(lectureCollectionPath, lecture._id, {
				[fieldPath]: props.newValue,
			});
		}
		return true;
	}
	return false;
};

const Lecture = () => {
	const [rowData, setRowData] = useState<LectureDoc[]>([]);
	const [classRoomIdList, setClassRoomIdList] = useState<string[]>();

	const { getDocsArray: getClassRoomDocs } = useGetDocsArray<ClassRoomDoc>();

	useEffect(() => {
		const subscription = firebaseManager
			.observe<LectureDoc>(lectureCollectionPath, [])
			// TODO: 파일 관련 업데이트는 무시하도록 변경
			// switchMap - unified-order.component
			.subscribe((docs) => {
				docs.sort((a, b) => b.sortKey - a.sortKey);
				setRowData(docs);
			});

		getClassRoomDocs(classRoomCollectionPath, [], (docs) => {
			setClassRoomIdList(docs.map((doc) => doc._id));
		});

		return () => subscription.unsubscribe();
	}, [getClassRoomDocs, setRowData]);


	// <AgGridColumn
	// 	headerName="명령"
	// 	minWidth={120}
	// 	cellRendererFramework={(props: { data: LectureDoc }) => {
	// 		if (props.data) {
	// 			return FileUploadDialog({ lecture: props.data })
	// 		} else {
	// 			return <div> </div>
	// 		}
	// 	}}
	// />
	const detailCellRendererParams = useMemo(() => {
		return {
			autoHeight: true,
			detailGridOptions: {
				columnDefs: [
					{ headerName: '명령', maxWidth: 130, cellRendererFramework: (props: { data: { lecture: LectureDoc, fullPath: string, fileId: string, fileName: string } }) => {
						if (props.data?.lecture) {
							const { lecture, fullPath, fileId, fileName} = props.data;
							return DeleteFileDialog({ lecture, fullPath, fileId, fileName });
						} else {
							return <div> </div>
						}
					}},
					{ field: 'fileName' },
					{ field: 'downloadURL' },
					{ field: 'fullPath', maxWidth: 240 },
				],
				defaultColDef: {
          flex: 1,
        },
			},
			getDetailRowData: (params: any) => {
				// detail grid에 데이터 공급
				const lecture: LectureDoc = params.data;
				const detailRowData = lecture.files ? Object.entries(lecture.files).map(([fileId, files]) => ({
					fileId,
					...files,
					lecture
				})) : [];
				params.successCallback(detailRowData);
			}
		};
	}, []);

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
						multiLevelSelectBoxEditor: levelSelectBox,
					}}

					// detailGrid를 쓰기위함
					masterDetail={true}
					detailCellRendererParams={detailCellRendererParams}
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
						hide={true}
						editable={true}
						cellEditor="agRichSelectCellEditor"
						cellEditorParams={{ values: classRoomIdList }}
						valueSetter={valueSetter}
						rowGroup={true}
					/>
					<AgGridColumn
						field="title"
						headerName="제목"
						editable={true}
						valueSetter={valueSetter}
						cellRenderer='agGroupCellRenderer'
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
					<AgGridColumn
						headerName="명령"
						minWidth={120}
						cellRendererFramework={(props: { data: LectureDoc }) => {
							if (props.data) {
								return FileUploadDialog({ lecture: props.data })
							} else {
								return <div> </div>
							}
						}}
					/>
				</AgGridReact>
			</div>
		</div>
	);
};

export default Lecture;
