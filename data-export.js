#! /usr/bin/env node

console.log('This data export is running!!!!');


const async = require('async')
const Actor = require('./models/Actor.js');
const Script = require('./models/Script.js');
const User = require('./models/User.js');
const _ = require('lodash');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs')
var UAParser = require('ua-parser-js');
const util = require('util');



var csvWriter = require('csv-write-stream');
var mlm_writer = csvWriter();
var s_writer = csvWriter();
var summary_writer = csvWriter();
//5bb3a93ad9fd14471bf3977d
//5bb3a93ad9fd14471bf39791
//5bb3a93ad9fd14471bf39792
//5bb3a93ad9fd14471bf397c8
var bully_messages = ["5bb3a93ad9fd14471bf3977d",
"5bb3a93ad9fd14471bf39791",
"5bb3a93ad9fd14471bf39792",
"5bb3a93ad9fd14471bf397c8"];
var bully_stats = [];
var sur_array = [];

Array.prototype.sum = function() {
    return this.reduce(function(a,b){return a+b;});
};



var mlm_array = [];

dotenv.load({ path: '.env' });

/*
var MongoClient = require('mongodb').MongoClient
 , assert = require('assert');


//var connection = mongo.connect('mongodb://127.0.0.1/test');
mongoose.connect(process.env.PRO_MONGODB_URI || process.env.PRO_MONGOLAB_URI);
var db = mongoose.connection;
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
}); */

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;

//mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
//mongoose.connect(process.env.MONGOLAB_TEST || process.env.PRO_MONGOLAB_URI, { useMongoClient: true });
mongoose.connect(process.env.MONGOLAB_TEST || process.env.PRO_MONGOLAB_URI, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});


User.find()
  .where('active').equals(false)
  .populate({ 
         path: 'feedAction.post',
         model: 'Script',
         populate: {
           path: 'actor',
           model: 'Actor'
         } 
      })
  .exec(    
    function(err, users){

      mlm_writer.pipe(fs.createWriteStream('results/mlm_eatsnaplove.csv'));
      s_writer.pipe(fs.createWriteStream('results/posts_eatsnaplove.csv'));
      summary_writer.pipe(fs.createWriteStream('results/sum_eatsnaplove.csv'));

      for (var i = users.length - 1; i >= 0; i--) 
      {

        var mlm = {};
        var sur = {};
        var sums = {};
        mlm.id = users[i].mturkID;
        sur.id = users[i].mturkID;
        sums.id = users[i].mturkID;


        mlm.email = users[i].email;
        sur.email = users[i].email;
        sums.email = users[i].email;

        mlm.StartDate = users[i].createdAt;
        sur.StartDate = users[i].createdAt;
        sums.StartDate = users[i].createdAt;

        console.log("In User "+ users[i].email);
        //console.log("In User Number "+ i);

        //UI - transparency script_type: String, //type of script they are running in
        //post_nudge: String,
        
        mlm.script_type = users[i].script_type;
        sums.script_type = users[i].script_type;

        //profile_perspective
        if (users[i].post_nudge == 'yes')
        {
          mlm.post_nudge = 1;
          sums.post_nudge = 1;
        }
        else
        {
          mlm.post_nudge = 0;
          sums.post_nudge = 0;
        }


        if (users[i].profile.name)
        {
          mlm.ProfileName = 1;
          sums.ProfileName = 1;
        }
        else
        {
          mlm.ProfileName = 0;
          sums.ProfileName = 0;
        }

        if (users[i].profile.location)
        {
          mlm.ProfileLocation = 1;
          sums.ProfileLocation = 1;
        }
        else
        {
          mlm.ProfileLocation = 0;
          sums.ProfileLocation = 0;
        }

        if (users[i].profile.bio)
        {
          mlm.ProfileBio = 1;
          sums.ProfileBio = 1;
        }
        else
        {
          mlm.ProfileBio = 0;
          sums.ProfileBio = 0;
        }

        if (users[i].profile.picture)
        {
          mlm.ProfilePicture = 1;
          sums.ProfilePicture = 1;
        }
        else
        {
          mlm.ProfilePicture = 0;
          sums.ProfilePicture = 0;
        }

        var parser = new UAParser();

        if(users[i].log[0])
        {

          if (parser.setUA(users[i].log[0].userAgent).getDevice().type)
          {
            mlm.Device = parser.setUA(users[i].log[0].userAgent).getDevice().type;
          }
          else
            mlm.Device = "Computer";
        

        
          //sur.Device = mlm.Device;

          mlm.Broswer = parser.setUA(users[i].log[0].userAgent).getBrowser().name;
          //sur.Broswer = mlm.Broswer;

          mlm.OS = parser.setUA(users[i].log[0].userAgent).getOS().name;
          //sur.OS = mlm.OS;
        }//if Log exists
        else{
          mlm.Device = "NA";
          mlm.Broswer = "NA";
          mlm.OS = "NA";
        }
        

        mlm.notificationpage = 0;
        mlm.generalpagevisit = 0;
        for(var z = 0; z < users[i].pageLog.length; ++z){
            if(users[i].pageLog[z].page == "Notifications")
              mlm.notificationpage++;
            else
              mlm.generalpagevisit++;
        }
        

        mlm.citevisits = users[i].log.length;
        sums.citevisits = users[i].log.length;

        if (users[i].completed)
        {
          mlm.CompletedStudy = 1;
          sums.CompletedStudy = 1;
          //sur.CompletedStudy = 1;
        }
        else
        {
          mlm.CompletedStudy = 0;
          sums.CompletedStudy = 0;
          //sur.CompletedStudy = 0;
        }

        if (users[i].study_days.length > 0)
        {
          mlm.DayOneVists = users[i].study_days[0];
          mlm.DayTwoVists = users[i].study_days[1];
          mlm.DayThreeVists = users[i].study_days[2];

          sums.DayOneVists = users[i].study_days[0];
          sums.DayTwoVists = users[i].study_days[1];
          sums.DayThreeVists = users[i].study_days[2];
        }

        //per feedAction
        mlm.GeneralLikeNumber = 0;
        mlm.GeneralFlagNumber = 0;

        sur.postID = -1;
        sur.body = "";
        sur.picture = "";
        sur.absTime = "";

        for (var pp = users[i].posts.length - 1; pp >= 0; pp--) 
        { 
          var temp_post = {};
          temp_post = JSON.parse(JSON.stringify(sur));

          //console.log("Checking User made post"+ users[i].posts[pp].postID)
          temp_post.postID = users[i].posts[pp].postID;
          temp_post.body = users[i].posts[pp].body;
          temp_post.picture = users[i].posts[pp].picture;
          temp_post.absTime = users[i].posts[pp].absTime;

          sur_array.push(temp_post);
        }
        
        //per feedAction
        for (var k = users[i].feedAction.length - 1; k >= 0; k--) 
        {
          //is a bully Victim message
          //if(users[i].feedAction[k].post.id == bully_messages[0] || users[i].feedAction[k].post.id == bully_messages[1] || users[i].feedAction[k].post.id == bully_messages[2]||users[i].feedAction[k].post.id == bully_messages[3])
          //console.log("Look up action ID: "+users[i].feedAction[k].id);
          //console.log("Look up action POST : "+users[i].feedAction[k].post);
          
          //console.log(util.inspect(users[i].feedAction[k], false, null))
          if(users[i].feedAction[k].post == null)
          {
            //console.log("@$@$@$@$@ action ID NOT FOUND: "+users[i].feedAction[k].id);
          }

          //not a bully message
          else 
          {

            //total number of likes
            if(users[i].feedAction[k].liked)
            {
              mlm.GeneralLikeNumber++;
            }

            //total number of flags
            if(users[i].feedAction[k].flagTime[0])
            {
              mlm.GeneralFlagNumber++;
            }

          }


        }//for Per FeedAction

      //mlm.GeneralReplyNumber = users[i].numReplies + 1;
      mlm.GeneralPostNumber = users[i].numPosts + 1;
      mlm.GeneralCommentNumber = users[i].numComments + 1;
        


      sums.GeneralPostNumber = mlm.GeneralPostNumber;
      sums.GeneralCommentNumber = mlm.GeneralCommentNumber;
      summary_writer.write(sums);


      mlm_writer.write(mlm);
      s_writer.write(sur);

      for (var zz = 0; zz < sur_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      //console.log("writing Bully Post "+ mlm_array[zz].BullyingPost);
      s_writer.write(sur_array[zz]);
    }

    }//for each user

    /*
    for (var zz = 0; zz < mlm_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      //console.log("writing Bully Post "+ mlm_array[zz].BullyingPost);
      mlm_writer.write(mlm_array[zz]);
    }
    */
      
    mlm_writer.end();
    summary_writer.end();
    s_writer.end();
    console.log('Wrote MLM!');
    mongoose.connection.close();

  });

