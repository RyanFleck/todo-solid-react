import React, { useState } from "react";
import "./App.css";

/* SOLID Stuff */
import {
  AuthButton,
  Value,
  LoggedIn,
  LoggedOut,
  useWebId,
  useLoggedIn,
} from "@solid/react";
import auth from "solid-auth-client";
import data from "@solid/query-ldflex";
import { AccessControlList } from "@inrupt/solid-react-components";
import { fetchDocument, createDocument } from "tripledoc";
import { solid, schema, foaf, space, rdf } from "rdf-namespaces";
import { typeIndex } from "rdf-namespaces/dist/solid";
import { checkSpecificAppPermission } from "./utils/permissions";
import {
  getAppStorage,
  createInitialFiles,
  storageHelper,
} from "./utils/storage";
import { createDoc, resourceExists, fetchLdflexDocument } from "./utils/ldflex-helper";

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

const testData = JSON.stringify(
  {
    paramOne: "This stores the first parameter",
    paramTwo: "This is the second of three parameters",
    paramThree: 3,
  },
  null,
  2
);

const testDoc = JSON.stringify(
  {
    paramOne: "This stores the first parameter",
    paramTwo: "This is the second of three parameters",
    paramThree: 3,
  },
  null,
  2
);

/* Functions */

async function buttonInitDocument() {
  console.log("button => Initializing document...");
  const session = await auth.currentSession();
  const webId = session.webId;
  if (session && webId) {
    // The path to this storage is stored in constants.js
    const storage = await getAppStorage(webId);
    const dataFilePath = `${storage}/data.json`;
    const settingsFilePath = `${storage}/settings.json`;

    const docFolderExists = await resourceExists(storage);
    const dataFileExists = await resourceExists(dataFilePath);
    const settingsFileExists = await resourceExists(settingsFilePath);


    const hasWritePermission = await checkSpecificAppPermission(
      webId,
      AccessControlList.MODES.WRITE
    );
    console.log(`Storage is at ${storage}`);
    console.log("Creating initial files...");
    if (!hasWritePermission) {
      console.log("No write permissions detected.");
      return;
    }
    console.log("Write permissions granted...");

    console.log("Initializing document folder...");
    
    // https://vocab.org/open/#json "application/json"
    if (!docFolderExists) {
      console.log("Document folder doesn't exist, creating...");
      await createDoc(data, {
        method: "PUT",
        headers: {
          "Content-Type": "text/turtle",
        },
      });
    } else {
      console.log("Document folder is already present on POD filesystem.");
    }

    // Check if data file exists, if not then create it. This file holds links to other people's games
    if (!dataFileExists) {
      console.log("Creating data file...");
      const data = await createDocument(dataFilePath);
      await data.save();
    } else {
      console.log("Data file already exists.");
    }

    // Check if the settings file exists, if not then create it. This file is for general settings including the link to the game-specific inbox
    if (!settingsFileExists) {
      console.log("Creating settings file...");
      const settings = await createDocument(settingsFilePath);
      await settings.save()
    } else {
      console.log("Settings file already exists.");
    }

    if(!(docFolderExists&&dataFileExists&&settingsFileExists)){
      console.log("NEW DOCUMENTS WERE CREATED.");
    }

    console.log("Documents have been instantiated.");
  }
}



async function buttonSaveDocument() {
  console.log("button => Saving document...");
  const session = await auth.currentSession();
  const webId = session.webId;
  if (session && webId) {
    // The path to this storage is stored in constants.js
    const storage = await getAppStorage(webId);
    const dataFilePath = `${storage}/data.json`;
    const settingsFilePath = `${storage}/settings.json`;

    const docFolderExists = await resourceExists(storage);
    const dataFileExists = await resourceExists(dataFilePath);
    const settingsFileExists = await resourceExists(settingsFilePath);

    if(!(docFolderExists&&dataFileExists&&settingsFileExists)){
      console.log("Documents not found in POD. Creating...");
      await buttonInitDocument();
    }

    console.log("Saving data and settings...");

    const dataDoc = await fetchLdflexDocument(dataFilePath);
    const settingsDoc = await fetchLdflexDocument(settingsFilePath);


    console.log("Data Document:")
    console.log(dataDoc);

    

  }
}



async function buttonLoadDocument() {
  console.log("button => Loading document...");
}



async function buttonDeleteDocument() {
  console.log("button => Deleting document...");
}



async function buttonPurgeAllDocuments() {
  console.log("button => Purging all documents...");
  const session = await auth.currentSession();
  if (session) {
    // Get profile
    const webId = session.webId;
    const webIdDoc = await fetchDocument(webId);
    const profile = webIdDoc.getSubject(webId);

    // Get private index document
    const privateIndexRef = profile.getRef(solid.privateTypeIndex);
    const privateIndex = await fetchDocument(privateIndexRef);

    // Grab ToDo Document subjects.
    const storage = profile.getRef(space.storage);
    const todoFilePath = `${storage}private/tasks/todo.ttl`;
    const todosDocument = await fetchDocument(todoFilePath);
    const todosDocumentItems = todosDocument.findSubjects();

    for (let i = 0; i < todosDocumentItems.length; i++) {
      const text = await todosDocumentItems[i];
      console.log(text);
    }
    await todosDocument.save();
  } else {
    return null;
  }
}

async function buttonDisplayDocuments() {
  console.log("button => Displaying documents...");
  const session = await auth.currentSession();
  if (session) {
    // Get profile
    const webId = session.webId;
    const webIdDoc = await fetchDocument(webId);
    const profile = webIdDoc.getSubject(webId);

    // Get private index document
    const privateIndexRef = profile.getRef(solid.privateTypeIndex);
    const privateIndex = await fetchDocument(privateIndexRef);

    // Grab ToDo Document subjects.
    const storage = profile.getRef(space.storage);
    const todoFilePath = `${storage}private/tasks/todo.ttl`;
    const todosDocument = await fetchDocument(todoFilePath);
    const todosDocumentItems = todosDocument.findSubjects();

    for (let i = 0; i < todosDocumentItems.length; i++) {
      const item = todosDocumentItems[i];
      const itemRef = item.asRef();
      console.log(`Item ${i} => ${item.getString()}`);
    }
    await todosDocument.save();
  } else {
    return null;
  }
}

async function checkForTasksThenLoadIfPresent() {
  const showAllRefs = true;

  const session = await auth.currentSession();
  if (session) {
    const webId = session.webId;
    console.log(`[TEST] => Using WebID ${webId} to fetch profile.`);
    const webIdDoc = await fetchDocument(webId);
    const profile = webIdDoc.getSubject(webId);
    console.log(`[TEST] GOT PROFILE: ${profile.getString(foaf.name)}`);

    /* We need to check for/create "private/tasks/todo.ttl#todo" and "...#done"
     */
    if (showAllRefs) {
      const allRefs = profile.getAllRefs();
      for (const r of allRefs) {
        console.log(`Ref => ${r}`);
      }
    }

    // Get a reference to the private document of the user.
    const privateIndexRef = profile.getRef(solid.privateTypeIndex);

    console.log(`Private index reference points to: ${privateIndexRef}`);
    const privateIndex = await fetchDocument(privateIndexRef);

    const storage = profile.getRef(space.storage);
    console.log(`Storage reference => ${storage}`); // https://rcf.solid.community/

    // Get TODO file from private index.
    const todoFile = privateIndex.findSubject(
      solid.forClass,
      schema.TextDigitalDocument
    );
    console.log("TODO FILE:");
    console.log(todoFile);

    if (todoFile === null) {
      /* CREATE AND SAVE A NEW DOCUMENT OF TYPE TODO */
      const todoFilePath = `${storage}private/tasks/todo.ttl`;
      const todoList = createDocument(todoFilePath);
      await todoList.save(); // CONFIRMED does actually save doc.

      const typeRegistration = privateIndex.addSubject();
      typeRegistration.addRef(rdf.type, solid.TypeRegistration);
      typeRegistration.addRef(solid.instance, todoList.asRef());
      typeRegistration.addRef(solid.forClass, schema.TextDigitalDocument);
      await privateIndex.save([typeRegistration]);

      console.log("Allegedly saved document...");
    } else {
      const todoFileRef = todoFile.getRef(solid.instance); // Might be null
      console.log(`TodoFileRef => ${todoFileRef}`);
      const todoFileDoc = await fetchDocument(todoFileRef);
      console.log("GOT TODO FILE DOC");
      console.log(todoFileDoc);

      // Add stuff to the document.
      const newTodoObject = todoFileDoc.addSubject();
      newTodoObject.addRef(rdf.type, schema.TextDigitalDocument);
      newTodoObject.addString(schema.text, JSON.stringify(fakeData));
      newTodoObject.addDateTime(schema.dateCreated, new Date(Date.now()));

      // Save new TODO file.

      //const success = await todoFileDoc.save([newTodoObject]);
      //console.log(`Saved file to POD? => ${success !== null ? true : false}`);

      const subjects = await todoFileDoc.findSubjects();
      console.log(`SUBJECTS FOUND: ${subjects.length}`);
      for (const s of subjects) {
        console.log(`Subject found => ${s.toString()}`);
      }
    }
  } else {
    return null;
  }
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
    //authedGetUsername();
    checkForTasksThenLoadIfPresent();
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
        <br /> <br />
        <div>
          Profile for debugging:{" "}
          <a href={"https://ryanfleck.solid.community/profile/card#me"}>
            ryanfleck.solid.community/profile/card#me
          </a>
        </div>
        <WebID />
        <br />
        <h4>Debugging Buttons</h4>
        <div>
          <button onClick={buttonInitDocument}>Init Document</button>{" "}
          <button onClick={buttonSaveDocument}>Save Document</button>{" "}
          <button onClick={buttonLoadDocument}>Load Document</button>{" "}
          <button onClick={buttonDeleteDocument}>Delete Document</button>
        </div>
        <br />
        <div>
          <button onClick={buttonPurgeAllDocuments}>
            Purge All TODO Documents
          </button>{" "}
          <button onClick={buttonDisplayDocuments}>
            Display TODO Documents in POD
          </button>
        </div>
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
