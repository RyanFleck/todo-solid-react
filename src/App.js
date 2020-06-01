import React from "react";
import "./App.css";
import { AuthButton, Value, LoggedIn, LoggedOut, List } from "@solid/react";

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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todo: fakeData.slice(),
    };

    this.handleCheckedChange = this.handleCheckedChange.bind(this);
  }

  handleCheckedChange(text) {
    this.state.todo.forEach((item, index) => {
      if (item.text === text) {
        const todo = this.state.todo.slice();
        todo[index].done = !todo[index].done;
        this.setState({ todo: todo });
      }
    });
  }

  handleTextChange(oldText, newText) {}

  render() {
    return (
      <div className="App">
        {/* SOLID section of the app. */}
        <AuthButton popup="popup.html" login="Login " logout="Log Out" />
        <LoggedIn>
          <h3>
            Hello, <Value src="user.name" />
          </h3>
        </LoggedIn>
        <LoggedOut>
          <h3>Please Log In to save your todo list.</h3>
        </LoggedOut>
        {/* TODO section of the app. */}
        <h1>ToDo</h1>
        {this.state.todo.map((elem, key) =>
          !elem.done ? (
            <CheckListItem
              key={key}
              text={elem.text}
              done={false}
              changef={this.handleCheckedChange}
            />
          ) : null
        )}
        {/* DONE section of the app. */}
        <h1>Done</h1>
        {this.state.todo.map((elem, key) =>
          elem.done ? (
            <CheckListItem
              key={key}
              text={elem.text}
              done={true}
              changef={this.handleCheckedChange}
            />
          ) : null
        )}
        <br /> <br />
        Profile for debugging:{" "}
        <a href={"https://ryanfleck.solid.community/profile/card#me"}>
          ryanfleck.solid.community/profile/card#me
        </a>
      </div>
    );
  }
}

class CheckListItem extends React.Component {
  render() {
    return (
      <div className={"todo-item"}>
        <label className="todo-item-text">
          <label className={"todo-item-label"}>
            <input
              type={"checkbox"}
              defaultChecked={this.props.done}
              onChange={() => this.props.changef(this.props.text)}
            ></input>
            <span className="pseudo-checkbox"></span>
          </label>
          {this.props.text}
          <button className={"pencil"}>✎</button>
        </label>
      </div>
    );
  }
}

export default App;
