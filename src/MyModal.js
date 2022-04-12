import { Alert, Link, Modal } from "@mui/material";

export default function MyModal({ open, err, errlink, errLevel, handleClose }) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Alert severity={errLevel}>
        {err}
        {errlink ? (
          <Link
            href={errlink}
            style={{ padding: 2 }}
            target="_blank"
            rel="noopener"
          >
            {errlink}
          </Link>
        ) : (
          ""
        )}
      </Alert>
    </Modal>
  );
}
