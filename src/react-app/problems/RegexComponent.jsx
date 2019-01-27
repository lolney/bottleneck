import React from 'react';
import PropTypes from 'prop-types';
import { ProblemSubComponentTypes } from './PropTypes';
import RegexProblem from '../../problem-engine/RegexProblem';
import OriginalTargetComponent from './OriginalTargetComponent.jsx';
import Highlighter from 'react-highlight-words';

export default class RegexComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            matches: [],
            partials: []
        };

        this.targets = this.props.problem.text.map((word) =>
            this.props.problem.targetWords.includes(word)
        );
        this.renderMatch = this.renderMatch.bind(this);
        this.renderTarget = this.renderTarget.bind(this);
        this.checkWords = this.checkWords.bind(this);
    }

    componentDidMount() {
        this.componentDidUpdate({});
    }

    componentDidUpdate(prevProps) {
        if (this.props.generator != prevProps.generator) {
            let done = false;
            let error = null;

            try {
                const generator = RegexProblem.wrapGenerator(
                    this.props.generator
                );
                const partialGenerator = RegexProblem.wrapPartialGenerator(
                    this.props.generator
                );

                const matches = this.props.problem.text.map((testCase) =>
                    generator(testCase)
                );
                const partials = this.props.problem.text.map((testCase) =>
                    partialGenerator(testCase)
                );

                this.setState({ matches, partials });
                done = this.checkWords(matches);
            } catch (err) {
                error = err;
            }

            this.props.setDone(done);
            this.props.reportError(error);
        }
    }

    checkWords(words) {
        return this.targets
            .map((word, i) => words[i] === word)
            .every((bool) => bool);
    }

    renderMatch(word, i) {
        let display;
        if (this.state.matches[i]) {
            display = <mark className="highlight-match">{word}</mark>;
        } else if (this.state.partials[i]) {
            display = (
                <Highlighter
                    highlightClassName="highlight-partial"
                    searchWords={[this.state.partials[i]]}
                    autoEscape={true}
                    textToHighlight={word}
                />
            );
        } else {
            display = word;
        }
        return <li key={i}>{display}</li>;
    }

    renderTarget(word, i) {
        let display;
        if (this.targets[i]) {
            display = <mark className="highlight-match">{word}</mark>;
        } else {
            display = word;
        }
        return <li key={i}>{display}</li>;
    }

    render() {
        const renderRegexContainer = (renderWord) => (
            <div className="regexSupercontainer">
                <div className="regexTop" />
                <div className="regexMiddle" />
                <div className="regexBottom" />
                <ul className="regexContainer">
                    {this.props.problem.text.map((word, i) =>
                        renderWord(word, i)
                    )}
                </ul>
                {' '}
            </div>
        );
        return (
            <OriginalTargetComponent
                original={renderRegexContainer(this.renderTarget)}
                target={renderRegexContainer(this.renderMatch)}
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
