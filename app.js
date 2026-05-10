import express from "express";
import {dirname} from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fs from "fs";
import pg from "pg";


const db = new pg.Pool({
    user: "myuser",
    host: "localhost",
    database: "Notes",
    password: "1234", 
    port: 5432,
});
db.connect();


db.query("SELECT * FROM paragraph;",(err,res) =>{
    if(err){
        console.error("Error",err);
    }else{
        let quiz = res.rows;
        //console.log(res.rows[0]);
    }
})




const result = await db.query("SELECT * FROM notes;");
let databaseOut = result.rows;
//console.log(databaseOut);
    

//console.log(jsonfile[1]["Paragraphs"][1]["text"]);

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

app.get("/",async(req,res)=>{
    let sult3 = await db.query("SELECT * FROM notes;");
    databaseOut = sult3.rows;
    res.render("index.ejs",{titels:databaseOut})
});

app.get("/note",async(req,res)=>{
    let paragraph = [];
    const par = await db.query("SELECT * FROM paragraph WHERE note_id = 1;");
    const bod = await db.query("SELECT * FROM notes WHERE note_id = 1;");
    //console.log(par.rows);
    //console.log(bod.rows[0]["title"]);
    res.render("note.ejs",{titels:databaseOut,array:bod.rows[0],paragraph:par.rows})
});

app.get("/CNote",(req,res)=>{
    res.render("crNote.ejs",{titels:databaseOut})
});

app.get("/contact",(req,res)=>{
    
    res.render("contect.ejs",{titels:databaseOut})
});

app.get("/note/:id",async(req,res) =>{
    let num = req.params.id ;
    let paragraph = [];
    const par = await db.query("SELECT * FROM paragraph WHERE note_id = $1;",[num]);
    const bod = await db.query("SELECT * FROM notes WHERE note_id = $1 ;",[num]);
    
    console.log(par.rows[1]["code"].length);
    //console.log(bod.rows);
    res.render("note.ejs",{titels:databaseOut,array:bod.rows[0],paragraph:par.rows})
})

app.post("/submit",async(req,res)=>{
    console.log(req.body);

    if(req.body["button"] == 'Start'){
        await db.query("INSERT INTO notes (user_id, author, title, date, file_location, tag) VALUES (1, $1, $2,$3 ,$4,$5)",[req.body["Name"],req.body["Title"],req.body["Date"],"images/"+req.body["File"],req.body["Name"]]);
        res.render("paragraph.ejs",{titels:databaseOut});
    }else if(req.body["button"] == 'ADD paragraph') {
        const result1 = await db.query(
        "SELECT * FROM notes ORDER BY note_id DESC LIMIT 1"
        );
        console.log(result1.rows[0]['note_id']);
        
        await db.query("INSERT INTO paragraph (note_id, text,code, picture) VALUES ($1, $2, $3,$4)",[result1.rows[0]['note_id'],req.body["Text"],req.body["Code"],"images/"+req.body["img"]]);
        res.render("paragraph.ejs",{titels:databaseOut});
    }else{
        const result1 = await db.query(
        "SELECT * FROM notes ORDER BY note_id DESC LIMIT 1"
        );
        console.log(result1.rows[0]['note_id']);
        await db.query("INSERT INTO paragraph (note_id, text,code, picture) VALUES ($1, $2, $3,$4)",[result1.rows[0]['note_id'],req.body["Text"],req.body["Code"],"images/"+req.body["img"]]);
        res.redirect("/");
    }
    
});


app.listen(3000,()=>{
    console.log("Server running on port 3000");
});


