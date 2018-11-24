import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const TooltipWrapper = function(props) {
    const tooltip = <MyTooltip text={props.text} />;
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

const MyTooltip = (props) => (
    <div style={{ ...props.style, position: 'absolute' }}>
        <Tooltip id="tooltip" className="tooltip">
            {props.text}
        </Tooltip>
    </div>
);

export default TooltipWrapper;
