import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const CancelDialog = ({ cancel, ok }) => (
    <div className="bootstrap-styles" id="cancel-dialog">
        <Modal.Dialog>
            <Modal.Header id="header">
                <Modal.Title>End the tutorial?</Modal.Title>
            </Modal.Header>

            <Modal.Body id="body">
                Doing that will stop the tutorial. Do you still want to
                continue?
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={ok}>End tutorial </Button>
                <Button onClick={cancel} bsStyle="primary" id="pink-button">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal.Dialog>
    </div>
);

export default CancelDialog;
