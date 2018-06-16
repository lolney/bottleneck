import React from 'react';
import ImageProblem from '../problem-engine/ImageProblem';
import PropTypes from 'prop-types';

export default class ImageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            generator: this.props.generator,
            target: this.props.problem.target,
            done: false
        };
        this.problem = new ImageProblem(this.props.problem.original);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.generator != prevProps.generator) {
            ImageProblem.create(this.props.generator).then((newImage) => {
                if (this.problem.original == newImage.original)
                    this.setState({ done: true });
                this.setState({ target: newImage.original });
            });
        }
    }

    // Passes props title, description, original and  to ProblemComponent
    // Passing JSX:
    // https://stackoverflow.com/questions/25797048/how-to-pass-in-a-react-component-into-another-react-component-to-transclude-the?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    render() {
        const description = this.state.done
            ? "You're done!"
            : this.props.problem.description;
        return (
            <div className="wrapper">
                <header className="header">{this.props.problem.title}</header>
                <section className="content">
                    <div className="row-1">
                        <sidebar-1 className="sidebar-1" />
                        <sidebar-2 className="sidebar-2" />
                        <main className="main" />
                        <aside className="caption-first">Original</aside>
                        <aside className="caption-second">Target</aside>
                    </div>
                    <div className="row-2">
                        <sidebar-1 className="sidebar-1" />
                        <sidebar-2 className="sidebar-2" />
                        <main className="main" />
                        <img
                            src={this.props.problem.original}
                            className="image-first"
                        />
                        <img src={this.state.target} className="image-second" />
                    </div>
                </section>
                <footer className="footer">{description}</footer>
            </div>
        );
    }
}

ImageComponent.propTypes = {
    generator: PropTypes.func.isRequired,
    problem: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        original: PropTypes.string,
        target: PropTypes.string
    }).isRequired
};
