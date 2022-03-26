import { useCallback, useEffect, useState } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { ColDef, ValueSetterParams } from 'ag-grid-community';

import { UserDoc } from '../../lib/1/schema';
import { FirebaseManager } from '../../lib/2/firebase-manager';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

import { ClassRoomAgMultiSelectBox } from '../../components/AgMultiSelectBox/AgMultiSelectBox';
import DeleteUserDialog from '../../components/DeleteUserDialog/DeleteUserDialog';

const firebaseManager = FirebaseManager.getInstance();
const userCollectionPath = 'user';

const User = () => {
  const [rowData, setRowData] = useState<UserDoc[]>([]);
  const [gridColumnApi, setGridColumnApi] = useState<any>(null);
  console.log(gridColumnApi);

  useEffect(() => {
    const subscription = firebaseManager
      .observe<UserDoc>(userCollectionPath, [])
      .subscribe((docs) => {
        docs.sort();
        setRowData(docs);
      });

    return () => subscription.unsubscribe();
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
      // 변화가 없으면 아무것도 하지 않는다.
      if (props.oldValue === props.newValue) {
        return false;
      }

      // 빈 문자열은 제거한다.
      if (Array.isArray(props.newValue) && props.newValue.length > 0) {
        const values = props.newValue.filter((str) => str.length > 0);
        firebaseManager.updateDoc(userCollectionPath, user._id, {
          [fieldPath]: values,
        });
      } else {
        firebaseManager.updateDoc(userCollectionPath, user._id, {
          [fieldPath]: props.newValue,
        });
      }
      return true;
    }
    return false;
  };

  const deleteUser = useCallback(async (user: UserDoc) => {
    const updateData: Partial<UserDoc> = { deleted: true };
    return firebaseManager.updateDoc(userCollectionPath, user._id, updateData);
  }, []);

  const undoUser = useCallback(async (user: UserDoc) => {
    const updateData: Partial<UserDoc> = { deleted: false };
    return firebaseManager.updateDoc(userCollectionPath, user._id, updateData);
  }, []);

  return (
    <div className='pageContainer'>
      <div className='ag-theme-balham-dark agContainer'>
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
            headerName='명령'
            cellRendererFramework={(props: { data: UserDoc }) => {
              const options =
                props.data.deleted === true
                  ? {
                      callBack: () => undoUser(props.data),
                      buttonText: '복구',
                      title: '계정을 복구할까요?',
                      subText: '복구 시 서비스를 이용할 수 있습니다.',
                    }
                  : {
                      callBack: () => deleteUser(props.data),
                      buttonText: '삭제',
                      title: '계정을 삭제하시겠습니까?',
                      subText: '삭제 시 서비스 이용이 불가능합니다.',
                    };

              return DeleteUserDialog(options);
            }}
          />
          <AgGridColumn
            field='_timeCreate'
            headerName='생성일'
            valueGetter={(params) => {
              const data = params.data as UserDoc;
              return data?._timeCreate?.toDate();
            }}
          ></AgGridColumn>
          <AgGridColumn
            field='_timeUpdate'
            headerName='수정일'
            valueGetter={(params) => {
              const data = params.data as UserDoc;
              return data?._timeUpdate?.toDate();
            }}
          ></AgGridColumn>
          <AgGridColumn
            field='userName'
            headerName='회원명'
            maxWidth={100}
          ></AgGridColumn>
          <AgGridColumn
            field='email'
            headerName='이메일'
            maxWidth={200}
          ></AgGridColumn>
          <AgGridColumn
            field='tel'
            headerName='전화번호'
            editable={true}
            maxWidth={100}
            valueSetter={valueSetter}
          ></AgGridColumn>
          <AgGridColumn
            field='classRooms'
            headerName='수강 목록'
            editable={true}
            cellEditor='multiClassRoomSelectBoxEditor'
            valueSetter={valueSetter}
          ></AgGridColumn>
          <AgGridColumn
            field='sessionId'
            headerName='세션'
            editable={true}
            valueSetter={valueSetter}
          ></AgGridColumn>
          <AgGridColumn
            field='roleGuest'
            headerName='roleGuest'
            // rowGroup={true} hide={true}
          ></AgGridColumn>
          <AgGridColumn
            field='roleAdmin'
            headerName='roleAdmin'
            // rowGroup={true} hide={true}
          ></AgGridColumn>
        </AgGridReact>
      </div>
    </div>
  );
};

export default User;
