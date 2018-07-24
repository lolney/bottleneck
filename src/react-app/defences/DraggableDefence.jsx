import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

export default class DraggableDefence extends React.Component {
    render() {
        return (
            <img
                draggable="true"
                src={this.props.src}
                onDragEnd={this.props.onDragEnd}
                onDragOver={this.props.onDragOver}
            />
        );
    }
}

DraggableDefence.propTypes = {
    src: PropTypes.string.isRequired,
    onDragEnd: PropTypes.func.isRequired,
    onDragOver: PropTypes.func.isRequired
};
