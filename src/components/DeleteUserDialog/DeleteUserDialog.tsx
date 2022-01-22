import React, { useState } from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { DefaultButton, Dialog, DialogFooter, PrimaryButton, Spinner, SpinnerSize } from "@fluentui/react";

import styles from "./DeleteUserDialog.module.scss";

interface IDeleteUserDialogProps {
  buttonText: string;
  title: string;
  subText: string;
  callBack: () => Promise<string>;
}

const DeleteUserDialog: React.FC<IDeleteUserDialogProps> = (props) => {
  const { callBack, buttonText, title, subText } = props;
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  const deleteUser = async () => {
    setShowSpinner(true);
    try {
      await callBack();
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        setErrorMsg(error.message);
      } else {
        console.log(error);
        setErrorMsg('알 수 없는 에러입니다.');
      }
      setShowSpinner(false);
    }
  }

  return (
    <>
      <DefaultButton
        className={`${styles.deleteButton} ${buttonText === '삭제' ? styles.isActivate : ''}`}
        onClick={toggleHideDialog}
        text={buttonText}
        secondaryText={title}
      />
      <Dialog
        hidden={hideDialog}
        onDismiss={toggleHideDialog}
        dialogContentProps={{ title, subText }}
        minWidth={420}
				maxWidth={540}
      >
        {errorMsg && <p>{errorMsg}</p>}
        {showSpinner
            ? <Spinner size={SpinnerSize.medium} />
            : <DialogFooter>
              <PrimaryButton onClick={deleteUser} text={buttonText} />
              <DefaultButton onClick={toggleHideDialog} text="취소"/>
            </DialogFooter>
        }
      </Dialog>
    </>
  )
}

export default DeleteUserDialog;
