import React from "react";
import "./App.css";
import { AuthButton, Value, LoggedIn, LoggedOut } from "@solid/react";

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
    this.handleTextChange = this.handleTextChange.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
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

  handleTextChange(oldText, newText) {
    console.log(`Update from ${oldText} => ${newText}`);
    this.state.todo.forEach((item, index) => {
      if (item.text === oldText) {
        const todo = this.state.todo.slice();
        todo[index].text = newText;
        this.setState({ todo: todo });
      }
    });
  }

  deleteItem(text) {
    console.log(`DeleteItem ${text}`);
    this.state.todo.forEach((item, index) => {
      if (item.text === text) {
        const todo = this.state.todo.slice();
        todo.splice(index, 1);
        this.setState({ todo: todo });
      }
    });
  }

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
              changet={this.handleTextChange}
              delete={this.deleteItem}
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
              changet={this.handleTextChange}
              delete={this.deleteItem}
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
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
    };
    this.edit = this.edit.bind(this);
    this.updateWithNewValue = this.updateWithNewValue.bind(this);
  }

  edit() {
    this.setState({ editing: true });
  }

  updateWithNewValue(newText) {
    console.log(`Update with ${newText}`);
    this.setState({ editing: false });
    this.props.changet(this.props.text, newText);
  }

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
          {this.state.editing ? (
            <span>
              <TextEditor
                initialText={this.props.text}
                returnResult={this.updateWithNewValue}
              ></TextEditor>
            </span>
          ) : (
            <span>
              <span className={"todo-text"}>{this.props.text}</span>
              <button className={"pencil"} onClick={this.edit}>
                ✎
              </button>
              <button
                className={"delete"}
                onClick={() => this.props.delete(this.props.text)}
              >
                ×
              </button>
            </span>
          )}
        </label>
      </div>
    );
  }
}

class TextEditor extends React.Component {
  // props: initialText, returnResult(newText)

  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.processText = this.processText.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  processText(event) {
    event.preventDefault();
    const text = this.state.value;
    this.props.returnResult(text);
  }

  onChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <form onSubmit={this.processText} className={"checkTextBox"}>
        <input
          type={"text"}
          value={this.state.value || this.props.initialText}
          onChange={this.onChange}
        ></input>
        <input type={"submit"} value={"update"}></input>
      </form>
    );
  }
}

export default App;
