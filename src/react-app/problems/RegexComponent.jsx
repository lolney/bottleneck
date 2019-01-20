import React from 'react';
import PropTypes from 'prop-types';
import { ProblemSubComponentTypes } from './PropTypes';
import RegexProblem from '../../problem-engine/RegexProblem';
import OriginalTargetComponent from './OriginalTargetComponent.jsx';

export default class RegexComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            matches: []
        };
    }

    componentDidMount() {
        this.componentDidUpdate({});
    }

    componentDidUpdate(prevProps) {
        if (this.props.generator != prevProps.generator) {
            try {
                const generator = RegexProblem.wrapGenerator(
                    this.props.generator
                );
                let matches = this.props.problem.text.filter((testCase) =>
                    generator(testCase)
                );
                matches = matches ? matches : [];

                this.setState({ matches });
                const done = this.checkWords(matches);

                this.props.setDone(done);
                this.props.reportError(null);
            } catch (error) {
                this.props.setDone(false);
                this.props.reportError(error);
            }
        }
    }

    checkWords(words) {
        const targetWords = this.props.problem.targetWords;

        if (words.length != targetWords.length) {
            return false;
        }

        const targetSet = new Set(targetWords);

        for (const elem of words) {
            if (!targetSet.has(elem)) return false;
        }

        return true;
    }

    renderMatch(matches, text) {
        return (
            <li key={text}>
                {matches.includes(text) ? <mark>{text}</mark> : text}
            </li>
        );
    }

    render() {
        return (
            <OriginalTargetComponent
                original={
                    <ul className="regexContainer">
                        {this.props.problem.text.map((word) =>
                            this.renderMatch(
                                this.props.problem.targetWords,
                                word
                            )
                        )}
                    </ul>
                }
                target={
                    <ul className="regexContainer">
                        {this.props.problem.text.map((word) =>
                            this.renderMatch(this.state.matches, word)
                        )}
                    </ul>
                }
            />
        );
    }
}

RegexComponent.propTypes = {
    ...ProblemSubComponentTypes,
    problem: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        text: PropTypes.arrayOf(PropTypes.string),
        targetWords: PropTypes.arrayOf(PropTypes.string)
    })
};
