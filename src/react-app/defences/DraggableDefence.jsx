import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

export default class DraggableDefence extends React.Component {
    render() {
        return (
            <img
                className="defence"
                draggable={this.props.draggable}
                src={this.props.src}
                onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', this.props.id);
                    event.dataTransfer.setData(this.props.id, this.props.id);
                }}
            />
        );
    }
}

DraggableDefence.propTypes = {
    src: PropTypes.string.isRequired,
    draggable: PropTypes.bool.isRequired
};
