var express = require("express");
var watson = require("watson-developer-cloud");
var getusermedia = require("get-user-media-promise");
var ConversationV1 = require("watson-developer-cloud/conversation/v1");
var texttospeech = require("watson-developer-cloud/text-to-speech/v1");
var config = require("./config.json");
var fs = require("fs");
var http = require("http");

//Variables Declaration 
var app = express();
var PORT = process.env.PORT || 3000;
var context = {};

app.set("view engine","ejs");

//Watson Speech to Text Credentials 
var authorization = new watson.AuthorizationV1({
    username:"39186ac3-0504-4e43-a78c-efd260e6f0e0",
    password : "WaTgQErJ8Kco",
    url : "https://stream.watsonplatform.net/speech-to-text/api"
})

//Watson Conversation Servce Credentials 
var conversation = new ConversationV1({
    username : config.watson_conversation.username,
    password : config.watson_conversation.password,
    version_date : ConversationV1.VERSION_DATE_2017_04_21    
});

//Watson Text to Speech service credentials 
var text_to_speech = new texttospeech({
    username : config.watson_text_to_speech.username,
    password : config.watson_text_to_speech.password
});

//Parameters for the Text to Speech service 
var params = {
    text : "Hello welcome to IBM",
    voice: "en-US_LisaVoice",
    accept: "audio/wav"
} ;

function httpgetrequest (){
    http.get("http://echo.jsontest.com/location/D314-lab1/RFID/raspberry_pi",function(res){
        res.on("data",function(data){
            rawdata += data;
        })
        res.on("end",function(){

        })
    })
} 

//Get request : https:localhost:3000
app.get("/",function(req,res){
    //URL : http://localhost:3000/?email=gshiva5&password=shiva123 , Getting query string parameters (req.query.email)   
    //Sending the message to the browser. 
   var rawdata = "";
   console.log("Get function")
   http.get(config.CloudantNosql.url,function(r){
        r.on("data",function(d){
            rawdata += d;
        })
        r.on("end",function(){
            //console.log(rawdata);
            //var jsonrawdata = JSON.parse(rawdata);
            //context.location = jsonrawdata.location;
            //context.location = "D314";
            //console.log(jsonrawdata);
           //console.log(chemical_location(jsonrawdata,"Amino Acid"));
            //res.send("Count :"+jsonrawdata.rows[0].key);
            
        })
   })

   context.location = "D314";
   conversationmessage(req,res,context);

})

//Calling Watson Conversation message
function conversationmessage(req,res,location){
    conversation.message({
        input : {text : req.query.input_text},
        workspace_id : config.watson_conversation.workspace_id,
        version_date : conversation.VERSION_DATE_2017_04_21,
        context : location        
    },function(err,response){
        if(err){
            console.log(err);
        } else {            
            context = response.context;
            //res.send(response);
            console.log(response);
            console.log("---------------------------------------")
            //params.text = response.output.text[0]
            //playaudio(res);
        }
    })
}

//play audio in the browser 
function playaudio (res){
    text_to_speech.synthesize(params).on("error",function(err){
        console.log(err);
    }).pipe(res); 
}

//Getting the location state of the chemical 
function chemical_location(rawdata,chemical_name){
   var chemical_location = "";
    for(var i=0; i< rawdata.rows.length; i++){        
        if(rawdata.rows[i].key === chemical_name){
            chemical_location = rawdata.rows[i].value[1];
            break;
        }
    }
    return chemical_location;
}

//generating Auth token for Speech to Text service 
app.get("/token",function(req,res){
    authorization.getToken(function(err,token){
        if(err){
            console.log(err);
        } else {
            console.log(token);
            res.send(token); 
        }
    })
});



app.get("/index",function(req,res){
    res.render("index");
})

//Server start 
app.listen(PORT);

