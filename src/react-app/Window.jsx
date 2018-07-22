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
    render() {
        return (
            <Draggable
                onMouseDown={this.props.onClick}
                defaultPosition={{ x: 0, y: 0 }}
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
