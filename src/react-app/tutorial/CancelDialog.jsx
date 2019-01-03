import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const CancelDialog = ({ cancel, ok }) => (
    <div className="bootstrap-styles">
        <Modal.Dialog>
            <Modal.Header>
                <Modal.Title>End the tutorial?</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                Doing that will stop the tutorial. Do you still want to
                continue?
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={ok}>End tutorial </Button>
                <Button onClick={cancel} bsStyle="primary">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal.Dialog>
    </div>
);

export default CancelDialog;
