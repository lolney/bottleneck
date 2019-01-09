import React from 'react';
import PropTypes from 'prop-types';

const OriginalTargetComponent = ({ original, target }) => (
    <div className="imageProblem">
        <section className="content">
            <div className="row-1">
                <aside className="caption-first">Original</aside>
                <aside className="caption-second">Target</aside>
            </div>
            <div className="row-2">
                {original}
                {target}
            </div>
        </section>
    </div>
);

OriginalTargetComponent.propTypes = {
    original: PropTypes.element.isRequired,
    target: PropTypes.element.isRequired
};

export default OriginalTargetComponent;
