import React, {useState} from 'react';
import Typography from "@mui/material/Typography";
import {Modal, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";

const AddTsubuyakiModal = () => {
    const [isOpenTsubuyakiModal, setIsOpenTsubuyakiModal] = useState<boolean>(false);

    const openAddTsubuyakiModalHandler = () => {
        console.log('push addTsubuyaki button');
        setIsOpenTsubuyakiModal(true);
    }

    const closeAddTsubuyakiModalHandler = () => {
        console.log('push addTsubuyaki button');
        setIsOpenTsubuyakiModal(false);
    }

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };


    return (
        <Box>
            <Box sx={{position: "relative" ,textAlign: "end", marginRight: 10}}>
                <IconButton sx={{position: "fixed", zIndex: 100}} onClick={() => openAddTsubuyakiModalHandler()}>
                    <AddCircleIcon/>
                </IconButton>
            </Box>

            <Modal
                open={isOpenTsubuyakiModal}
                onClose={closeAddTsubuyakiModalHandler}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                BackdropProps={{
                    onClick: (event) => event.stopPropagation(),
                }}
            >
                <Box sx={style}>
                    <IconButton onClick={closeAddTsubuyakiModalHandler}>
                        <CloseIcon />
                    </IconButton>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Text in a modal
                    </Typography>
                    <TextField
                        fullWidth
                        label="Your Text"
                        variant="outlined"
                        sx={{ mt: 2 }}
                    />
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography>
                </Box>
            </Modal>
        </Box>
    );
};

export default AddTsubuyakiModal;
