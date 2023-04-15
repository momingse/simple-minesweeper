import { render } from "@testing-library/react";
import React from "react";
import { useRef, useEffect } from "react";

const Cell = (props) => {
  const getValue = () => {
    if (!props.value.isRevealed) {
      return props.value.isFlaged ? "🚩" : null;
    }

    if (props.value.isMine) {
      return "💣";
    }
    if (props.value.neighbour === 0) {
      return null;
    }
    return props.value.neighbour;
  };
//   console.log("render")

  return (
    <div
      onClick={props.onClick}
      className={"cell"}
      onContextMenu={props.cMenu}
      style={{
        backgroundColor: props.value.isRevealed ? "lightgrey" : "grey",
      }}
    >
      {getValue()}
    </div>
  );
};

export default Cell;
