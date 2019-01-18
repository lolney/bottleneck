import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

var config = {
    apiKey: 'AIzaSyBHTQvW9D_vMDBm3g46jBjR5swmWeamkZc',
    authDomain: 'bottleneck.firebaseapp.com',
    databaseURL: 'https://bottleneck.firebaseio.com',
    projectId: 'bottleneck',
    storageBucket: 'bottleneck.appspot.com',
    messagingSenderId: '156062096822'
};
firebase.initializeApp(config);

export const AuthUserContext = React.createContext(null);

export default config;
