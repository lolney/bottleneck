import React from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';

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
                grid={[25, 25]}
            >
                <div
                    style={{
                        boxShadow: 'rgba(0, 0, 0, 0.5) 0px 5px 15px',
                        position: 'absolute',
                        border: '1px solid rgba(0,0,0,.2)',
                        borderRadius: '6px',
                        width: '500px',
                        height: '75vh',
                        maxHeight: '1000px',
                        background: 'white'
                    }}
                >
                    <div
                        className="bar"
                        style={{
                            border: '1px solid rgba(0,0,0,.2)',
                            borderTopLeftRadius: '6px',
                            borderTopRightRadius: '6px',
                            width: '100%',
                            height: '22px',
                            background: '#ddd'
                        }}
                    >
                        <div
                            onClick={this.props.close}
                            style={{ float: 'right', padding: '1px' }}
                        >
                            {' '}
                            X{' '}
                        </div>
                    </div>
                    <div
                        style={{
                            overflowY: 'scroll',
                            height: 'calc(100% - 22px)'
                        }}
                    >
                        {this.props.children}
                    </div>
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
