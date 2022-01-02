import React, { useEffect, useState } from "react";
import { onSnapshot } from "@firebase/firestore";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import { ColDef, ValueSetterParams } from "ag-grid-community";

import { UserDoc } from "../../lib/1/schema";

import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";
import { queryCollection, updateDoc } from "../../firebase";
import { ClassRoomAgMultiSelectBox } from "../../components/AgMultiSelectBox/AgMultiSelectBox";

const userCollectionPath = "user";

const User = () => {
	const [rowData, setRowData] = useState<UserDoc[]>([]);
	const [gridColumnApi, setGridColumnApi] = useState<any>(null);
	console.log(gridColumnApi);

	useEffect(() => {
		const query = queryCollection(userCollectionPath, []);
		const unsubscribe = onSnapshot(query, (snapshot) => {
			const docs = snapshot.docs.map((doc) => doc.data() as UserDoc);
			docs.sort();
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
		autoHeight: true,
	};

	const valueSetter = (props: ValueSetterParams): boolean => {
		const user = props.data as UserDoc;
		const fieldPath = props.colDef.field;
		if (fieldPath) {
			updateDoc(userCollectionPath, user._id, { [fieldPath]: props.newValue });
			return true;
		}
		return false;
	};

	return (
		<div className="pageContainer">
			<div className="ag-theme-balham-dark agContainer">
				<AgGridReact
					defaultColDef={defaultColDef}
					suppressScrollOnNewData={true}
					groupDefaultExpanded={1}
					onGridReady={onGridReady}
					rowData={rowData}
					stopEditingWhenCellsLoseFocus={true}
					frameworkComponents={{
						multiClassRoomSelectBoxEditor: ClassRoomAgMultiSelectBox,
					}}
				>
					<AgGridColumn
						field="_timeCreate"
						headerName="생성일"
						valueGetter={(params) => {
							const data = params.data as UserDoc;
							return data?._timeCreate?.toDate();
						}}
					></AgGridColumn>
					<AgGridColumn
						field="_timeUpdate"
						headerName="수정일"
						valueGetter={(params) => {
							const data = params.data as UserDoc;
							return data?._timeUpdate?.toDate();
						}}
					></AgGridColumn>
					<AgGridColumn
						field="email"
						headerName="이메일"
						maxWidth={200}
					></AgGridColumn>
					<AgGridColumn
						field="tel"
						headerName="전화번호"
						editable={true}
						maxWidth={100}
						valueSetter={valueSetter}
					></AgGridColumn>
					<AgGridColumn
						field="classRooms"
						headerName="수강 목록"
						editable={true}
						cellEditor="multiClassRoomSelectBoxEditor"
						valueSetter={valueSetter}
					></AgGridColumn>
					<AgGridColumn
						field="sessionId"
						headerName="세션"
						editable={true}
						valueSetter={valueSetter}
					></AgGridColumn>
					<AgGridColumn
						field="roleGuest"
						headerName="roleGuest"
						// rowGroup={true} hide={true}
					></AgGridColumn>
					<AgGridColumn
						field="roleAdmin"
						headerName="roleAdmin"
						// rowGroup={true} hide={true}
					></AgGridColumn>
				</AgGridReact>
			</div>
		</div>
	);
};

export default User;
