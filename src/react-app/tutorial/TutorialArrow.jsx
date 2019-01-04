import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-bootstrap';

export default class TutorialArrow extends React.Component {
    constructor(props) {
        super(props);

        this.renderCoords = this.renderCoords.bind(this);
    }

    renderCoords(coords) {
        if (this.props.gameApi.coordsInBounds(coords)) {
            return (
                <MyArrow
                    direction={
                        this.props.direction ? this.props.direction : 'left'
                    }
                    x={coords.x}
                    y={coords.y}
                />
            );
        } else {
            return null;
        }
    }

    render() {
        switch (this.props.type) {
        case 'dom object':
            var node = document.getElementById(this.props.target);
            return ReactDOM.createPortal(
                <MyArrow
                    direction={
                        this.props.direction
                            ? this.props.direction
                            : 'right'
                    }
                />,
                node
            );
        case 'coordinates':
            var { x, y } = this.props.target;
            var coords = this.props.gameApi.worldToCanvasCoordinates(x, y);
            return this.renderCoords(coords);

            // call game API: add arrow at coords
        case 'game object':
            var obj = this.props.gameApi.queryObject({});
            coords = this.props.gameApi.worldToCanvasCoordinates(
                obj.position.x,
                obj.position.y
            );
            return this.renderCoords(coords);

            // call game api: find closest object
            // call game api: add arrow at coords
        default:
            throw new Error(
                `Unexpected arrow config type: ${this.props.type}`
            );
        }
    }
}

const MyArrow = function(props) {
    return (
        <div
            style={{
                position: 'absolute',
                top: props.y,
                left: props.x
            }}
            className="bootstrap-styles tutorial-arrow"
        >
            <Tooltip
                placement={props.direction}
                id={`tooltip-${props.direction}`}
                className="in"
            />
        </div>
    );
};

MyArrow.propTypes = {
    direction: PropTypes.oneOf(['top', 'bottom', 'left', 'right']).isRequired,
    y: PropTypes.number,
    x: PropTypes.number
};

TutorialArrow.propTypes = {
    gameApi: PropTypes.shape({
        coordsInBounds: PropTypes.func.isRequired,
        queryObject: PropTypes.func.isRequired,
        worldToCanvasCoordinates: PropTypes.func.isRequired
    }).isRequired,
    type: PropTypes.string.isRequired,
    direction: PropTypes.string,
    target: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired
};
