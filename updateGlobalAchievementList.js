import "dotenv/config";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import fs from "node:fs";
import { parse } from "csv-parse";
import { addDoc, collection, getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const processFile = async () => {
  const records = [];
  const parser = fs
    .createReadStream(`${__dirname}/${process.env.CSV_FILE_NAME}`)
    .pipe(parse({}));
  for await (const record of parser) {
    records.push(record);
  }
  return records;
};

(async () => {
  const records = await processFile();

  try {
    const addDocPromises = [];
    for (const record of records) {
      addDocPromises.push(
        addDoc(collection(db, "achievements"), {
          category: record[0],
          group: record[1],
          level: record[2],
          name: record[3],
          description: record[5],
          nextLink: record[6],
          hidden: record[7],
          id: record[8],
          groupId: record[9],
          version: record[10],
        })
      );
    }
    await Promise.all(addDocPromises);
  } catch (e) {
    console.error("Database error: ", e);
  }
})();
