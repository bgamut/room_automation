

var internetconnection=false
var wificonn=false
var emergencyconnection=false
var fs = require('fs')
var rawdata = fs.readFileSync('json/localStorage.json')
var jsonInfo=JSON.parse(rawdata)
var exec = require('child_process').exec
var checkConnection=function(connection){
    require('dns').resolve(jsonInfo['internetcheckaddress'], function(err,data) {
        if (err) {
            connection(false);
        } 
        else if (data) {
            //console.log(data)
            connection(true);
        }
    });
    
}
var sendWIFIMaintainanceEmail = function(){
    var nodemailer=require('nodemailer')
    var transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
            user:jsonInfo['gmailid'],
            pass:jsonInfo['smtpgmailpassword']
            }
    })
    var mailOptions={from:jsonInfo['gmailid'],
                    to:jsonInfo['smtptestreceiver'],
                    subject:'Reconnected WIFI in IPark',
                    text:'check dropbox'}
    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            console.log(err)
            setTimeout(function(){sendWIFIMaintainanceEmail()},5000)
        }
        if(info){
            console.log('WIFI reconnection notification email has been sent')
        }
    })

}
var sendBackUpWIFIUsageEmail = function(){
    var nodemailer=require('nodemailer')
    var transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
            user:jsonInfo['gmailid'],
            pass:jsonInfo['smtpgmailpassword']
            }
    })
    var mailOptions={from:jsonInfo['gmailid'],
                    to:jsonInfo['smtptestreceiver'],
                    subject:'Backup WIFI was used in IPark',
                    text:'Check your dropbox'}
    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            //console.log(err)
            console.log("EMail error")
            setTimeout(function(){sendBackUpWIFIUsageEmail()},5000)
        }
        if(info){
            console.log('Backup WIFI reconnection notification email has been sent')
        }
    })

}

var TweetMaintainanceCall = function(){
    var Twitter = require('twitter')
    var client=new Twitter({
        consumer_key:jsonInfo['twitterconsumerkey'],
        consumer_secret:jsonInfo['twitterconsumersecret'],
        access_token_key:jsonInfo['twitteraccesstoken'],
        access_token_secret:jsonInfo['twitteraccesstokensecret']
    })
    client.post('statuses/update', {status: 'Check Your Dropbox'},  function(error, tweet, response) {
        if(error) {
            console.log( 'twitter error')
            setTimeout(function(){TweetMaintainanceCall},5000)
        };
        //console.log(tweet);  // Tweet body.
        //console.log(response);  // Raw response object.
      });
}
var connectToDefaultWIFI =function(wifiConnection){
    exec('networksetup -setairportnetwork en1 '+jsonInfo['mainwifi']+' '+ jsonInfo['mainwifipassword'],function(err,stdout,stderr){
        if(err){
            console.log("error connecting to default WIFI ")
            wifiConnection(false)
        }
        if(stdout){
            console.log("stdout:")
            console.log(stdout)
            wifiConnection(false)
        }
        else{
            console.log("connecting to default WIFI...")
            wifiConnection(true)
            setTimeout(function(){sendWIFIMaintainanceEmail()},5000)
            //setTimeout(function(){TweetMaintainanceCall()},5000)
        }
        if(stderr){
            console.log(stderr)
            wifiConnection(false)
        }
    })
}


var connectToBackUpWIFI =function(wifiConnection){

    exec("networksetup -setairportnetwork en1 "+jsonInfo['backupwifi']+jsonInfo['backupwifipassword'],function(err,stdout,stderr){
        if(err){
            console.log("error in the network ")
            wifiConnection(false)
        }
        if(stdout){
            console.log("stdout:")
            console.log(stdout)
            wifiConnection(false)
        }
        else{
            console.log("connecting to default WIFI")
            wifiConnection(true)
            setTimeout(function(){sendBackUpWIFIUsageEmail()},5000)
            //setTimeout(function(){TweetMaintainanceCall()},5000)
        }
        if(stderr){
            console.log(stderr)
            wifiConnection(false)
        }
    })
}
var connectionRoutine=function(){
    checkConnection(function(isConnected){
        if(isConnected){

        }
        else{
            console.log('Reconnecting')
            if(wificonn==false){
                connectToDefaultWIFI(function(wificonn){
                    if(wificonn){
                        console.log('Connected to DefaultWIFI!')
                        internetconnection=true
                        wificonn=true
                        emergencyconnection=false
                    }
                    else{
                        console.log('Reconnecting WIFI')
                        internetconnection=false
                        wificonn=false
                        emergencyconnection=true
                        console.log(internetconnection)
                        connectToBackUpWIFI(function(emergencyconn){
                            if(emergencyconn){
                                console.log('Backup Connection Activated')
                                emergencyconnection=true
                            }
                            else{
                                
                            }
                        })
                        
                    }
                })
            }
        }
    })
}
setInterval(() => {
    checkConnection(function(isConnected){
        if(isConnected){
            
        }
        else{
            connectionRoutine()
        }
    })
}, 3500);
