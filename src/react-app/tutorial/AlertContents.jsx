import React from 'react';
import PropTypes from 'prop-types';

const AlertContents = (props) => (
    <div className="alert-contents">
        <div className="icon-container">
            <img
                alt="info icon"
                src="../../../assets/info.svg"
                //height="20px"
                //width="20px"
            />
        </div>
        <div className="message-container">
            <p>{props.msg}</p>
        </div>
        <div className="btn-container">
            <div className="close-btn-container">
                <div className="close-btn" onClick={() => props.onClose()}>
                    <img
                        alt="close icon"
                        src="../../../assets/letter-x.svg"
                        height="15px"
                        width="15px"
                    />
                </div>
            </div>
            <div className="proceed-btn-container">
                {props.onProceed && (
                    <div
                        className="proceed-btn"
                        onClick={() => props.onProceed()}
                    >
                        <img
                            alt="proceed icon"
                            src="../../../assets/right-arrow.svg"
                            height="20px"
                            width="20px"
                        />
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default AlertContents;

AlertContents.propTypes = {
    msg: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};
