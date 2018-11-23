import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const TooltipWrapper = function(props) {
    const tooltip = (
        <div
            style={{
                position: 'absolute'
            }}
        >
            <Tooltip id="tooltip" className="tooltip">
                {props.text}
            </Tooltip>
        </div>
    );
    return (
        <OverlayTrigger {...props.triggerProps} overlay={tooltip}>
            {props.children}
        </OverlayTrigger>
    );
};

export default TooltipWrapper;
