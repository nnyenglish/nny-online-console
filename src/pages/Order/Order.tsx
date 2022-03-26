import { FC, useCallback, useEffect, useState } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { ColDef, ValueSetterParams } from 'ag-grid-community';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

import { OrderDoc } from '../../lib/1/schema';
import { FirebaseManager } from '../../lib/2/firebase-manager';

const firebaseManager = FirebaseManager.getInstance();
const orderCollectionPath = 'order';

const Order: FC = ({}) => {
  const [rowData, setRowData] = useState<OrderDoc[]>([]);
  const [gridColumnApi, setGridColumnApi] = useState<any>(null);
  console.log(gridColumnApi);

  useEffect(() => {
    const subscription = firebaseManager
      .observe<OrderDoc>(orderCollectionPath, [])
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
    const order = props.data as OrderDoc;
    const fieldPath = props.colDef.field;
    if (fieldPath) {
      // 변화가 없으면 아무것도 하지 않는다.
      if (props.oldValue === props.newValue) {
        return false;
      }

      // 빈 문자열은 제거한다.
      if (Array.isArray(props.newValue) && props.newValue.length > 0) {
        const values = props.newValue.filter((str) => str.length > 0);
        firebaseManager.updateDoc(orderCollectionPath, order._id, {
          [fieldPath]: values,
        });
      } else {
        firebaseManager.updateDoc(orderCollectionPath, order._id, {
          [fieldPath]: props.newValue,
        });
      }
      return true;
    }
    return false;
  };

  const deleteOrder = useCallback(async (order: OrderDoc) => {
    const updateData: Partial<OrderDoc> = { deleted: true };
    return firebaseManager.updateDoc(orderCollectionPath, order._id, updateData);
  }, []);

  const undoOrder = useCallback(async (order: OrderDoc) => {
    const updateData: Partial<OrderDoc> = { deleted: false };
    return firebaseManager.updateDoc(orderCollectionPath, order._id, updateData);
  }, []);

  return (
    <div className='pageContainer'>
      <div className='ag-theme-balham-dark agContainer'>
        <AgGridReact
          defaultColDef={defaultColDef}
          rowData={rowData}
          onGridReady={onGridReady}
          suppressScrollOnNewData={true}
          stopEditingWhenCellsLoseFocus={true}
        >
          <AgGridColumn
            field='checked'
            headerName='관리자확인'
            editable={true}
            cellEditor='agRichSelectCellEditor'
            cellEditorPopup={true}
            cellEditorParams={{
              values: [true, false],
              cellEditorPopup: true
            }}
            valueSetter={valueSetter}
            maxWidth={100}
          />
          <AgGridColumn
            field='_timeCreate'
            headerName='생성일'
            hide={true}
            valueGetter={(params) => {
              const data = params.data as OrderDoc;
              return data?._timeCreate?.toDate();
            }}
          />
          <AgGridColumn
            field='_timeUpdate'
            headerName='수정일'
            hide={true}
            valueGetter={(params) => {
              const data = params.data as OrderDoc;
              return data?._timeUpdate?.toDate();
            }}
          />
          <AgGridColumn
            field='status'
            headerName='결제상태'
            valueFormatter={(params) => {
              const status = params.value as OrderDoc['status'];
              switch (status) {
                case 'paid':
                  return '🟢 결제완료';
                case 'cancelled':
                  return '❌ 결제취소';
                case 'failed':
                  return '⚠️ 결제실패';
                case 'staging':
                  return '결제대기';
                case 'ready':
                  return '계좌입금완료';
                default:
                  return status;
              }
            }}
            maxWidth={160}
          />
          <AgGridColumn
            field='_id'
            headerName='주문 id'
            maxWidth={200}
          />
          <AgGridColumn
            field='userId'
            headerName='구매자 Id'
            maxWidth={200}
          />
          <AgGridColumn
            field='userName'
            headerName='구매자'
            maxWidth={100}
          />
          <AgGridColumn
            field='products'
            headerName='상품 Id'
            valueGetter={(params) => {
              const data = params.data as OrderDoc;
              return data?.products[0]?.id
            }}
          />
          <AgGridColumn
            field='products'
            headerName='상품 종류'
            maxWidth={100}
            valueGetter={(params) => {
              const data = params.data as OrderDoc;
              return data?.products[0]?.type
            }}
          />
          <AgGridColumn
            field='products'
            headerName='상품명'
            maxWidth={100}
            valueGetter={(params) => {
              const data = params.data as OrderDoc;
              return data?.products[0]?.productName
            }}
          />
          <AgGridColumn
            field='amount'
            headerName='결제금액(원)'
            valueFormatter={({ value }) => {
              return Intl.NumberFormat().format(value);
            }}
            maxWidth={120}
          />
          <AgGridColumn
            field='paymentMethod'
            headerName='결제방법'
            maxWidth={88}
          />
          <AgGridColumn
            field='pg'
            headerName='PG사'
            maxWidth={100}
          />
        </AgGridReact>
      </div>
    </div>
  );
};

export default Order;
