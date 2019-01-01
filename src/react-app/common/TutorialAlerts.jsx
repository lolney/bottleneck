import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-alert';
import { Component, Fragment } from 'react';
import { withAlert } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

const NewAlertTemplate = (props) => (
    <AlertTemplate {...props} style={{ ...props.style, ...style }} />
);

export const alertOptions = {
    timeout: 0,
    position: 'bottom center'
};

const style = {
    font: '0.75em lato,sans-serif'
};

export default NewAlertTemplate;
