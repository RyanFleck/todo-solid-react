import { fetchDocument, createDocument } from "tripledoc";
import { solid, schema, foaf, space, rdf } from "rdf-namespaces";

const webId = "https://ryanfleck.solid.community/profile/card#me";

export async function init(id) {
  console.log("Initializing SOLID connection.");
  const name = await getName(id || webId);
  console.log(`Hello, ${name}`);

  /*
  const docs = await getDocs(id || webId);
  console.log(`Got a docList:`);
  console.log(docs);

  const notes = await docs.getAllSubjectsOfType(schema.TextDigitalDocument);
  console.log("Notes in list:");
  console.log(notes);

  if (notes !== null && notes.length > 0) {
    const editNote = notes[0];
    editNote.addString(schema.text, "Added another line to the note!");
    const success = docs.save([editNote]);
    console.log(success);
  } else {
    const addDocSuccess = await addNote("Hello world!", docs);
    console.log(`Success? => ${addDocSuccess !== null ? true : false}`);
    console.log(addDocSuccess);
  }
*/
  const json = await setAndGrabJSON(id || webId);
  console.log(json);
}

async function setAndGrabJSON(webId) {
  console.log("Getting todo JSON from SOLID");
  const webIdDoc = await fetchDocument(webId);
  const profile = webIdDoc.getSubject(webId);

  const privateStuffRef = profile.getRef(solid.privateTypeIndex);
  const privateStuff = await fetchDocument(privateStuffRef);
  const privateTextDocs = privateStuff.findSubjects(
    solid.forClass,
    schema.TextDigitalDocument
  );

  if (privateTextDocs.length > 0) {
    console.log("Got docs:");
    console.log(privateTextDocs);
  } else {
    console.log("No docs returned, adding a ToDo document...");
  }

  return null;
}

export async function getName(webId) {
  const webIdDoc = await fetchDocument(webId);
  const profile = webIdDoc.getSubject(webId);
  return profile.getString(foaf.name);
}

export async function getDocs(webId) {
  const webIdDoc = await fetchDocument(webId);
  const profile = webIdDoc.getSubject(webId);

  /* 1. Check if a Document tracking our notes already exists. */
  const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
  const publicTypeIndex = await fetchDocument(publicTypeIndexRef);
  const notesListEntry = publicTypeIndex.findSubject(
    solid.forClass,
    schema.TextDigitalDocument
  );

  /* 2. If it doesn't exist, create it. */
  if (notesListEntry === null) {
    // We will define this function later:
    console.log("Document null, creating new document...");
    return initialiseNotesList(profile, publicTypeIndex);
  }

  /* 3. If it does exist, fetch that Document. */
  const notesListRef = notesListEntry.getRef(solid.instance);
  return await fetchDocument(notesListRef);
}

async function initialiseNotesList(profile, typeIndex) {
  // Get the root URL of the user's Pod:
  const storage = profile.getRef(space.storage);

  // Decide at what URL within the user's Pod the new Document should be stored:
  const notesListRef = storage + "public/notes.ttl";
  // Create the new Document:
  const notesList = createDocument(notesListRef);
  await notesList.save();

  // Store a reference to that Document in the public Type Index for `schema:TextDigitalDocument`:
  const typeRegistration = typeIndex.addSubject();
  typeRegistration.addRef(rdf.type, solid.TypeRegistration);
  typeRegistration.addRef(solid.instance, notesList.asRef());
  typeRegistration.addRef(solid.forClass, schema.TextDigitalDocument);
  await typeIndex.save([typeRegistration]);

  // And finally, return our newly created (currently empty) notes Document:
  return notesList;
}

async function addNote(note, notesList) {
  // Initialise the new Subject:
  const newNote = notesList.addSubject();

  // Indicate that the Subject is a schema:TextDigitalDocument:
  newNote.addRef(rdf.type, schema.TextDigitalDocument);

  // Set the Subject's `schema:text` to the actual note contents:
  newNote.addString(schema.text, note);

  // Store the date the note was created (i.e. now):
  newNote.addDateTime(schema.dateCreated, new Date(Date.now()));

  const success = await notesList.save([newNote]);
  return success;
}
