import React from 'react';
import PropTypes from 'prop-types';
import { polyfill } from 'mobile-drag-drop';

polyfill();

export default class DraggableDefense extends React.Component {
    render() {
        return (
            <img
                height="40px"
                width="40px"
                className={
                    this.props.draggable ? 'defense' : 'defense-not-buyable'
                }
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
    id: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    draggable: PropTypes.bool.isRequired
};
