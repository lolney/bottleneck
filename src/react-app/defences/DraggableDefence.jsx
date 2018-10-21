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
                    /**
                     // Change the ghost image here
                    var img = document.createElement('img');
                    img.src = 'assets/grass.jpg';
                    event.dataTransfer.setDragImage(img, 0, 0);
                    */

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
