const express = require('express');
const path = require('path');
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
const util = require('util');


const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// get route to notes page
app.get('/notes', (req, res) => 
  res.sendFile(path.join(__dirname, './public/notes.html'))
);
// promise readfile
const readFromFile = util.promisify(fs.readFile);

//app.get that will read the object located in the db.json
//the data from db.json is then sent back as a response to the user 
app.get('/api/notes', (req,res) => {
  //readFromFile targets the location './db/db.json'
  readFromFile('./db/db.json').then((data) =>
  res.json(JSON.parse(data)));
});
/**
 * function wf, uses fs to writefile when a location and data are given
 * @param {string} location 
 * @param {object} data 
 */
const wf = (location, data) => {
  fs.writeFile(location, JSON.stringify(data, null, 4), (err) =>{
      if(err){
          console.error(err)
      }else {
          console.ingo(`file written ${location}`)
      }
  })
}

app.listen(PORT, () =>
    console.log(`http://localhost:${PORT}`)
);