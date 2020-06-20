import React, { useState } from "react";
import "./App.css";
import {
  AuthButton,
  Value,
  LoggedIn,
  LoggedOut,
  useWebId,
  useLDflex,
  useLoggedIn,
} from "@solid/react";
import auth from "solid-auth-client";
import data from "@solid/query-ldflex";

const textDefault = "New item";
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

/* Functions */

async function authedGetUsername() {
  const session = await auth.currentSession();
  if (session) {
    console.log(`Using WebID ${session.webId}`);
    const profile = data[session.webId];
    const name = await profile.name;
    console.log(`Authorized user is ${name}`);
    return name;
  }
}

function DocumentFetchStoreTest() {
  const [content, setContent] = useState({});
  const authed = useLoggedIn();
  console.log("[TEST] DocumentFetchStoreTest");
  if (authed) {
    console.log("User is logged in, using session...");
    auth.currentSession().then((session) => {
      const url = session.webId.replace(
        "profile/card#me",
        "tasks/todo.ttl#todo"
      );
      const todoPath = data[url];

      const tasks = ["test one", "test two", "testing number three"];

      for (const t of tasks) {
        todoPath["schema:itemListElement"].add(t.toString());
        console.log("Added to document...");
      }

      loadTasks(todoPath).then((tasks) => {
        console.log("GOT TASKS");
        console.log(tasks);
      });
    });
  }
  return null;
}

async function loadTasks(path) {
  const tasks = [];
  for await (const task of path.schema_itemListElement) {
    tasks.push(task.toString());
  }
  return tasks;
}

/* Components */

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todo: fakeData.slice(),
      authenticated: false,
    };

    this.handleCheckedChange = this.handleCheckedChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.addItem = this.addItem.bind(this);
  }

  componentDidMount() {
    //init(); // Init SOLID stuff.
    authedGetUsername();
  }

  addItem() {
    const todo = this.state.todo.slice();
    todo.push({ text: textDefault, done: false });
    this.setState({ todo: todo });
  }

  handleCheckedChange(text) {
    const todo = this.state.todo.slice();
    this.state.todo.some((item, index) => {
      if (item.text === text) {
        todo[index].done = !todo[index].done;
        this.setState({ todo: todo });
        return true;
      }
      return false;
    });
  }

  handleTextChange(oldText, newText) {
    console.log(`Update from ${oldText} => ${newText}`);
    const todo = this.state.todo.slice();
    this.state.todo.some((item, index) => {
      if (item.text === oldText) {
        todo[index].text = newText;
        this.setState({ todo: todo });
        return true;
      }
      return false;
    });
  }

  deleteItem(text) {
    console.log(`DeleteItem ${text}`);
    const todo = this.state.todo.slice();
    this.state.todo.some((item, index) => {
      if (item.text === text) {
        todo.splice(index, 1);
        this.setState({ todo: todo });
        return true;
      }
      return false;
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
          <h3>Please Log In to start your todo list.</h3>
        </LoggedOut>
        <DocumentFetchStoreTest />
        {/* TODO section of the app. */}
        <h1>
          <span>ToDo</span>
        </h1>
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
        <button id={"addItem"} onClick={this.addItem}>
          +
        </button>
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
        <div>
          Profile for debugging:{" "}
          <a href={"https://ryanfleck.solid.community/profile/card#me"}>
            ryanfleck.solid.community/profile/card#me
          </a>
        </div>
        <WebID />
      </div>
    );
  }
}

function WebID(props) {
  const webId = useWebId();
  return (
    <span>
      Your WebID is <a href={webId}>{webId}</a>
    </span>
  );
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
    if (newText !== "") {
      this.props.changet(this.props.text, newText);
    }
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
            <span className={"buttons"}>
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
          </span>
        )}
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
