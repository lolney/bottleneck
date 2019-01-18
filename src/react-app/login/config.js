import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

var config = {
    // Note: this is supposed to be public
    apiKey: 'AIzaSyBHTQvW9D_vMDBm3g46jBjR5swmWeamkZc',
    authDomain: 'auth.bottleneck.world',
    projectId: 'bottleneck',
    messagingSenderId: '156062096822'
};
firebase.initializeApp(config);

export const AuthUserContext = React.createContext(null);

export default config;
