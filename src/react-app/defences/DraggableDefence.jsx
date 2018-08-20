import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

export default class DraggableDefence extends React.Component {
    render() {
        return (
            <img
                className="defence"
                draggable="true"
                src={this.props.src}
                onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', this.props.src);
                }}
            />
        );
    }
}

DraggableDefence.propTypes = {
    src: PropTypes.string.isRequired
};
