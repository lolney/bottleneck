import React from 'react';
import { Button } from 'react-bootstrap';

export default class Matchmaking extends React.Component {
    render() {
        return (
            <div className="bootstrap-styles">
                <Button onClick={() => window.open('/?mode=practice')}>
                    Practice
                </Button>
                <Button onClick={() => window.open('/?mode=vs')}>VS</Button>
            </div>
        );
    }
}
