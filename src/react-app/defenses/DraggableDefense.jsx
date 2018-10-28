import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

export default class DraggableDefense extends React.Component {
    render() {
        return (
            <img
                className="defense"
                draggable={this.props.draggable}
                src={this.props.src}
                onDragStart={(event) => {
                    let img = new Image();
                    img.src = 'assets/x.svg';

                    event.dataTransfer.setDragImage(img, 0, 0);

                    event.dataTransfer.setData('text/plain', this.props.id);
                    event.dataTransfer.setData(this.props.id, this.props.id);
                }}
            />
        );
    }
}

DraggableDefense.propTypes = {
    src: PropTypes.string.isRequired,
    draggable: PropTypes.bool.isRequired
};
