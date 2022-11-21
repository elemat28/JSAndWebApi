console.log("Hello World!");
let boardSize = null; // s = small, m = medium, l = large
let gameDifficulty = null //e = easy, i = intermediate, h = hard;
let currentClick = null;
let firstClicked = null;
let secondClicked = null;
let numOfCards = 0;
let matchesRequired = 6;
let matchesCurrently = 0;
let timeout = null;
let timeoutMs = 1500;
let gameTime = 0;
let interval;
let intervalStep = 100;
let clicksThisRound = 0;
let numberOfScoresToKeep = 10;
let GameGrid = document.getElementById("CardGrid");
let timerBox = document.getElementById("timerBox");
let numOfClicksBox = document.getElementById("numOfClicksBox");
let defaultTheme = {
    start: 128512,
    end: 128580
};
let scoreboards = {
    small: {
        easy: {
            htmlTableID: "smallBoardEasyTable",
            records: [
            ]
        },
        intermediate: {
            htmlTableID: "smallBoardIntermediateTable",
            records: [
            {
                time: 30000,
                clicks: 20,
                nickname: "SmallIntermediate1"
            },
            {
                time: 35000,
                clicks: 25,
                nickname: "SmallIntermediate2"
            }
            ]
        },
        hard: {
            htmlTableID: "smallBoardHardTable",
            records: [
            {
                time: 30000,
                clicks: 20,
                nickname: "SmallHard1"
            },
            {
                time: 35000,
                clicks: 25,
                nickname: "SmallHard2"
            }
            ]
        },
    },
    medium: {
        easy: {
            htmlTableID: "mediumBoardEasyTable",
            records: [
            {
                time: 30000,
                clicks: 20,
                nickname: "MediumEasy1"
            },
            {
                time: 35000,
                clicks: 25,
                nickname: "MediumEasy2"
            }
            ]
        },
        intermediate: {
            htmlTableID: "mediumBoardIntermediateTable",
            records: [
            {
                time: 30000,
                clicks: 20,
                nickname: "MediumIntermediate1"
            },
            {
                time: 35000,
                clicks: 25,
                nickname: "MediumIntermediate2"
            }
            ]
        },
        hard: {
            htmlTableID: "mediumBoardHardTable",
            records: [
            {
                time: 30000,
                clicks: 20,
                nickname: "MediumHard1"
            },
            {
                time: 35000,
                clicks: 25,
                nickname: "MediumHard2"
            }
            ]
        },
    },
    large:{
        easy: {
            htmlTableID: "largeBoardEasyTable",
            records: [
            {
                time: 30000,
                clicks: 20,
                nickname: "LargeEasy1"
            },
            {
                time: 35000,
                clicks: 25,
                nickname: "LargeEasy2"
            }
            ]
        },
        intermediate: {
            htmlTableID: "largeBoardIntermediateTable",
            records: [
            {
                time: 30000,
                clicks: 20,
                nickname: "largeIntermediate1"
            },
            {
                time: 35000,
                clicks: 25,
                nickname: "largeIntermediate2"
            }
            ]
        },
        hard: {
            htmlTableID: "largeBoardHardTable",
            records: [
            {
                time: 30000,
                clicks: 20,
                nickname: "largeHard1"
            },
            {
                time: 35000,
                clicks: 25,
                nickname: "largeHard2"
            }
            ]
        },
    }
}

let tryGetLocal = localStorage.getItem("scoreboardsArray");
if(tryGetLocal == null) {
    console.log("localStorage not found!");
    console.log("Inserting placeholder scoreboards");
    localStorage.setItem("scoreboardsArray", JSON.stringify(scoreboards))
} else {
    console.log("localStorage found!");
    console.log("loading storagescoreboard into the system");
    scoreboards = JSON.parse(localStorage.getItem("scoreboardsArray"));
}

let tryGetSessionBoardSize = sessionStorage.getItem("boardSize");
if(tryGetSessionBoardSize == null) {
    console.log("Session BoardSize not found!");
    console.log("Inserting default");
    boardSize = 'm';
    sessionStorage.setItem("boardSize", boardSize)
} else {
    console.log("sessionStorage found!");
    console.log("loading boardSize into the system");
    boardSize = sessionStorage.getItem("boardSize")
}

let tryGetSessionGameDifficulty = sessionStorage.getItem("gameDifficulty");
if(tryGetSessionBoardSize == null) {
    console.log("Session gameDifficulty not found!");
    console.log("Inserting default");
    gameDifficulty = 'i';
    sessionStorage.setItem("gameDifficulty", gameDifficulty)
} else {
    console.log("sessionStorage found!");
    console.log("loading gameDifficulty into the system");
    gameDifficulty = sessionStorage.getItem("gameDifficulty");
}


function parseToTable(scoreboard){
    let scoreboardHtmlID = scoreboard.htmlTableID
    let records = scoreboard.records;
    let tableElement = document.getElementById(scoreboardHtmlID);
    let first = tableElement.firstElementChild.textContent;
    let lastElement = tableElement.lastChild.textContent;
    while(tableElement.firstElementChild.textContent != tableElement.lastElementChild.textContent){
        tableElement.removeChild(tableElement.lastChild);
    } 
    records.forEach(element => {

        let tableRecord = document.createElement("tr");

        let recordTime = document.createElement("td");
        recordTime.textContent = element.time;
        tableRecord.appendChild(recordTime);
        
        let recordClicks = document.createElement("td");
        recordClicks.textContent = element.clicks;
        tableRecord.appendChild(recordClicks);

        let recordUsername = document.createElement("td");
        recordUsername.textContent = element.nickname;
        tableRecord.appendChild(recordUsername);

        document.getElementById(scoreboardHtmlID).appendChild(tableRecord);
    });
    lastElement = tableElement.lastChild.textContent;
}

function parseSecoreboard(scoreboard){
    parseToTable(scoreboard.easy);
    parseToTable(scoreboard.intermediate);
    parseToTable(scoreboard.hard);
    
}

function populateScoreBoards(){
    let smallSB = scoreboards.small;
    parseSecoreboard(smallSB);
    let mediumSB = scoreboards.medium;
    parseSecoreboard(mediumSB);
    let largeSB = scoreboards.large;
    parseSecoreboard(largeSB);
}

function clickCard(cardID){
    //ignore the click if card already facing up
    if(document.getElementById(cardID).firstChild.style.opacity == "1"){
        return;
    }

    clicksThisRound +=1;
    numOfClicksBox.lastElementChild.textContent = clicksThisRound;

    if(interval == null) {
        interval = setInterval(updateTimer, intervalStep, intervalStep);
    }
    //unflip cards if next click happens before previously clicked cards dissapear on their own
    if(secondClicked != null){
        clearTimeout(timeout);
        unflipCards();
    }
    currentClick = cardID;
    let element = document.getElementById(cardID);
    element.firstChild.style.opacity = "1";
    //element.style.boxShadow = "1px 5px 11px 13px rgba(0,0,0,0.27)";
    console.log("Currently clicked ID: " + document.getElementById(cardID).id);
    if(firstClicked == null){
        firstClicked = currentClick;
        console.log("First Clicked updated");
        currentClick = null;
    }
    else {
        if(secondClicked == null){
            secondClicked = currentClick;
            currentClick = null;
            if(document.getElementById(firstClicked).textContent == document.getElementById(secondClicked).textContent){
                //if first and second clicked tiles contain the same emoji
                //add a match and clear history of clicks
                matchesCurrently +=1;
                firstClicked = secondClicked = null;
                
            } else {
                console.log("Create Timeout")
                timeout = setTimeout(unflipCards, timeoutMs);
            }
            
        }
        

    }
    
}

function getArrayOfEmojis(numberOfEmojis, theme = defaultTheme){
    let arrayOfEmojis = [];
    if(theme == defaultTheme){
        let range = (defaultTheme.end+1) - defaultTheme.start;
        while(arrayOfEmojis.length < numberOfEmojis){
            let candidateEmoji = Math.floor(Math.random()*range) + defaultTheme.start;
            /* If emoji isn't alerady in the list(is't a duplicate), add it to the list of emojis to use */
            console.log(arrayOfEmojis);
            if(arrayOfEmojis.indexOf(candidateEmoji) == -1){
                arrayOfEmojis.push(candidateEmoji);
            }
            
        }
    }
    console.log("Emojis chosen(len["+arrayOfEmojis.length+"]): "+arrayOfEmojis);
    return arrayOfEmojis;
}

function msToMinAndSecAndMillisec(ms){
    let minutes = Math.floor(ms/60000); //1minute == 60,000ms
    ms = ms%60000;
    let seconds = Math.floor(ms/1000);
    ms = ms%1000;
    let tenthsOfASeconds = Math.floor(ms/100);
    ms = ms%100;
    return [ms, tenthsOfASeconds, seconds, minutes];
}

function updateTimer(intervalStep){
    gameTime += intervalStep;
    let humanReadableTime = msToMinAndSecAndMillisec(gameTime);
    if(humanReadableTime[3] < 10){
        humanReadableTime[3] = "0"+humanReadableTime[3];

    }
    if(humanReadableTime[2] < 10){
        humanReadableTime[2] = "0"+humanReadableTime[2];

    }
    timerBox.lastElementChild.textContent = humanReadableTime[3]+":"+humanReadableTime[2]+"."+humanReadableTime[1];

}

function checkIfLeaderboardWorthy(scoreboard, time){
    let recordsArray = scoreboard.records;
    //compare game time to the times on the scoreboard, if the gametime is shorter, return where it would index on the list;
    for (let index = 0; index < recordsArray.length; index++) {
        console.log("compareTime: "+recordsArray[index].time+ " vs "+time);
        if(recordsArray[index].time > time){
            
            return index;
        }
    }
    //if there are empty spaces left, return the next available place to add the record at
    console.log("compareLen: "+recordsArray.length+ " vs "+numberOfScoresToKeep);
    if(recordsArray.length < numberOfScoresToKeep){
        return recordsArray.length;
    }
    else {
        //if the time isn't worthy of being on a table, return -1;
        return -1;
    }
}

function getCurrentLeaderboard(){
    let leaderboard = null;
    if (boardSize == 's'){
        leaderboard = scoreboards.small;
    } else if(boardSize == 'm') {
        leaderboard = scoreboards.medium;
    } else if(boardSize == 'l') {
        leaderboard = scoreboards.large;
    }
    else {return null}
    console.log(leaderboard);
    if (gameDifficulty == 'e') {
        return leaderboard.easy;
    } else if (gameDifficulty == 'i'){
        return leaderboard.intermediate;
        
    } else if (gameDifficulty == 'h'){
        return leaderboard.hard;
    }
    else {return null};
}

function addToLeaderboard(leaderboard, index, time, clicks, name){
    let newRecord = {
        time: time,
        clicks: clicks,
        nickname: name
    }
    leaderboard.records.splice(index, 0, newRecord);
    if(leaderboard.records.length > numberOfScoresToKeep){
        leaderboard.recordClicks = leaderboard.slice(0,numberOfScoresToKeep);
    }

    if (boardSize == 's'){
        if (gameDifficulty == 'e') {
        scoreboards.small.easy = leaderboard;
        } else if (gameDifficulty == 'i'){
        console.log("adding new score to intermidiate");
        scoreboards.small.intermediate = leaderboard;
        } else if (gameDifficulty == 'h'){
        scoreboards.small.hard = leaderboard;
        }
    } else if(boardSize == 'm') {
        if (gameDifficulty == 'e') {
        scoreboards.medium.easy = leaderboard;
        } else if (gameDifficulty == 'i'){
        console.log("adding new score to intermidiate");
        scoreboards.medium.intermediate = leaderboard;
        } else if (gameDifficulty == 'h'){
        scoreboards.medium.hard = leaderboard;
        }
    } else if(boardSize == 'l') {
        
        if (gameDifficulty == 'e') {
            scoreboards.large.easy = leaderboard;
            } else if (gameDifficulty == 'i'){
            console.log("adding new score to intermidiate");
            scoreboards.large.intermediate = leaderboard;
            } else if (gameDifficulty == 'h'){
            scoreboards.large.hard = leaderboard;
            }
    }
    console.log("got to end of add to leaderboard");
    localStorage.setItem('scoreboardsArray', JSON.stringify(scoreboards));
}

function endTheGame(){
    clearInterval(interval);
    let newIndex = checkIfLeaderboardWorthy(getCurrentLeaderboard(),gameTime);
    console.log("NEW INDEX = "+ newIndex);
    if(newIndex != -1){
        let leadboardPosition = newIndex + 1;
        let userName = prompt("You were fast enough to get onto the scorboard! Position: "+ leadboardPosition +". Please enter Your name, or don't, to be recorded as anonymous");
        if(userName == null || userName == ""){
            userName = "Anonymous";
        }
    console.log("running add to scoreboard");
    addToLeaderboard(getCurrentLeaderboard(), newIndex, gameTime, clicksThisRound, userName);
} else{
    window.alert("You won!");
    }
    populateScoreBoards();
}

function printContentToConsole(text){
    console.log(text);
}

function getAllCardIDs() {
    let IDsArr = [];
    let GameGrid = document.getElementById("CardGrid");
    let children = GameGrid.children;
    for (let index = 0; index < children.length; index++) {
        const element = children[index];
        IDsArr.push(element.id);
    };
    return IDsArr;
}

function createOnClick(ID) {
    document.getElementById(ID).onclick = function() {
        clickCard(ID);
        console.log("matches currently vs required: "+ matchesCurrently + " : " + matchesRequired);
        if(matchesCurrently == matchesRequired) {
            timeout = setTimeout(endTheGame, 75);
        }
    };

}

function assignOnClickToAllCards(cardIDs){
    cardIDs.forEach(createOnClick);
}

function unflipCards(){
    let firstCard = document.getElementById(firstClicked);
    let secondCard = document.getElementById(secondClicked);
    firstCard.firstChild.style.opacity = "0";
    secondCard.firstChild.style.opacity = "0";

    firstClicked = secondClicked = null;
    
}

function createGameBoard(size = 'm', difficulty = 'i'){
    //setup game board size
    if (size == 's'){
        GameGrid.style.gridTemplateColumns = "1fr 1fr 1fr";
        numOfCards = 6;
    }
    else if(size == 'm'){
        GameGrid.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
        numOfCards = 12;
    }
    else if(size == 'l'){
        GameGrid.style.gridTemplateColumns = "1fr 1fr 1fr 1fr 1fr";
        numOfCards = 20;
    }
    for (let index = 0; index < numOfCards; index++) {
        let card = document.createElement("card-obj");
        card.id = 'C' + index;
        let cardContent = document.createElement("card-image");
        card.appendChild(cardContent);
        GameGrid.appendChild(card);
    }
    console.log("difficulty "+difficulty);
    //set up game difficulty
    let cardIDs = getAllCardIDs();
    let numOfImgs;
    if(difficulty == 'e'){
        matchesRequired = cardIDs.length/2;
        console.log("Matches required: "+matchesRequired);
        numOfImgs = Math.ceil((matchesRequired)/2);
        console.log("numOfImgs required: "+numOfImgs);
    }
    else if(difficulty == 'i'){
        matchesRequired = cardIDs.length/2;
        numOfImgs = cardIDs.length/2;
    }
    else if(difficulty == 'h'){
        let numOfImgsWithoutAPair = numOfCards/3;
        numOfImgs = Math.ceil((cardIDs.length-numOfImgsWithoutAPair)/2);
        matchesRequired = numOfImgs;
    }

    //Assign emoji images to each of the cards
    let emojisToUse = getArrayOfEmojis(numOfImgs);
    if(difficulty == 'e'){
        
        for (let emojiIndex = 0; emojiIndex < emojisToUse.length; emojiIndex++) {
            console.log("Matches required"+matchesRequired);
            let numOfCardPerEmoji = Math.ceil(matchesRequired/emojisToUse.length)*2;
            if((numOfCardPerEmoji%2)>0){
                numOfCardPerEmoji++;
            }
            for(cardIndexer = 0; cardIndexer < numOfCardPerEmoji; cardIndexer++){
                if(cardIDs.length > 0){
                    console.log("Assigning emoji: '"+ String.fromCodePoint(emojisToUse[emojiIndex]) +"' to: ");
                let cardIndex = Math.floor(Math.random()*cardIDs.length);
                let tempID = cardIDs[cardIndex];
                console.log(tempID);
                document.getElementById(tempID).firstElementChild.textContent = String.fromCodePoint(emojisToUse[emojiIndex]);
                cardIDs.splice(cardIndex, 1);
                } else {
                    break;
                }
            }

            
        }
    }
    else if(difficulty == 'i'){
    for (let index = 0; index < emojisToUse.length; index++) {
        console.log("Assigning emoji: '"+ String.fromCodePoint(emojisToUse[index]) +"' to: ");
        let cardIndex = Math.floor(Math.random()*cardIDs.length);
        let tempID = cardIDs[cardIndex];
        console.log(tempID);
        document.getElementById(tempID).firstElementChild.textContent = String.fromCodePoint(emojisToUse[index]);
        cardIDs.splice(cardIndex, 1);
        cardIndex = Math.floor(Math.random()*cardIDs.length);
        tempID = cardIDs[cardIndex];
        console.log("and: ");
        console.log(tempID);
        document.getElementById(tempID).firstElementChild.textContent = String.fromCodePoint(emojisToUse[index]);
        cardIDs.splice(cardIndex, 1);
        //https://www.delftstack.com/howto/javascript/javascript-pick-random-from-array/#:~:text=Pick%20a%20Random%20Value%20From%20an%20Array%20Using,of%200%20to%20the%20length%20of%20the%20array.
        
        
    }
    }
    else if(difficulty == 'h'){
        let numOfImgsWithoutAPair = Math.floor(numOfCards/3);
        let cardsWithoutMatch = getArrayOfEmojis(numOfImgsWithoutAPair);
        for (let index = 0; index < cardsWithoutMatch.length; index++) {
            console.log("Assigning Unmatched emoji: '"+ String.fromCodePoint(cardsWithoutMatch[index]) +"' to: ");
            let cardIndex = Math.floor(Math.random()*cardIDs.length);
            let tempID = cardIDs[cardIndex];
            console.log(tempID);
            document.getElementById(tempID).firstElementChild.textContent = String.fromCodePoint(cardsWithoutMatch[index]);
            cardIDs.splice(cardIndex, 1);
        }
        console.log("numOfNoMatches: " + cardsWithoutMatch.length);
        console.log("cards left: " + cardIDs.length);
        console.log("matching emojis (x:2x): " + emojisToUse.length + " : " + emojisToUse.length*2);
        for (let index = 0; index < emojisToUse.length; index++) {
            console.log("Assigning emoji: '"+ String.fromCodePoint(emojisToUse[index]) +"' to: ");
            let cardIndex = Math.floor(Math.random()*cardIDs.length);
            let tempID = cardIDs[cardIndex];
            console.log(tempID);
            document.getElementById(tempID).firstElementChild.textContent = String.fromCodePoint(emojisToUse[index]);
            cardIDs.splice(cardIndex, 1);
            cardIndex = Math.floor(Math.random()*cardIDs.length);
            tempID = cardIDs[cardIndex];
            console.log("and: ");
            console.log(tempID);
            document.getElementById(tempID).firstElementChild.textContent = String.fromCodePoint(emojisToUse[index]);
            cardIDs.splice(cardIndex, 1);
            //https://www.delftstack.com/howto/javascript/javascript-pick-random-from-array/#:~:text=Pick%20a%20Random%20Value%20From%20an%20Array%20Using,of%200%20to%20the%20length%20of%20the%20array.
            
            
        }
    }
}

function markCurrentlySelectedSettings(){
    //Mark current board size
    if(boardSize == 's'){
        document.getElementById('small').checked = true;
        document.getElementById("boardSizeBox").lastElementChild.textContent="Small";
    }
    else if(boardSize == 'm'){
        document.getElementById('medium').checked = true;
        document.getElementById("boardSizeBox").lastElementChild.textContent="Medium";
    
    }
    else if(boardSize == 'l'){
        document.getElementById('large').checked = true;
        document.getElementById("boardSizeBox").lastElementChild.textContent="Large";
    
    }
    //Mark current difficulty
    if(gameDifficulty == 'e'){
        document.getElementById('easy').checked = true;
        document.getElementById("difficultyBox").lastElementChild.textContent="Easy";
    }   
    else if(gameDifficulty == 'i'){
        document.getElementById('intermediate').checked = true;
        document.getElementById("difficultyBox").lastElementChild.textContent="Intermediate";
    }
    else if(gameDifficulty == 'h'){
        document.getElementById('hard').checked = true;
        document.getElementById("difficultyBox").lastElementChild.textContent="Hard";
    
    }
}

function refreshPage(){
    window.location.reload();
}

function updateGameSettings(){
    console.log("updateSettings Triggered");
    let newSize;
    if(document.getElementById('small').checked == true){
        newSize = 's';
    } else if(document.getElementById('medium').checked == true){
        newSize = 'm';
    } else if(document.getElementById('large').checked == true){
        newSize = 'l';
    }
    console.log("newSize: "+ newSize);

    let newDifficulty;
    if(document.getElementById('easy').checked == true){
        newDifficulty = 'e';
    } else if(document.getElementById('intermediate').checked == true){
        newDifficulty = 'i';
    } else if(document.getElementById('hard').checked == true){
        newDifficulty = 'h';
    }
    console.log("newDifficulty: "+ newDifficulty);
    boardSize = newSize;
    gameDifficulty = newDifficulty;
    sessionStorage.setItem("boardSize", boardSize);
    sessionStorage.setItem("gameDifficulty", gameDifficulty);
    refreshPage();
}

createGameBoard(boardSize, gameDifficulty);
let cardIDs = getAllCardIDs();
assignOnClickToAllCards(cardIDs);
populateScoreBoards();
markCurrentlySelectedSettings();
const reloadButton = document.getElementById("restartButton");
reloadButton.addEventListener("click", refreshPage, false);
const applySettings = document.getElementById("applySettings");
applySettings.addEventListener("click", updateGameSettings, false);