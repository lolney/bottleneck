import React from 'react';
import BinaryTreeComponent from './BinaryTreeComponent.jsx';
import ImageComponent from './ImageComponent.jsx';
import PropTypes from 'prop-types';
import './CSS/Image.scss';
import { Button } from 'react-bootstrap';
import { render } from 'react-dom';
import { Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { Component, Fragment } from 'react';
import { withAlert } from 'react-alert';

class AlertWindow extends React.Component {
    render() {
        if (done) {
            return this.props.alert.show('Oh look, an alert!');
        }
    }
}

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
            <div className="modal">
                <div className="wrapper">
                    <header className="header">
                        {this.props.problem.title}
                    </header>
                    {child}
                    <AlertWindow
                        done={this.state.done}
                        alert={this.props.alert}
                    />
                    <footer className="footer">{description}</footer>
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
    }).isRequired,
    alert: PropTypes.func.isRequired
};

AlertWindow.propTypes = {
    alert: PropTypes.func.isRequired,
    done: PropTypes.state.isRequired
};
