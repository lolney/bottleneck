import React from 'react';
import {
    DropdownButton,
    ButtonToolbar,
    MenuItem,
    Button
} from 'react-bootstrap';
import './CSS/Solutions.scss';
import { Grid } from './Grid.jsx';
import { Problem } from './Grid.jsx';
//import "bootstrap/dist/css/bootstrap.css";

export default class SolutionHistory extends React.Component {
    render() {
        return (
            <div className="solutions">
                <div className="fieldset">
                    <h1>Solution History</h1>
                    <input
                        type="search"
                        id="solutionSearch"
                        placeholder="Search for solutions.."
                    />
                </div>
                <div className="searchResults">
                    <div className="sidebar">
                        <div className="bootstrap-styles">
                            <ButtonToolbar>
                                <Button>
                                    <div className="column">
                                        <img
                                            src="assets/if_tree-1.png"
                                            alt="tree icon"
                                            height="50"
                                            width="50"
                                        />
                                    </div>
                                    <h2 class="column">Binary Trees</h2>
                                </Button>
                                <Button>
                                    <div className="column">
                                        <img
                                            src="assets/image-icon.png"
                                            alt="image icon"
                                            height="50"
                                            width="50"
                                        />
                                    </div>
                                    <h2 class="column">Image Problems</h2>
                                </Button>
                                <Button />
                                <Button />
                            </ButtonToolbar>
                        </div>
                    </div>

                    <div className="solutions-container bootstrap-styles">
                        <Problem
                            problems={[
                                { name: 'Category?' },
                                { name: 'Subcategory 1' },
                                { name: 'Subcategory 2' },
                                { name: 'Subcategory 3' }
                            ]}
                        />

                        <Grid
                            problems={[{ name: 'hello' }, { name: 'goodbye' }]}
                        />
                    </div>

                    <p className="instructions" />
                </div>
            </div>
        );
    }
}
