import { Alert, Link, Modal } from "@mui/material";
import { useModalContext } from "../Reducers/ModalContext";
import { actionsM } from "../Reducers/ModalReducer";

export default function MyModal() {
  const { modalState, modalDispatch } = useModalContext();

  return (
    <Modal
      open={modalState.open}
      onClose={() =>
        modalDispatch({
          type: actionsM.closeModal,
        })
      }
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
