import React from "react";
import logo from "./logo.svg";
import "./App.css";

const fakeData = [
  "plant thyme",
  "lookup watering instructions for lavender",
  "cut and replant mint",
];

const fakeDataDone = [];

function App() {
  return (
    <div className="App">
      <h1>ToDo</h1>
      {fakeData.map((x, key) => (
        <div key={key} className={"todo-item"}>
          <label className="todo-item-text">
            <label className={"todo-item-label"}>
              <input type={"checkbox"}></input>
              <span className="pseudo-checkbox"></span>
            </label>
            {x}
          </label>
        </div>
      ))}
    </div>
  );
}

export default App;
