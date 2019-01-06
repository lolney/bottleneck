import React from 'react';
import TwoVector from 'lance/serialize/TwoVector';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-bootstrap';

export default class TutorialArrow extends React.PureComponent {
    constructor(props) {
        super(props);

        this.renderCoords = this.renderCoords.bind(this);
    }

    renderCoords(coords) {
        var direction = this.props.direction ? this.props.direction : 'left';
        this.arrowObject = this.props.gameApi.addArrow(coords, direction);
        return null;
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
            var coords = new TwoVector(x, y);
            return this.renderCoords(coords);
        case 'game object':
            var obj = this.props.gameApi.queryObject({});
            return this.renderCoords(obj.position);
        default:
            throw new Error(
                `Unexpected arrow config type: ${this.props.type}`
            );
        }
    }

    componentWillUnmount() {
        if (this.arrowObject) {
            this.props.gameApi.removeObject(this.arrowObject);
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
        queryObject: PropTypes.func.isRequired,
        removeObject: PropTypes.func.isRequired,
        addArrow: PropTypes.func.isRequired
    }).isRequired,
    type: PropTypes.string.isRequired,
    direction: PropTypes.string,
    target: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired
};
