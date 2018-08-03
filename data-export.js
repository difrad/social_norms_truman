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
//var s_writer = csvWriter();
var summary_writer = csvWriter();

var bully_messages = ["5b4e271396208a40eb2aca3c",
"5b4e271396208a40eb2aca43",
"5b4e271396208a40eb2aca4b",
"5b4e271396208a40eb2aca4c"];
var bully_stats = [];

Array.prototype.sum = function() {
    return this.reduce(function(a,b){return a+b;});
};



var victim = "5b4e207817c6a93896fa924d";
var bully = "5b4e207817c6a93896fa923d";
var bully_name = "bblueberryy";

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
      //s_writer.pipe(fs.createWriteStream('results/sur_eatsnaplove.csv'));
      summary_writer.pipe(fs.createWriteStream('results/sum_eatsnaplove.csv'));

      for (var i = users.length - 1; i >= 0; i--) 
      {

        var mlm = {};
        var sur = {};
        var sums = {};
        mlm.id = users[i].mturkID;
        //sur.id = users[i].mturkID;
        sums.id = users[i].mturkID;


        mlm.email = users[i].email;
        //sur.email = users[i].email;
        sums.email = users[i].email;

        mlm.StartDate = users[i].createdAt;
        //sur.StartDate = users[i].createdAt;
        sums.StartDate = users[i].createdAt;

        console.log("In User "+ users[i].email);
        console.log("In User Number "+ i);

        //UI - transparency
        if (users[i].transparency == 'yes')
        {
          mlm.transparency = 1;
          //sur.ViewNotification = 1;
        }
        else
        {
          mlm.transparency = 0;
          //sur.ViewNotification = 0;
        }

        //profile_perspective
        if (users[i].profile_perspective == 'yes')
        {
          mlm.profile_perspective = 1;
          //sur.HighBystanders = 2;
        }
        else
        {
          mlm.profile_perspective = 0;
          //sur.HighBystanders = 0;
        }

        //comment_prompt
        if (users[i].comment_prompt == 'yes')
        {
          mlm.comment_prompt = 1;
          //sur.HighBystanders = 2;
        }
        else
        {
          mlm.comment_prompt = 0;
          //sur.HighBystanders = 0;
        }

        if (users[i].profile.name)
        {
          mlm.ProfileName = 1;
          //sur.ProfileName = 1;
        }
        else
        {
          mlm.ProfileName = 0;
          //sur.ProfileName = 0;
        }

        if (users[i].profile.location)
        {
          mlm.ProfileLocation = 1;
          //sur.ProfileLocation = 1;
        }
        else
        {
          mlm.ProfileLocation = 0;
          //sur.ProfileLocation = 0;
        }

        if (users[i].profile.bio)
        {
          mlm.ProfileBio = 1;
          //sur.ProfileBio = 1;
        }
        else
        {
          mlm.ProfileBio = 0;
          //sur.ProfileBio = 0;
        }

        if (users[i].profile.picture)
        {
          mlm.ProfilePicture = 1;
          //sur.ProfilePicture = 1;
        }
        else
        {
          mlm.ProfilePicture = 0;
          //sur.ProfilePicture = 0;
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
        mlm.numberbullypage = 0;
        mlm.numbervictimpage = 0;
        mlm.generalpagevisit = 0;
        for(var z = 0; z < users[i].pageLog.length; ++z){
            if(users[i].pageLog[z].page == "Notifications")
              mlm.notificationpage++;
            else if (users[i].pageLog[z].page == bully_name)
              mlm.numberbullypage++;
            else if (users[i].pageLog[z].page == "casssssssssie")
              mlm.numbervictimpage++;
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

        //per feedAction
        mlm.VictimNoBullyReplies = 0;
        mlm.VictimNoBullyLikes = 0;
        mlm.BullyNoBullyReplies = 0;
        mlm.BullyNoBullyLikes = 0;
        mlm.GeneralLikeNumber = 0;
        mlm.GeneralFlagNumber = 0;
        mlm.AveReadTime = 0;
        mlm.TotalNumberRead = 0;
        mlm.TotalNonBullyPostRead = 0;
        mlm.BullyPostStartReadTimes = 0;
        var bullyLikes = 0;
        var bullyReplies = 0;
        var bullyReads = 0;
        var bullyReadTimes = 0;
        var bullyVictumFlag = 0;
        var bullyVictumLikes = 0;
        var bullyVictumReplies = 0;
        var bullyVictumReads = 0;
        var bullyVictumReadTimes = 0;
        var bullyVictumFlag = 0;
        var bullyFlag = 0;

        
        //per feedAction
        for (var k = users[i].feedAction.length - 1; k >= 0; k--) 
        {
          //is a bully Victim message
          //if(users[i].feedAction[k].post.id == bully_messages[0] || users[i].feedAction[k].post.id == bully_messages[1] || users[i].feedAction[k].post.id == bully_messages[2]||users[i].feedAction[k].post.id == bully_messages[3])
          //console.log("Look up action ID: "+users[i].feedAction[k].id);
          //console.log("Look up action POST : "+users[i].feedAction[k].post);
          
          //console.log(util.inspect(users[i].feedAction[k], false, null))


          if(users[i].feedAction[k].post.id == bully_messages[0] || users[i].feedAction[k].post.id == bully_messages[1] || users[i].feedAction[k].post.id == bully_messages[2]||users[i].feedAction[k].post.id == bully_messages[3])   
          {
            console.log("FOUND BULLY ACTION")
            if(users[i].feedAction[k].replyTime[0])
            {
              bullyVictumReplies++;
            }

            if(users[i].feedAction[k].startTime)
            {
              mlm.BullyPostStartReadTimes++;
            }

            if(users[i].feedAction[k].liked)
            {
              bullyVictumLikes++;
            }

            if(users[i].feedAction[k].flagTime[0])
            {
              bullyVictumFlag++;
            }

            if(users[i].feedAction[k].readTime[0])
            {
              bullyVictumReads++;
              bullyVictumReadTimes += users[i].feedAction[k].readTime.sum() / users[i].feedAction[k].readTime.length; 
            }

            //check bully comments
            for (var cc =users[i].feedAction[k].comments.length;cc >= 0; cc--)
            { 
              //IF THIS IS THE BULLY COMMENT
              //if (users[i].feedAction[k].comments[cc] && users[i].feedAction[k].comments[cc].hasOwnProperty("comment"))
              if (users[i].feedAction[k].comments[cc] && !users[i].feedAction[k].comments[cc].new_comment)
              { 
                console.log("COUNT AVG LIKES/FLAG")
                //liked bully comment
                if(users[i].feedAction[k].comments[cc].liked)
                {
                  bullyLikes++;
                }
                //flagged bully comment
                if(users[i].feedAction[k].comments[cc].flagTime[0])
                {
                  bullyFlag++;
                }
              }//end of BULLY COMMENT
              
              //else this is a comment that user made
              else if (users[i].feedAction[k].comments[cc] && users[i].feedAction[k].comments[cc].new_comment)
                bullyReplies++;
            }//end of COMMENT FOR LOOP


          }//IF BULLY_VICTIM POST

          //not a bully message
          else 
          {
            //Victim stats
            if (users[i].feedAction[k].post.actor.id == victim)
            {
              if(users[i].feedAction[k].replyTime[0])
              {
                mlm.VictimNoBullyReplies++;
              }

              if(users[i].feedAction[k].liked)
              {
                mlm.VictimNoBullyLikes++;
              }
            }

            //bully stats
            if (users[i].feedAction[k].post.actor.id == bully)
            {
              if(users[i].feedAction[k].replyTime[0])
              {
                mlm.BullyNoBullyReplies++;
              }

              if(users[i].feedAction[k].liked)
              {
                mlm.BullyNoBullyLikes++;
              }
            }

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

            //total read times, and average of all reads
            if(users[i].feedAction[k].readTime[0])
            {
              mlm.TotalNonBullyPostRead++;
              mlm.AveReadTime += users[i].feedAction[k].readTime.sum() / users[i].feedAction[k].readTime.length;
              
            }
          }


        }//for Per FeedAction

        //get totalAverage
        mlm.AveReadTime = mlm.AveReadTime/mlm.TotalNonBullyPostRead;
        mlm.TotalNumberRead = mlm.TotalNonBullyPostRead + bullyVictumReads;
        //mlm.GeneralReplyNumber = users[i].numReplies + 1 - bullyReplies;
        mlm.GeneralReplyNumber = users[i].numReplies + 1;
        mlm.GeneralPostNumber = users[i].numPosts + 1;

        mlm.TotalCyberBullyLikes = bullyLikes;
        mlm.TotalCyberBullyReplies = bullyReplies;
        mlm.TotalCyerBullyReads =  bullyReads;
        mlm.TotalCyberBullyReadTimes = bullyReadTimes;
        mlm.TotalCyberBullyVictumPostFlag = bullyVictumFlag;
        mlm.TotalCyberBullyVicPostLikes =  bullyVictumLikes;
        mlm.TotalCyberBullyVicPostReplies =  bullyVictumReplies;
        mlm.TotalCyberBullyVicPostReads = bullyVictumReads;
        mlm.TotalCyberBullyVicPostReadsTimes =  bullyVictumReadTimes;
        mlm.TotalCyberBullyVicPostFlag = bullyVictumFlag = 0;
        mlm.TotalCyerBullyFlag =  bullyFlag;

        if (users[i].blocked.includes(bully_name))
        {
          var block_index = _.findIndex(users[i].blockAndReportLog, function(o) { return (o.actorName == bully_name && o.action =="block"); });
          mlm.blocked = 1;
          mlm.BlockMilliSeconds = users[i].blockAndReportLog[block_index].time - users[i].createdAt;
        }
        else
        {
          mlm.blocked = 0;
          mlm.BlockMilliSeconds = 259200000;
        }

        if (users[i].reported.includes(bully_name))
        {
          var report_index = _.findIndex(users[i].blockAndReportLog, function(o) { return (o.actorName == bully_name && o.action =="report"); });
          mlm.reported = 1;
          mlm.ReportMilliSeconds = users[i].blockAndReportLog[report_index].time - users[i].createdAt;
          mlm.reportIssue = users[i].blockAndReportLog[report_index].report_issue;
        }
        else
        {
          mlm.reported = 0;
          mlm.ReportMilliSeconds = 259200000;
          mlm.reportIssue = "";
        }

        //per profile_feed
        mlm.ProfileIntroPictureClicks = 0
        mlm.ProfileIntroReads = 0
        for (var ll = users[i].profile_feed.length - 1; ll >= 0; ll--) 
        { 
          console.log("@@@@PROFILE INTRO has "+users[i].profile_feed[ll].rereadTimes);
          if (users[i].profile_feed[ll].picture_clicks.length > 0)
          {
            mlm.ProfileIntroPictureClicks = mlm.ProfileIntroPictureClicks + users[i].profile_feed[ll].picture_clicks.length;
          }

          //rereadTimes
            mlm.ProfileIntroReads = mlm.ProfileIntroReads + users[i].profile_feed[ll].rereadTimes + 1;
        }

        mlm.AVGProfileIntroPictureClicks = mlm.ProfileIntroPictureClicks/users[i].profile_feed.length
        mlm.AVGProfileIntroReads = mlm.ProfileIntroReads/users[i].profile_feed.length



        //per bully post 1-4
        for (var n = 0; n < bully_messages.length; n++) 
        {  
          //console.log(" Bully message  "+ n);

          var temp_mlm = {};
          temp_mlm = JSON.parse(JSON.stringify(mlm));

          

          var feedIndex = _.findIndex(users[i].feedAction, function(o) { return o.post.id == bully_messages[n]; });

          if(feedIndex!=-1)
          {
            temp_mlm.BullyingPost  = n + 1;
            console.log(":"+temp_mlm.BullyingPost+" IF FI mlm Bully message");
            
            //startTime
            //last read time
            if(users[i].feedAction[feedIndex].startTime)
            {
              temp_mlm.BullyPostStartREADTime = users[i].feedAction[feedIndex].startTime;
            }
            else 
            {
              temp_mlm.BullyPostStartREADTime = -1;
            }

            //last read time
            if(users[i].feedAction[feedIndex].readTime[0])
            {
              temp_mlm.BullyPostLastReadTime = users[i].feedAction[feedIndex].readTime[users[i].feedAction[feedIndex].readTime.length - 1];
              temp_mlm.BullyPostAverageReadTime = users[i].feedAction[feedIndex].readTime.sum() / users[i].feedAction[feedIndex].readTime.length;
              temp_mlm.BullyPostNumOfReadTimes = users[i].feedAction[feedIndex].readTime.length;
            }
            else 
            {
              temp_mlm.BullyPostLastReadTime = -1;
              temp_mlm.BullyPostAverageReadTime = -1;
              temp_mlm.BullyPostNumOfReadTimes = -1;
            }

            if(users[i].feedAction[feedIndex].flagTime[0])
            {
              temp_mlm.VictimPostFlag = 1;
              temp_mlm.VictimPostFlagTime = users[i].feedAction[feedIndex].flagTime[0];
            }
            else 
            {
              temp_mlm.VictimPostFlag = 0;
              temp_mlm.VictimPostFlagTime = 0;
            }

            if(users[i].feedAction[feedIndex].likeTime[0])
            {
              temp_mlm.VictimPostLike = 1;
              temp_mlm.VictimPostLikeTime = users[i].feedAction[feedIndex].likeTime[0];
            }
            else 
            {
              temp_mlm.VictimPostLike = 0;
              temp_mlm.VictimPostLikeTime = 0;
            }

            if (users[i].feedAction[feedIndex].comments.length > 1)
              temp_mlm.Reply = users[i].feedAction[feedIndex].comments.length - 1;
            else
              temp_mlm.Reply = 0;

            //check bully comments
            for (var cc =users[i].feedAction[feedIndex].comments.length;cc >= 0; cc--)
            { 
              //IF THIS IS THE BULLY COMMENT
              if (users[i].feedAction[feedIndex].comments[cc] && !users[i].feedAction[feedIndex].comments[cc].new_comment)
              { 
                console.log("WE have a BULLY comment action MLM");
                //liked bully comment
                if(users[i].feedAction[feedIndex].comments[cc].liked)
                {
                  console.log("LIKE");
                  temp_mlm.Like = 1;
                  temp_mlm.LikeTime = users[i].feedAction[feedIndex].comments[cc].likeTime[0];
                }
                //flagged bully comment
                if(users[i].feedAction[feedIndex].comments[cc].flagTime[0])
                {
                  console.log("FLAG");
                  temp_mlm.Flag = 1;
                  temp_mlm.FlagTime = users[i].feedAction[feedIndex].comments[cc].flagTime[0];;
                }
              }//end of BULLY COMMENT
              
              //else this is a comment that user made
              else if(users[i].feedAction[feedIndex].comments[cc] && users[i].feedAction[feedIndex].comments[cc].new_comment)
              { 
                //is empty, but user message
                console.log("NOT BULLY COMMENT - USER COMMENT IN VIC POST");
                if (!temp_mlm.commentMessage)
                  temp_mlm.commentMessage = users[i].feedAction[feedIndex].comments[cc].comment_body;
                else
                  temp_mlm.commentMessage = temp_mlm.commentMessage +"|"+users[i].feedAction[feedIndex].comments[cc].comment_body;
              }
            }//end of COMMENT FOR LOOP




            mlm_array.push(temp_mlm);
            /*
            console.log(":"+mlm.BullyingPost+" Before WRITE MLM Bully message");
            mlm_writer.write(mlm_array[mlm_array.length - 1]);
            console.log(":"+mlm.BullyingPost+" After WRITE MLM Bully message");
            */
          }//end of if FI != 1

          else
          {
            temp_mlm.BullyingPost  = n + 1;
            //console.log(":"+temp_mlm.BullyingPost+" ELSE temp_mlm Bully message");
            
             temp_mlm.BullyPostStartREADTime = 0;

            temp_mlm.BullyPostLastReadTime = 0;
            temp_mlm.BullyPostAverageReadTime = 0;
            temp_mlm.BullyPostNumOfReadTimes = 0;

            temp_mlm.VictimPostFlag = 0;
            temp_mlm.VictimPostFlagTime = 0;
            temp_mlm.VictimPostLike = 0;
            temp_mlm.VictimPostLikeTime = 0;


            temp_mlm.Flag = 0;
            temp_mlm.FlagTime = 0;
            temp_mlm.Like = 0;
            temp_mlm.LikeTime = 0;
            temp_mlm.Reply = 0;
            temp_mlm.ReplyTime = 0;

            mlm_array.push(temp_mlm);
            /*
            console.log(" mlm+array size is  "+ mlm_array.length);

            console.log(":"+mlm.BullyingPost+" Before WRITE MLM Bully message");

            console.log(":"+mlm.BullyingPost+" Before WRITE MLM Bully message");
            mlm_writer.write(mlm_array[mlm_array.length - 1]);
            console.log(":"+mlm.BullyingPost+" After WRITE MLM Bully message");
            */
          }

          //console.log("Before WRITE MLM Bully message  "+ mlm.BullyingPost);
          //mlm_writer.write(mlm);
          //console.log("After WRITE MLM Bully message  "+ mlm.BullyingPost);
        }//for Bully Messages




      /*
      //time to do survival
      if (users[i].blocked.includes(bully_name))
      {
        var block_index = _.findIndex(users[i].blockAndReportLog, function(o) { return (o.actorName == bully_name && o.action =="block"); });
        sur.blocked = 1;
        sur.BlockMilliSeconds = users[i].blockAndReportLog[block_index].time - users[i].createdAt;
      }
      else
      {
        sur.blocked = 0;
        sur.BlockMilliSeconds = 259200000;
      }

      if (users[i].reported.includes(bully_name))
      {
        var report_index = _.findIndex(users[i].blockAndReportLog, function(o) { return (o.actorName == bully_name && o.action =="report"); });
        sur.reported = 1;
        sur.ReportMilliSeconds = users[i].blockAndReportLog[report_index].time - users[i].createdAt;
        sur.reportIssue = users[i].blockAndReportLog[report_index].report_issue;
      }
      else
      {
        sur.reported = 0;
        sur.ReportMilliSeconds = 259200000;
        sur.reportIssue = "";
      }

      sur.VictimNoBullyReplies = mlm.VictimNoBullyReplies;
      sur.VictimNoBullyLikes = mlm.VictimNoBullyLikes;
      sur.BullyNoBullyReplies = mlm.BullyNoBullyReplies + bullyReplies;
      sur.BullyNoBullyLikes = mlm.BullyNoBullyLikes + bullyLikes;
      sur.GeneralLikeNumber = mlm.GeneralLikeNumber + bullyLikes;
      sur.GeneralFlagNumber = mlm.GeneralFlagNumber + bullyFlag;
      sur.GeneralReplyNumber = mlm.GeneralReplyNumber + bullyReplies;
      sur.GeneralPostNumber = mlm.GeneralPostNumber;
      sur.TotalNumberRead = mlm.TotalNumberRead;
      sur.AveReadTime = mlm.AveReadTime;
      if (bullyReplies > 0)
        sur.DidReplyBullyPost = 1;
      else
        sur.DidReplyBullyPost = 0;
      sur.ReplyBullyPost = bullyReplies;
      if (bullyLikes > 0)
        sur.DidLikeBullyPost = 1;
      else
        sur.DidLikeBullyPost = 0;
      sur.LikeBullyPost = bullyLikes;
      if (bullyFlag > 0)
        sur.DidFlagBullyPost = 1;
      else
        sur.DidFlagBullyPost = 0;
      sur.FlagBullyPost = bullyFlag;

      sur.OtherIntervention = 0;

      if ((bullyFlag + bullyReplies + sur.blocked + sur.reported) > 0)
        sur.DidIntervene = 1;
      else
        sur.DidIntervene = 0;



      //s_writer.write(sur);
      */

      sums.GeneralPostNumber = mlm.GeneralPostNumber;
      sums.GeneralReplyNumber = mlm.GeneralReplyNumber + bullyReplies;
      summary_writer.write(sums);

    }//for each user

    for (var zz = 0; zz < mlm_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      //console.log("writing Bully Post "+ mlm_array[zz].BullyingPost);
      mlm_writer.write(mlm_array[zz]);
    }
      
    mlm_writer.end();
    //s_writer.end();
    summary_writer.end();
    console.log('Wrote MLM!');
    mongoose.connection.close();

  });

