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
          console.log(`file saved`)
      }
  })
}

app.post('/api/notes', (req,res) =>{
  const { title, text} = req.body;
  if (title && text) {
  //new object that will be saved to the db.json
  const note = {
  'title': title,
  'text': text,
  //generates a unique id
  'id': uuidv4()
  }
  //reads the content already present in the db.json object.
fs.readFile('./db/db.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    //joins the new note with the previous data in the db.json
    const parsedData = JSON.parse(data);
    parsedData.push(note);
    //writes the data to the db.json file
    wf('./db/db.json', parsedData);
  }
});
  // a response stating that the note has been saved
  const noteSaved = {
    status: 'saved',
    body: note,
  };
  
  res.json(noteSaved);
  }else {
    res.json('Error in posting note');
}
});

// route to delete notes by obtaining the id number.
app.delete('/api/notes/:id', (req, res) => {
  const  id  = req.params.id;
  readFromFile('./db/db.json').then((data) => JSON.parse(data))
  .then((data) => {
    var newDB = [];
    //iterate through the notes object
      for(i=0;i<data.length;i++){
        if(data[i].id !== id ){
          newDB.push(data[i]);
        }
      }
    const parse = newDB
    // write object to db.json, which no longer includes the removed note. 
    wf('./db/db.json', parse);
    res.json(`Deleted id: ${id}`);
}); 
});
// route to index.html
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () =>
    console.log(`http://localhost:${PORT}`)
);