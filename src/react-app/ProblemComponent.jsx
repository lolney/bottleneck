import React from 'react';
import BinaryTreeComponent from './BinaryTreeComponent.jsx';
import ImageComponent from './ImageComponent.jsx';
import PropTypes from 'prop-types';
import './CSS/Image.scss';
import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

export default class ProblemComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            done: false
        };

        this.getChild.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        this.setState({ done: false });
    }

    handleShow() {
        this.setState({ done: true });
    }

    getChild(typeString) {
        switch (typeString) {
        case 'btree':
            return BinaryTreeComponent;
        case 'image':
            return ImageComponent;
        default:
            throw new TypeError('unexpected typeString');
        }
    }

    render() {
        const description = this.state.done
            ? 'You\'re done!'
            : this.props.problem.description;

        const child = React.createElement(
            this.getChild(this.props.problem.type),
            {
                problem: this.props.problem,
                setDone: (done) => {
                    if (done)
                        this.props.onSolution(
                            this.props.problem.id,
                            this.props.generator
                        );
                    this.handleShow;
                    this.setState({ done: done });
                },
                generator: this.props.generator,
                reportError: this.props.reportError
            }
        );
        return (
            <div>
                <div className="modal">
                    <div className="wrapper">
                        <header className="header">
                            {this.props.problem.title}
                        </header>
                        {child}
                        <Modal show={this.state.done} onHide={this.handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Modal heading</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <h4>Text in a modal</h4>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button onClick={this.handleClose}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        <footer className="footer">{description}</footer>
                    </div>
                </div>
            </div>
        );
    }
}

ProblemComponent.propTypes = {
    generator: PropTypes.func.isRequired,
    reportError: PropTypes.func.isRequired,
    onSolution: PropTypes.func.isRequired,
    problem: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string
    }).isRequired
};
