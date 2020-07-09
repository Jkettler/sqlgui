import Button from "react-bootstrap/Button";
import React from "react";

// https://stackoverflow.com/questions/19053181/how-to-remove-focus-around-buttons-on-click#answer-30119360
// For no other reason other besides I think the big focus outline around buttons looks awful (OSX/chrome)
const NoFocusButton = (props) => {
  const unFocus = (e) => {
    e.target.blur();
  };

  return (
    <Button {...props} onMouseUp={unFocus}>
      {props.children}
    </Button>
  );
};

export default NoFocusButton;
