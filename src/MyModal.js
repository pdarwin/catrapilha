import { Alert, Modal } from "@mui/material";

export default function MyModal({ open, err, errLevel, handleClose }) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Alert severity={errLevel}>{err}</Alert>
    </Modal>
  );
}
