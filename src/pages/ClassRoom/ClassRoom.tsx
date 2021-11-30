import { onSnapshot } from "@firebase/firestore";
import React, { useEffect, useState } from "react";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import { ColDef, ValueSetterParams } from "ag-grid-community";

import { fbCollectionQuery, fbUpdateDocField } from "../../firebase";

import 'ag-grid-enterprise';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import styles from "./ClassRoom.module.scss";
import { LectureDoc } from "../../lib/1/schema";

const lectureCollectionPath = "lecture";

const ClassRoom = () => {
  const [rowData, setRowData] = useState<LectureDoc[]>([]);
  const [gridColumnApi, setGridColumnApi] = useState<any>(null);
  console.log(gridColumnApi);

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
			<div className={`ag-theme-alpine ${styles.agContainer}`}>
				<AgGridReact
					defaultColDef={defaultColDef}
					groupDefaultExpanded={1}
          groupDisplayType={'custom'}
					suppressScrollOnNewData={true}
					onGridReady={onGridReady}
					rowData={rowData}
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
            valueFormatter={(params) => {
              console.log(params);
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