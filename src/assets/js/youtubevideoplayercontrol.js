//-----------------------------------------------------------------------
// The variables Section

//-----------------------------------------------------------------------
var consoleoutput = ''; // string builder for virtual console display.
var consoleidx = 0; // virtual console iterator
var vdodata = []; // The forbearer of Video Data as received from Angular.
var vdoplayers; // the virtual object mapping reference for setting and getting player functions. 
var players = new Array; // the actual player
var vdoelmIDref = new Array; // a ref point for getting video index from html elementID
var vdoplayerinfo = new Array; // this is what I use for storing the secret sauce to get the desired smoothness.
var testplayercount = 0; // used to identify when/if all players have been intialized for all videos on screen.
var videoHeight = 0; // THE HEIGHT IS AN IMPORTANT FACTOR WHEN YOU ARE SCROLLING VERTICALLY. Again a core attribute. 
var videoWidth = 320; // width = 100% ? or 16:9 aspect ratio
var bottombarmenu = 85; // ***NEW **** height of the bottom menu bar
var done = false; // player loaded and ready flag
var currentlyplayingvideoidx = 0; //Nikki pointed out a bug - this variable addressed that bug.
var onYouTubeIframeAPIReadyError = false; // a last minute tweak added for managing angular jquery misfire.
//============================================

//==================================================================================
// The Utility functions
//==================================================================================
//--------------------------------------------------------------------------------
// if this js file is the universe then this function contains "The GOD Particle"
//--------------------------------------------------------------------------------
//{ *** I Created this function which is simplied in its calculations, after breaking my head on a galileo version of it - gave me a headache ***
// thats why I named it 2.
//==================================================================================
var fraction = 0.8; //<-- the tuning factor!!!!!!!!!!!!!!!!!!!!!!!!!!! cannot underline how important this is in version 0.1 of my code. 
// 0.2 ==> well I dont use this anymore! ;-) 

var divcont;
var inscrollroutine = false; // circuit breaker! when ON, does not allow any further inputs to be processed.

function beforeplayvideo(vdoidx) {
    // I deleted all code written here - it was confusing. it was biting me whenever I scrolled past it, so I deleted it. 
}


function playVideo(vdoidx) {
    logmsg('play video called with arg [' + vdoidx + ']');
    console.log('play video called with arg [' + vdoidx + ']');
    //console.log(players[vdoidx].playerVars.mute);
    //console.log(players[vdoidx].playerVars);
    //beforeplayvideo(vdoidx);
    if (vdoplayerinfo[vdoidx].ispausedbyUser == 0) {
        players[vdoidx].playVideo();
        players[vdoidx].unMute();
    }
}

function beforepausevideo() {
    // not in use; deleted all code here as well - but this is an important event, if ever needed.
}

function pauseVideo(vdoidx) {
    logmsg('pause video called with arg [' + vdoidx + ']');
    console.log('pause video called with arg [' + vdoidx + ']');
    players[vdoidx].pauseVideo();
}

function stopVideo(vdoidx) {
    players[vdoidx].stopVideo();
}

function checkscroll2(divtop, innerH) {
    try {
        if (inscrollroutine) return;
        var viewablearea = divtop + innerH;
        viewablearea = viewablearea - bottombarmenu; //discounting the space taken by bottom menu
        logmsg(' checkscroll2 called with ' + divtop, 1);
        logmsg('viewablearea == ' + viewablearea, 1);
        inscrollroutine = true;
        var newdivtop = divtop;
        //===================================================
        // an important edit here! 20 June 2020
        // step 7. 
        // if suppose the user has overriden the auto selector for video and chosen to play another video 
        // as visible on screen and................
        // if they scroll the window, then we dont want the auto selector to wrench control back.....until..
        // if the video the user has overriden to play, goes out of the visibility boundaries defined!

        if (currentlyplayingvideoidx > 0 && vdoplayerinfo[currentlyplayingvideoidx].isforceplayedbyuser == 1) {
            console.log("inside checkscroll2 currentlyplayingvideoidx = " + currentlyplayingvideoidx);
            console.log("vdoplayerinfo[currentlyplayingvideoidx].isforceplayedbyuser = " + vdoplayerinfo[currentlyplayingvideoidx].isforceplayedbyuser);
            // yes, if the currently playing video is the first video, then we anyways let it go with the flow! why ? 
            // because the iterator always prioritizes the first video over all else --look down!
            // only when the user overriddden chosen video is not the first video and it is being force played, 
            // only then we need to first check its coords...lets do it!
            if (
                ((vdoplayerinfo[currentlyplayingvideoidx].scrollY >= newdivtop) && (vdoplayerinfo[currentlyplayingvideoidx].scrollY <= viewablearea)) ||
                (vdoplayerinfo[currentlyplayingvideoidx].visiblePx >= newdivtop) && (vdoplayerinfo[currentlyplayingvideoidx].visiblePx <= viewablearea)
            ) {
                console.log("playing video is safe within its boundaries ");
                // if the currently playing video is safe within its boundaries - lets not change a thing and quietly exit..shhhhhh!
                inscrollroutine = false;
                return;
            }
        }
        //===================================================


        for (var i = 0; i < vdoplayers.length; i++) {
            var newdivtop = divtop;
            //check if the scrollY is greater than the window height - it means that the video is below the visible window.
            /* if (vdoplayerinfo[i].scrollY > divcont.height()) {
                 newdivtop = viewablearea - videoHeight
             }
*/
            if (
                ((vdoplayerinfo[i].scrollY >= newdivtop) && (vdoplayerinfo[i].scrollY <= viewablearea)) ||
                (vdoplayerinfo[i].visiblePx >= newdivtop) && (vdoplayerinfo[i].visiblePx <= viewablearea)
            ) {
                logmsg("pause all other videos");
                for (var kl = 0; kl < players.length; kl++) {
                    if (kl != i) {
                        vdoplayerinfo[kl].isautoplaying = 0;
                        vdoplayerinfo[kl].isautopaused = 1;
                        pauseVideo(kl);
                    }
                }
                logmsg("playing video " + (i + 1));
                // console.log("playing video " + (i + 1));
                vdoplayerinfo[i].isautoplaying = 1;
                vdoplayerinfo[i].isforceplayedbyuser = 0; //this is important as if its autoplaying - its not force played by the user.
                playVideo(i);
                inscrollroutine = false;
                return;
            } else {
                vdoplayerinfo[i].isautopaused = 1;
                pauseVideo(i);
            }

            /*  if (newdivtop >= vdoplayerinfo[i].scrollY && divtop <= vdoplayerinfo[i].visiblePx) {
                  logmsg("play video " + (i + 1));
                  logmsg("pause all other videos");
                  inscrollroutine = false;
                  return;
              }*/
        }
    } catch (e) {
        logmsg("*** ERROR **** ==  " + e.message);
    }

    inscrollroutine = false;
    logmsg("No other videos found at this pos. stop any playing video");

}


// I created this function more like a enumerator for variables and values defined - like a pressure meter gauge - before taking plunge.
// but ended up making this a core function - that defines the secret sauce ingredients. 
function enumVideos() {
    try {
        for (var idx = 0; idx < vdodata.length; idx++) {
            logmsg(idx + ' = ' + vdodata[idx].AdditionalData.YoutubeVideoID);
        };

        logmsg('vdoplayers on screen = ' + vdoplayers.length);
        //logmsg('vdoplayers on screen = ' + $('div[id^="vdoplayer__"]').length);
        var scrollfromtop = 0;
        var mrgtopconst = 10;
        var mrtopval = 0;
        vdoplayers.each(function (idx) {
            logmsg(idx + ' ' + $(this).attr('id'), 1);
            $(this).css('visibility', 'visible');
            //console.log(document.getElementsByTagName('iframe')[idx].contentWindow.getElementsByClassName('ytp-overflow-panel')[0]);//.style.display = 'none';
            logmsg('iframe position top == ' + $(this).position().top, 1);
            videoHeight = $(this).height();
            scrollfromtop = (idx) * videoHeight;
            mrtopval = (idx) * mrgtopconst;
            //console.log(videoHeight);
            //atop = $(this).position().top < divcont.height() ? $(this).position().top : $(this).position().top + 20 + videoHeight;
            atop = $(this).position().top;

            vdoplayerinfo[idx] = {
                scrollY: atop + (videoHeight * 0.30),
                visiblePx: (atop) + (videoHeight * 0.70), //0.65),
                isautoplaying: 0,
                isautopaused: 0,
                ispausedbyUser: 0,
                isforceplayedbyuser: 0
            }
            logmsg(vdoplayerinfo[idx].scrollY + ' -- ' + vdoplayerinfo[idx].visiblePx, 1);
            logmsg("-------------");
            //logmsg($(this).is(":visible"));
            //logmsg('element outerHeight = ' + $(this).outerHeight());
        });
        // the below code cleared up an irritating doubt - the doubt though hits back again when things dont work.
        //hence kept it for reference. 
        //-----------------------------------
        /*vdoplayers.each(function(idx) {
            atop = $(this).position().top;
            logmsg('vdoplayer__' + (idx + 1) + '  this div position.top = ' + atop, 1);
            logmsg('vdoplayer__' + (idx + 1) + '  div offsetTop = ' + document.getElementById("vdoplayer__" + (idx + 1)).offsetTop, 1);
        });*/
        //-----------------------------------


    } catch (e) {
        logmsg(e.message, 1); // honestly I wrote this logmsg function as I didnt want to flip over to the inspectors console. 
        // and browser does some more things and prints them as well into the console and messes the debugging. 
    }
}

//-----------------------------------------------------------------------
//  Post Initializing the YouTube API - when the video is Ready
//-----------------------------------------------------------------------    
function onPlayerReady(event) {
    logmsg('player ready event called==' + testplayercount); // just a logger - a reminder, how I struggled to reach here. 
    if (testplayercount === vdoplayers.length && !done) {
        logmsg("initializing the checkScroll event - setting the ball rolling... god bless!!");
        done = true;
        //===========================================
        vdoplayers = $('iframe[id^="vdoplayer__"]'); //<---- the youtube API replaces the designated divtags with iframe! at run time!!
        //<-- the youtube API switches off the display of the divs to none or adds the iframe after the relative position of the origin DIVs.
        enumVideos(); //placed this here as the conversion from div to iframe doesnt happen until before this func is called.
        //===========================================
        //default window $(window) or container DIV $('#dvideocontainer')? 
        // if there is no containing or scrollable DIV, then its windows ELSE container div with elements within then container div
        $(window).scroll(function (event) {
            //checkScroll();
            logmsg('scrolltop = ' + $(this).scrollTop());
            logmsg('inner height = ' + $(this).innerHeight());
            checkscroll2($(this).scrollTop(), $(this).innerHeight());
        });


        if ($(window).scrollTop() > 0) {
            checkscroll2($(window).scrollTop(), $(window).innerHeight());
        }

    }

}

function getplayerIndexfromElementID(elmid) {
    for (var i = 0; i < vdoelmIDref.length; i++) {
        if (vdoelmIDref[i] === elmid)
            return i;
    }
}

function onPlayerStateChange(event) {
    logmsg('onPlayerStateChange init');

    var vdoplyrid = event.target.f.id; // get the id of the current player.

    //var curplayidx = parseInt(vdoplyrid.substr(vdoplyrid.length - 1)) - 1; //reference the videoplayer using the ID
    var curplayidx = getplayerIndexfromElementID(vdoplyrid);
    console.log("currentlyplayingvideoidx = " + currentlyplayingvideoidx);
    console.log("curplayidx = " + curplayidx);

    if (event.data == YT.PlayerState.PLAYING) {
        //------------------------------------------
        // added below code to identify what player is playing. if another player is already in play ?
        // if yes, stop that first and then proceed to play the second one. 
        if (vdoplayerinfo[curplayidx] != undefined || vdoplayerinfo[curplayidx] != null) {
            vdoplayerinfo[curplayidx].isautopaused = 0;
            vdoplayerinfo[curplayidx].ispausedbyUser = 0;
        }
        // this function is also triggered by a video playing from the auto-selector intelligence;
        // lets check if the video being played is a manual override by the user or from the auto selector.
        if ((currentlyplayingvideoidx != curplayidx) && (vdoplayerinfo[curplayidx].isautoplaying == 0)) {
            // it is a manual override for the current video
            // only if its a manual override - execute the below code!
            console.log("play video with id " + vdoplyrid);

            for (var kl = 0; kl < players.length; kl++) {
                if (kl != curplayidx) {
                    vdoplayerinfo[kl].isforceplayedbyuser = 0; // disable forceplay flag for the previous video
                    vdoplayerinfo[kl].isautoplaying = 0;
                    vdoplayerinfo[kl].isautopaused = 1;
                    pauseVideo(kl);
                }
            }

            pauseVideo(currentlyplayingvideoidx); // pause the prev video
            players[curplayidx].unMute(); //unmute the current video - added here as the video was playing without sound! strange
            vdoplayerinfo[curplayidx].isforceplayedbyuser = 1; //tag the current video as force played by current user.
            currentlyplayingvideoidx = curplayidx;
        }
        else {
            currentlyplayingvideoidx = 0;
        }
        // enumerating the scenario....[action]            
        // step 1: the page is loaded and video 1 goes into automode or autoplaying is set to 1 - in mute. 
        // step 2: user touches the video and it gets unmuted and all autoplay function is unlocked!
        // step 3: the video played event is triggered. it checks if the currently playing video was manually forced == false due to step 1
        // step 4: the user clicks or touches video 2.
        // step 5: the 2nd video is not autoplaying, it is forced played. logic goes into the if condition.
        // step 6: the prev video is paused and the current video is force played. - goto checkscroll2(0,0) function
        //------------------------------------------
        //console.log("video is playing .. .. .. .. .. .. ." + event.target.f.id);
        //console.log(event.target.f.id);
        logmsg('this video is playing ... ')
    }
    else if (event.data == YT.PlayerState.PAUSED) {
        // need to check if this video is paused by the user or by system.
        clearLogs();
        logmsg("a video seems to be paused");
        if (vdoplayerinfo[curplayidx] != undefined || vdoplayerinfo[curplayidx] != null) {
            logmsg("is the video autoplaying = " + vdoplayerinfo[curplayidx].isautoplaying);
            logmsg("is the video autopaused = " + vdoplayerinfo[curplayidx].isautopaused);
            logmsg("..checking to see if it was force paused ..");
            if (vdoplayerinfo[curplayidx].isautoplaying == 1 && vdoplayerinfo[curplayidx].isautopaused == 0) {
                vdoplayerinfo[curplayidx].ispausedbyUser = 1;
                logmsg('video being force paused by the user');
            }
        }
        console.log(event);
    }
    else {
        logmsg('this video is paused ... ');
    }
}

//-----------------------------------------------------------------------
//  Callback post Initializing the YouTube API 
//-----------------------------------------------------------------------
function onYouTubeIframeAPIReady() {
    //alert('func onYouTubeIframeAPIReady called....');

    try {
        logmsg('onYouTubeIframeAPIReady event called <------------------- This is ** important **'); //just a logger
        // the YT object is created from out of the youtube API call above - like Brahma came out of the lotus flower from Vishnu's navel. 
        //Vishnu's navel is the youtube site - it is already there.
        //the lotus - is the API service from youtube.
        //Brahma - is our YT object returned by the API
        logmsg("looping through each video  element on screen");
        vdoplayers.each(function (idx) {
            var elmid = $(this).attr('id'); // capturing the elementID for further use deep within ... ... ... ...
            vdoelmIDref[idx] = elmid;
            players[idx] = new YT.Player($(this).attr('id'), /* the ID of the DIV tag below */ {
                /*height: videoHeight,*/
                /* this is optional, if we dont set, it will assume the smallest value possible or allowed */
                width: "100%",
                /* this is optional, if we dont set, it will assume the smallest value possible or allowed */
                videoId: vdodata[idx].AdditionalData.YoutubeVideoID,
                /* THIS IS IMPORTANT - will come from API <----> Database 
                The youtube videoID */
                playerVars: {
                    'wmmode': vdodata[idx].AdditionalData.Display,
                    /* options are opaque vs transparent - transparent used in flash player vs HTML5 */
                    'autohide': 1,
                    /* In HTML5 players, the video progress bar and player controls display or hide automatically. 
                    That behavior corresponds to an autohide setting of 1.
                    */
                    controls: 0,
                    autoplay: ((idx === 0) ? 1 : 0),
                    mute: 1,
                    /* This parameter indicates whether the video player controls are displayed */
                    'enablejsapi': 1,
                    /* Setting the parameter's value to 1 enables the player to be controlled via IFrame or JavaScript Player API calls. */
                    /* The default value is 0, which means that the player cannot be controlled using those APIs. */
                    'origin': vdodata[idx].AdditionalData.origin,
                    /* since we are using the iframe API - see the document.is.ready event berlow (intentional) 
                    This parameter provides an extra security measure for the IFrame API.
                    You should always specify your domain as the origin parameter value.
                    */
                    rel: 0,
                    showinfo: 0,
                    /* If the parameter's value is set to 0, then the player does not show related videos. */
                    /* **NOTE**: 
                    The behavior for the rel parameter is changing on or after September 25, 2018. 
                    The effect of the change is that you will not be able to disable related videos. 
                    However, you will have the option of specifying that the related videos shown in the player should be 
                    from the same channel as the video that was just played.

                    To be more specific:
                    > Prior to the change, if the parameter's value is set to 0, then the player does not show related videos.
                    > After the change, if the rel parameter is set to 0, the player will show related videos, if uploaded, that
                    are from the same channel as the video that was just played.

                    for more details: https://developers.google.com/youtube/player_parameters#release_notes_08_23_2018 
                    */
                    modestbranding: 1
                },
                events: {
                    onReady: function (event) {
                        // This function never fired - until I discovered that this code works only on DIV players not on iframes. 
                        // I told you all - not to use iframes directly. it botches up all scriptaculous codes.
                        // that YT API converts DIVs into iframes - is not our lookout!
                        logmsg('onReady event called for player ... ...' + elmid); //<-------- deep enough...using the ID here !!
                        // just a logger - I needed this as I was unable to trigger this.
                        ++testplayercount; //<------ this is just a variable I use to test if the players array has indeed been
                        //successfully initialized.
                        onPlayerReady(event); // the actual func! - see below for implementation details!
                        // you see the onstatechange is called no sooner the loop is iterated, as the first video is set
                        // to autoplay. 
                        // Hence, we need a mechanism to ensure that enumplayers is called just right after the last video is ready
                        // but just before the the playerstate changes!
                        // and hence I use the ++testplayercount as a flag.
                    },
                    onStateChange: onPlayerStateChange /* this is called when the video plays or pauses. */
                }
            });
        });
        logmsg('players variable initialized'); // just a logger - -I am telling you - I wasnt able to reach this point! until some/lot of struggle.


    } catch (e) {
        logmsg("*** ERROR *** :: " + e.message);
        onYouTubeIframeAPIReadyError = true;
    }
}

//-----------------------------------------------------------------------
//  Setting up a Utility function
//-----------------------------------------------------------------------

// Logger function for our reference.
function logmsg(strmsg, pb) {
    //alert(strmsg);
    //if (pb === 3) {
    strmsg += '<br/>'
    consoleoutput += ++consoleidx + '. ' + strmsg;
    $('#divconsole').html(consoleoutput);
    console.log(strmsg);
    // }
}

function clearLogs() {
    consoleoutput = '';
    $('#divconsole').html(consoleoutput);
}

function InitLogger() {
    var divtag = document.createElement('div');
    divtag.setAttribute('id', 'divconsole');
    document.getElementsByTagName('body')[0].appendChild(divtag);
    $('#divconsole').attr('style', 'dispplay:none;visibility:hidden;position:fixed;left:10px;top:80px;background-color: #1976d2;border:1px solid yellow;height:250px;width:33%;overflow-y: auto;');
    logmsg('this is a loggerDIV', 3);
    logmsg('initVideoCore called from ngOnInit ', 3);
}
//-----------------------------------------------------------------------
//  The Entry point from Angular
//-----------------------------------------------------------------------
function initVideoCore(strvdodata) {

    InitLogger();
    vdodata = strvdodata;
    console.log(' &&&&&&&&&&&&&&&&&&&& iINSIDE initVideoCore &&&&&& = ' + vdodata.length);
    //alert(vdodata[0].VideoIndex);
    //alert('first video id = ' + vdodata[0].AdditionalData.YoutubeVideoID);

    vdoplayers = $('div[id^="vdoplayer__"]');
    logmsg(vdoplayers.length, 3);
    if (onYouTubeIframeAPIReadyError) {
        onYouTubeIframeAPIReady();
    }
}



