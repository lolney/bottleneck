import React from 'react';
import PropTypes from 'prop-types';

const AlertContents = (props) => (
    <div className="alert-contents">
        <div className="icon-container">
            <img alt="info icon" src="../../../assets/info.svg" />
        </div>
        <div className="message-container">
            <p>{props.msg}</p>
        </div>
        <div className="btn-container">
            <button onClick={props.onClose} className="close-btn-container">
                <div className="close-btn">
                    <img
                        alt="close icon"
                        src="../../../assets/letter-x.svg"
                        height="15px"
                        width="15px"
                    />
                </div>
            </button>
            {props.onProceed ? (
                <button
                    className="proceed-btn-container"
                    onClick={props.onProceed}
                >
                    <div className="proceed-btn">
                        <img
                            alt="proceed icon"
                            src="../../../assets/right-arrow.svg"
                            height="20px"
                            width="20px"
                        />
                    </div>
                </button>
            ) : (
                <div className="proceed-btn-container" />
            )}
        </div>
    </div>
);

export default AlertContents;

AlertContents.propTypes = {
    msg: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onProceed: PropTypes.func
};
