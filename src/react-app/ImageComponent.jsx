import React from 'react';
import ImageProblem from '../problem-engine/ImageProblem';
import PropTypes from 'prop-types';
import './CSS/Image.scss';

export default class ImageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            generator: this.props.generator,
            target: this.props.problem.target
        };
        this.problem = new ImageProblem(this.props.problem.original);

        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.generator != prevProps.generator) {
            ImageProblem.create(this.props.generator).then((newImage) => {
                if (this.problem.original == newImage.original)
                    this.props.setDone();
                this.setState({ target: newImage.original });
            });
        }
    }

    render() {
        return (
            <div className="imageProblem">
                <section className="content">
                    <div className="row-1">
                        <aside className="caption-first">Original</aside>
                        <aside className="caption-second">Target</aside>
                    </div>
                    <div className="row-2">
                        <img
                            src={this.props.problem.original}
                            className="image-first"
                        />
                        <img src={this.state.target} className="image-second" />
                    </div>
                </section>
            </div>
        );
    }
}

ImageComponent.propTypes = {
    generator: PropTypes.func.isRequired,
    setDone: PropTypes.func.isRequired,
    problem: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        original: PropTypes.string,
        target: PropTypes.string
    }).isRequired
};
