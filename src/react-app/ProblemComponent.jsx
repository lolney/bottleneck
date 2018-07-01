import React from 'react';

export default class ProblemComponent extends React.Component {
    // Receives props title, description, original and target
    render() {
        const description = this.state.done
            ? "You're done!"
            : this.props.problem.description;
        // TODO: match passed problem to the correct subcomponent
        <div className="wrapper">
            <header className="header">{this.props.problem.title}</header>
            <section className="content">
                <ImageComponent />
            </section>
            <footer className="footer">{description}</footer>
        </div>;
    }
}
