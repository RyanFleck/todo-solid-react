const { default: data } = require("@solid/query-ldflex");

const webId = "https://ryanfleck.solid.community/profile/card#me";
const docId = webId.replace("profile/card#me", "tasks/todo.ttl#todo");
const ryan = data[webId];

async function showProfile(person) {
  const label = await person.name;
  console.log(await person);
  console.log(`Name: ${label}`);
}

showProfile(ryan);
