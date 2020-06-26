import data from "@solid/query-ldflex";
import { AccessControlList } from "@inrupt/solid-react-components";
import { resourceExists, createDoc, createDocument } from "./ldflex-helper";
import { storageHelper, permissionHelper } from "../utils";
import { solidDataPath } from "../constants";

const appPath = solidDataPath;

/**
 * Creates a valid string that represents the application path. This is the
 * default value if no storage predicate is discovered
 * @param webId
 * @param path
 * @returns {*}
 */
export const buildPathFromWebId = (webId, path) => {
  console.log(`exec => buildPathFromWebId( webId: ${webId}, path: ${path});`);
  if (!webId) return false;
  const domain = new URL(typeof webId === "object" ? webId.webId : webId)
    .origin;
  return `${domain}/${path}`;
};

/**
 * Helper function to check for the user's pod storage value. If it doesn't exist, we assume root of the pod
 * @returns {Promise<string>}
 */
export const getAppStorage = async (webId) => {
  console.log(`exec => getAppStorage( webId: ${webId} );`);
  const podStoragePath = await data[webId].storage;
  let podStoragePathValue =
    podStoragePath && podStoragePath.value.trim().length > 0
      ? podStoragePath.value
      : "";

  // Make sure that the path ends in a / so it is recognized as a folder path
  if (podStoragePathValue && !podStoragePathValue.endsWith("/")) {
    podStoragePathValue = `${podStoragePathValue}/`;
  }

  // If there is no storage value from the pod, use webId as the backup, and append the application path from env
  if (!podStoragePathValue || podStoragePathValue.trim().length === 0) {
    return buildPathFromWebId(webId, appPath);
  }

  return `${podStoragePathValue}${appPath}`;
};

/**
 *  Check and create the initial app files and folders
 * @param folderPath
 * @returns {Promise<boolean>} Returns whether or not there were any errors during the creation process
 */
export const createInitialFiles = async (webId) => {
  console.log(`exec => createInitialFiles( webId: ${webId} );`);
  try {
    // First, check if we have WRITE permission for the app
    const hasWritePermission = await permissionHelper.checkSpecificAppPermission(
      webId,
      AccessControlList.MODES.WRITE
    );

    // If we do not have Write permission, there's nothing we can do here
    if (!hasWritePermission) return;

    // Get the default app storage location from the user's pod and append our path to it
    const documentUrl = await storageHelper.getAppStorage(webId);

    // Set up various paths relative to the game URL
    const dataFilePath = `${documentUrl}/data.ttl`;
    const settingsFilePath = `${documentUrl}/settings.ttl`;

    // Check if the tictactoe folder exists, if not then create it. This is where game files, the game inbox, and settings files are created by default
    const docFolderExists = await resourceExists(documentUrl);
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
      console.log("Document folder is already present on filesystem.");
    }

    // Check if data file exists, if not then create it. This file holds links to other people's games
    const dataFileExists = await resourceExists(dataFilePath);
    if (!dataFileExists) {
      console.log("Creating data file...");
      await createDocument(dataFilePath);
    } else {
      console.log("Data file already exists.");
    }

    // Check if the settings file exists, if not then create it. This file is for general settings including the link to the game-specific inbox
    const settingsFileExists = await resourceExists(settingsFilePath);
    if (!settingsFileExists) {
      console.log("Creating settings file...");
      await createDocument(settingsFilePath);
    } else {
      console.log("Settings file already exists.");
    }

    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};
