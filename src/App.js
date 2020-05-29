import React from "react";
import logo from "./logo.svg";
import "./App.css";

const fakeData = [
  {
    text: "plant thyme",
    done: false,
  },
  {
    text: "lookup watering instructions for lavender",
    done: false,
  },
  {
    text: "cut and replant mint",
    done: false,
  },
  {
    text: "buy thyme",
    done: true,
  },
];

function App() {
  return (
    <div className="App">
      {/* TODO section of the app. */}
      <h1>ToDo</h1>
      {fakeData.map((elem, key) =>
        !elem.done ? (
          <CheckListItem key={key} text={elem.text} done={false} />
        ) : null
      )}

      {/* DONE section of the app. */}
      <h1>Done</h1>
      {fakeData.map((elem, key) =>
        elem.done ? (
          <CheckListItem key={key} text={elem.text} done={true} />
        ) : null
      )}
    </div>
  );
}

function CheckListItem(props) {
  return (
    <div className={"todo-item"}>
      <label className="todo-item-text">
        <label className={"todo-item-label"}>
          <input type={"checkbox"} defaultChecked={props.done}></input>
          <span className="pseudo-checkbox"></span>
        </label>
        {props.text}
      </label>
    </div>
  );
}

export default App;
