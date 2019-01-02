import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-bootstrap';

// E.G. for line 17-21:     <Tooltip placement="left" id="tooltip-left" className="in" />

const MyArrow = function(props) {
    return (
        <div
            style={{
                position: 'absolute',
                top: props.yCoordinate,
                left: props.xCoordinate
            }}
            className="bootstrap-styles tutorial-arrow"
        >
            <Tooltip
                placement={props.direction}
                id={props.typeDirection}
                className="in"
            />
        </div>
    );
};

export default MyArrow;

MyArrow.propTypes = {
    direction: PropTypes.string.isRequired,
    typeDirection: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
    yCoordinate: PropTypes.string.isRequired,
    xCoordinate: PropTypes.string.isRequired
};
