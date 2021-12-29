import React, { useEffect, useState } from "react";
import { onSnapshot } from "@firebase/firestore";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import { ColDef, ValueSetterParams } from "ag-grid-community";

import { fbCollectionQuery, fbUpdateDocField } from "../../firebase";
import { LectureDoc } from "../../lib/1/schema";

import 'ag-grid-enterprise';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";
import styles from "./ClassRoom.module.scss";
import MultiSelectBox from "../../components/EditLevel/EditLevel";

const lectureCollectionPath = "lecture";

const ClassRoom = () => {
  const [rowData, setRowData] = useState<LectureDoc[]>([]);
  const [gridColumnApi, setGridColumnApi] = useState<any>(null);

  useEffect(() => {
    const query = fbCollectionQuery(lectureCollectionPath, []);
    const unsubscribe = onSnapshot(query, (snapshot) => {
      const docs = snapshot.docs.map((doc) => doc.data() as LectureDoc);
      docs.sort((a, b) => b.sortKey - a.sortKey);
      console.log(docs);
      setRowData(docs);
    });

    return () => {
			console.log("unsubscribe!");
			unsubscribe();
		};
	}, [setRowData]);

  const onGridReady = (params: any) => {
		setGridColumnApi(params.columnApi);
	};

  const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
		resizable: true,
		autoHeight: true
	};

  const valueSetter = (props: ValueSetterParams): boolean => {
		const lecture = props.data as LectureDoc;
		const fieldPath = props.colDef.field;
		if (fieldPath) {
			fbUpdateDocField(
				`${lectureCollectionPath}/${lecture._id}`,
				fieldPath,
				props.newValue
			);
			return true;
		}
		return false;
	};

	return (
		<div className={styles.pageContainer}>
			<header className="option-header">
				<button style={{width: "120px"}}>신규 강의 추가</button>
			</header>
			<div className={`ag-theme-balham-dark ${styles.agContainer}`}>
				<AgGridReact
					defaultColDef={defaultColDef}
					groupDefaultExpanded={1}
          groupDisplayType={'custom'}
					suppressScrollOnNewData={true}
					onGridReady={onGridReady}
					rowData={rowData}
					frameworkComponents={{
						multiSelectBoxEditor: MultiSelectBox
					}}
				>
          <AgGridColumn
            headerName="강의실"
            cellRenderer="agGroupCellRenderer"
            showRowGroup={true}
            minWidth={210}
          />
					<AgGridColumn
						field="room"
						headerName="강의실"
						maxWidth={120}
            valueFormatter={(params) => {
              const mappings:{[key: string]: string} = {
                "temp-room-id": "Beginner 초급"
              }
              return mappings[params.value];
            }}
						editable={true}
						valueSetter={valueSetter}
            rowGroup={true}
					></AgGridColumn>
					<AgGridColumn
						field="levels"
						headerName="레벨"
						editable={true}
						cellEditor="multiSelectBoxEditor"
						valueSetter={valueSetter}
					></AgGridColumn>
					<AgGridColumn
						field="sortKey"
						headerName="정렬키"
						editable={true}
            maxWidth={100}
						valueSetter={valueSetter}
					></AgGridColumn>
					<AgGridColumn
						field="lectureNo"
						headerName="강의번호"
						editable={true}
            maxWidth={100}
						valueSetter={valueSetter}
					></AgGridColumn>
					<AgGridColumn
						field="title"
						headerName="제목"
						editable={true}
						valueSetter={valueSetter}
					></AgGridColumn>
					<AgGridColumn
						field="subTitle"
						headerName="소제목"
						editable={true}
						valueSetter={valueSetter}
					></AgGridColumn>
          <AgGridColumn
						field="videoUrl"
						headerName="영상링크"
            tooltipField="videoUrl"
						editable={true}
						valueSetter={valueSetter}
					></AgGridColumn>
					<AgGridColumn
						field="description"
						headerName="설명"
            tooltipField="description"
						cellStyle={() => ({'white-space': 'normal'})}
						editable={true}
						valueSetter={valueSetter}
					></AgGridColumn>
				</AgGridReact>
			</div>
		</div>
	);
};

export default ClassRoom;
