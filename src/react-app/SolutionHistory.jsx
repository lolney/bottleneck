import React from "react";
import { DropdownButton, ButtonToolbar, MenuItem } from "react-bootstrap";
import "./CSS/Solutions.scss";
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
            <div className="category">
              <div className="column">
                <img
                  src="assets/if_tree-1.png"
                  alt="tree icon"
                  height="50"
                  width="50"
                />
              </div>
              <h2 class="column">Binary Trees</h2>
            </div>
            <div className="category">
              <div className="column">
                <img
                  src="assets/image-icon.png"
                  alt="image icon"
                  height="50"
                  width="50"
                />
              </div>
              <h2 class="column">Image Problems</h2>
            </div>
            <div className="category" />
            <div className="category" />
          </div>
          <div className="bootstrap-styles">
            <ButtonToolbar>
              <DropdownButton
                bsStyle="default"
                bsSize="large"
                title="Large button"
                id="dropdown-size-large"
              >
                <MenuItem eventKey="1">Action</MenuItem>
                <MenuItem eventKey="2">Another action</MenuItem>
                <MenuItem eventKey="3">Something else here</MenuItem>
                <MenuItem divider />
                <MenuItem eventKey="4">Separated link</MenuItem>
              </DropdownButton>
            </ButtonToolbar>
          </div>

          <div className="results" />
          <p className="instructions" />
        </div>
      </div>
    );
  }
}
