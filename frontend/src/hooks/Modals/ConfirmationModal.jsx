import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  const darkMode = (() => { try { return localStorage.getItem('theme') === 'dark'; } catch (e) { return true; } })();
  return (
    <Modal open={isOpen} onClose={onCancel}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: darkMode ? '#1f2937' : 'background.paper',
          color: darkMode ? '#ffffff' : undefined,
          border: "2px solid",
          borderColor: darkMode ? '#374151' : '#000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <p>{message}</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;