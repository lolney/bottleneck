import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const TooltipWrapper = function(props) {
    const tooltip = <MyTooltip text={props.text} disabled={props.disabled} />;
    return (
        <OverlayTrigger
            {...props.triggerProps}
            delayShow={240}
            overlay={tooltip}
        >
            {props.children}
        </OverlayTrigger>
    );
};

const MyTooltip = function(props) {
    if (!props.disabled) {
        return (
            <div style={{ ...props.style, position: 'absolute' }}>
                <Tooltip id="tooltip" className="tooltip">
                    {props.text}
                </Tooltip>
            </div>
        );
    } else {
        return (
            <div style={{ ...props.style, position: 'absolute', opacity: '0' }}>
                <Tooltip
                    id="tooltip"
                    className="tooltip"
                    style={{ opacity: '0' }}
                >
                    {props.text}
                </Tooltip>
            </div>
        );
    }
};

export default TooltipWrapper;
