import React from 'react';
import BinaryTreeComponent from './BinaryTreeComponent.jsx';
import ImageComponent from './ImageComponent.jsx';

export default class ProblemComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            done: false
        };
        this.getChild.bind(this);
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

    // Receives props title, description, original and target
    render() {
        const description = this.state.done
            ? "You're done!"
            : this.props.problem.description;

        const child = React.createElement(
            this.getChild(this.props.problem.type),
            {
                problem: this.props.problem,
                setDone: () => {
                    this.setState({ done: true });
                },
                generator: this.props.generator
            }
        );
        return (
            <div className="wrapper">
                <header className="header">{this.props.problem.title}</header>
                {child}
                <footer className="footer">{description}</footer>
            </div>
        );
    }
}
