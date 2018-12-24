import React from 'react';
import { Button } from 'react-bootstrap';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';

const width = 500;
const barHeight = 22;
const windowStyle = {
    boxShadow: 'rgba(0, 0, 0, 0.5) 0px 5px 15px',
    position: 'absolute',
    border: '1px solid rgba(0,0,0,.2)',
    borderRadius: '6px',
    width: `${width}px`,
    maxHeight: '1000px',
    background: 'white'
};

const barStyle = {
    borderTopLeftRadius: windowStyle.borderRadius,
    borderTopRightRadius: windowStyle.borderRadius,
    width: '100%',
    height: `${barHeight}px`,
    background: '#ddd'
};

const bodyStyle = {
    overflowY: 'scroll',
    height: `calc(100% - ${barStyle.height})`
};

export default class Window extends React.Component {
    constructor(props) {
        super(props);
        this.getOffset = this.getOffset.bind(this);
        this.ref = React.createRef();
    }

    getOffset() {
        let draggable = this.ref.current;
        return { x: draggable.state.x, y: draggable.state.y };
    }

    render() {
        return (
            <Draggable
                ref={this.ref}
                handle=".bar"
                onMouseDown={this.props.onClick}
                defaultPosition={this.props.offset}
                position={null}
                bounds={{
                    left: 0,
                    right: window.innerWidth - width,
                    top: 0,
                    bottom: window.innerHeight - barHeight
                }}
            >
                <div style={windowStyle}>
                    <div className="bar" style={barStyle}>
                        <Button
                            onClick={this.props.close}
                            style={{
                                position: 'absolute',
                                right: '1px',
                                top: '1px',
                                padding: '1px',
                                background: 'rgba(241, 241, 241, 0.0)',
                                border: 'none'
                            }}
                        >
                            <div>
                                <img
                                    src="assets/x.svg"
                                    alt="close-button"
                                    height="15px"
                                    width="15px"
                                />
                            </div>
                        </Button>
                    </div>
                    <div style={bodyStyle}>{this.props.children}</div>
                </div>
            </Draggable>
        );
    }
}

Window.propTypes = {
    close: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired,
    offset: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }).isRequired
};
