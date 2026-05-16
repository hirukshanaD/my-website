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

app.get("/error",(req,res)=>{
    res.render("error.ejs",{titels:databaseOut,err:"Error Name"});
})

app.get("/note",async(req,res)=>{
    let paragraph = [];

    try{
        const result9 = await db.query(
        "SELECT * FROM notes ORDER BY note_id DESC LIMIT 1"
        );
        const par = await db.query("SELECT * FROM paragraph WHERE note_id = $1;",[result9]);
        const bod = await db.query("SELECT * FROM notes WHERE note_id = $1;",[result9]);
        res.render("note.ejs",{titels:databaseOut,array:bod.rows[0],paragraph:par.rows});
    }catch(error){
        console.log(error);
        res.render("error.ejs",{titels:databaseOut,err:error.message}); 

    }
    
    //console.log(par.rows);
    //console.log(bod.rows[0]["title"]);
   
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
    const result = await db.query("SELECT * FROM notes;");
    let databaseOut = result.rows;
    try{
        const par = await db.query("SELECT * FROM paragraph WHERE note_id = $1;",[num]);
        const bod = await db.query("SELECT * FROM notes WHERE note_id = $1 ;",[num]);
        res.render("note.ejs",{titels:databaseOut,array:bod.rows[0],paragraph:par.rows})
    }
    catch(error){
         console.log(error);
         res.render("error.ejs",{titels:databaseOut,err:error.message}); 

    }
    
    //console.log(par.rows[1]["code"].length);
    //console.log(bod.rows);
    
})

app.post("/submit",async(req,res)=>{
    console.log(req.body);

    if(req.body["button"] == 'Start'){
        

        try{
            await db.query("INSERT INTO notes (user_id, author, title, date, file_location, tag) VALUES (1, $1, $2,$3 ,$4,$5)",[req.body["Name"],req.body["Title"],req.body["Date"],"images/"+req.body["File"],req.body["Name"]]);
            res.render("paragraph.ejs",{titels:databaseOut});
        }catch(error){
            console.log(error);
            res.render("error.ejs",{titels:databaseOut,err:error.message}); 
        }

    }else if(req.body["button"] == 'ADD paragraph') {
        
        try{
            const result1 = await db.query(
                "SELECT * FROM notes ORDER BY note_id DESC LIMIT 1"
                );
            console.log(result1.rows[0]['note_id']);
        
            await db.query("INSERT INTO paragraph (note_id, text,code, picture) VALUES ($1, $2, $3,$4)",[result1.rows[0]['note_id'],req.body["Text"],req.body["Code"],"images/"+req.body["img"]]);
            res.render("paragraph.ejs",{titels:databaseOut});
        
        }catch(error){
            console.log(error);
            res.render("error.ejs",{titels:databaseOut,err:error.message}); 
        }
    
    }else{
        
        try{
            const result1 = await db.query(
            "SELECT * FROM notes ORDER BY note_id DESC LIMIT 1"
            );
            console.log(result1.rows[0]['note_id']);
            await db.query("INSERT INTO paragraph (note_id, text,code, picture) VALUES ($1, $2, $3,$4)",[result1.rows[0]['note_id'],req.body["Text"],req.body["Code"],"images/"+req.body["img"]]);
            res.redirect("/");
            
        }catch(error){
            console.log(error);
            res.render("error.ejs",{titels:databaseOut,err:error.message}); 
        }
    }
    
});

app.get("/delet/:id",async(req,res)=>{
    try{
        const Nid = req.params.id;
        console.log(Nid); 
        await db.query("DELETE FROM notes WHERE note_id = $1",[Nid]);
        res.redirect("/");

    }catch(error){
        console.log(error);
        res.render("error.ejs",{titels:databaseOut,err:error.message}); 
    }
});

app.get("/update/:id",async(req,res)=>{
    
    try{
        const num = req.params.id;
        let arrays = await db.query("SELECT * FROM notes WHERE note_id = $1;",[num]);
        let parg = await db.query("SELECT * FROM paragraph WHERE note_id = $1",[num]);
        //console.log(arrays.rows[0]);
        //console.log(parg.rows);  
        res.render("update.ejs",{titels:databaseOut,array:arrays.rows[0],paragraph:parg.rows}); 
        
    }catch(error){
        console.log(error);
        res.render("error.ejs",{titels:databaseOut,err:error.message}); 
    }

});

app.post("/patch",async(req,res)=>{
    try{
        if(req.body.save == 'SAVE'){
          console.log(req.body.Picture);
          await db.query("UPDATE notes SET author = $1 ,title = $2 , date = $3 , file_location = $4 WHERE note_id = $5 ",[req.body["Name"],req.body["Title"],req.body["Date"],req.body["File"],req.body["NO"]]);
          let i = 0;
          for(i = 0;i<req.body["PNO"].length;i++){
              const textValue = req.body["Text"] ? req.body["Text"][i] : null;
              const codeValue = req.body["CODE"] ? req.body["CODE"][i] : null;
              const pictureValue = req.body["Picture"] ? req.body["Picture"][i] : "";
              console.log(req.body["Picture"]);
              const paragraphId = req.body["PNO"][i];
              await db.query("UPDATE paragraph SET text = $1,code = $2, picture = $3 WHERE paragraph_id = $4",[textValue, codeValue, "images/"+pictureValue, paragraphId]);
          }
         
          res.redirect("/");
        
        }
    }catch(error){
            console.log(error);
            res.render("error.ejs",{titels:databaseOut,err:error.message}); 
        }
     if(req.body.button = 'ADD paragraph'){
            console.log(req.body.NO);
            res.render("paragraph2.ejs",{par:req.body["NO"],titels:databaseOut});

        }
});

app.post("/submitP",async(req,res)=>{
    
    try{
        await db.query("INSERT INTO paragraph (note_id, text,code, picture) VALUES ($1, $2, $3,$4)",[req.body["NO"],req.body["Text"],req.body["Code"],"images/"+req.body["img"]]);
        res.redirect("/");

    }catch(error){
            console.log(error);
            res.render("error.ejs",{titels:databaseOut,err:error.message}); 
        
    }
})

app.get("/login",(req,res)=>{
    res.render("logind.ejs");    
});

app.listen(3000,()=>{
    console.log("Server running on port 3000");
});


