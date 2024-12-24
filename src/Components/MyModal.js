import { Alert, Link, Modal } from "@mui/material";
import { useModalContext } from "../Reducers/ModalContext";
import { actionsM } from "../Reducers/ModalReducer";

export default function MyModal() {
  const { modalState, modalDispatch } = useModalContext();

  const handleClose = () => {
    if (typeof modalState.onClose === "function") {
      modalState.onClose(); // Execute the callback if it exists
    }
    modalDispatch({
      type: actionsM.closeModal,
    });
  };

  return (
    <Modal
      open={modalState.open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Alert severity={modalState.level}>
        {modalState.msg}
        {modalState.link ? (
          <Link
            href={modalState.link}
            style={{ padding: 2 }}
            target="_blank"
            rel="noopener"
          >
            {modalState.link}
          </Link>
        ) : (
          ""
        )}
      </Alert>
    </Modal>
  );
}
