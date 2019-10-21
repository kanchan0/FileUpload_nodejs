const express       = require('express');
const path          = require('path')
const app           = express()
const multer        = require('multer')           //is used for muti-part form
const mysql         = require('mysql')
const bodyParser    = require("body-parser");
const bluebird      = require("bluebird");        //used to promisify the functions of mysql
const keys          = require("./config/keys")
  
const DIR = './uploads';

var connection = mysql.createConnection({
  host     : keys.host,
  user     : keys.user,
  password : keys.password,
  database : keys.database,
});
 
connection.connect();
bluebird.promisifyAll(connection) 
global.db = connection;
 
let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, DIR);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

let upload = multer({storage: storage});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/upload',upload.single('file') ,function (req, res) {
   
          var message = "Error! in image upload."
          if (!req.file) {
                console.log("No file received");
                message = "Error! in image upload."
                res.send({message: message, status:'danger'});
        } else{
              
            console.log('file received');
            var sql = `INSERT INTO file_uploads (name, type,size) VALUES ('${req.file.filename}','${req.file.mimetype}',${req.file.size});`;
       
            db.queryAsync(sql)
            .then(()=>{console.log("data file inserted")})
            .catch(err=>err)
              
            message = "Successfully! uploaded";
            res.send({message: message, status:'success'});
       
            }
      });


app.post('/multipleupload', upload.array('photos', 12),(req, res) => {

    var message = "Error! in image upload.";

    if (!req.files) {
          console.log("No file received");
          message = "Error! in image upload."
          res.send({message: message, status:'danger'});
    
    } else{

        for (let i=0;i<req.files.length;i++){
            
            var sql = `INSERT INTO file_uploads (name, type,size) VALUES ('${req.files[i].filename}','${req.files[i].mimetype}',${req.files[i].size});`;

            db.queryAsync(sql)
            .then(()=>{
                console.log("file No."+" "+i+" "+'received')
                console.log("successfully inserted file no"+" "+i);
            })
            .catch(err=>err)
        } 

        message = "Successfully! uploaded";
        res.send({message: message, status:'success'});
      }
});

const PORT = 8800;
 app.listen(PORT, function () {
  console.log('server is running on port ' + PORT);
});
