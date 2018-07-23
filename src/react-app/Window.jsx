import React from 'react';
import Draggable from 'react-draggable';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '75vh',
        maxHeight: '1000px'
    }
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
                onMouseDown={this.props.onClick}
                defaultPosition={this.props.offset}
                position={null}
                grid={[25, 25]}
            >
                <div
                    style={{
                        position: 'absolute',
                        border: '1px solid rgba(0,0,0,.2)',
                        borderRadius: '6px',
                        width: '500px',
                        height: '75vh',
                        maxHeight: '1000px',
                        background: 'white'
                    }}
                >
                    <div onClick={this.props.close} style={{ float: 'right' }}>
                        {' '}
                        X{' '}
                    </div>
                    {this.props.children}
                </div>
            </Draggable>
        );
    }
}
