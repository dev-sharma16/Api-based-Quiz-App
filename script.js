document.addEventListener("DOMContentLoaded", () => {
    loadPlyr();
});

// 1.basic js only for ui elements
document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    // Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs & contents
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            // Activate the clicked tab
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });
});

// 2. api url geneeration on selected option
let apiURL = 'https://opentdb.com/api.php?amount=10&category=19&difficulty=medium&type=multiple'

const catDiv = document.getElementById('category')
const diffDiv = document.getElementById('difficulty')
const submtBtn = document.getElementById('startGame')
function genApiUrl(){
    let sltCat = catDiv.value; 
    let sltDiff = diffDiv.value;

    apiURL = `https://opentdb.com/api.php?amount=10&category=${sltCat}&difficulty=${sltDiff}&type=multiple`;

   console.log(apiURL);
   apiCall();
   console.log("fetching data");
   
}
submtBtn.addEventListener('click',()=>{
    genApiUrl()
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

    document.getElementById("gameUP").classList.add("active"); 
    document.getElementById("game").classList.add("active"); 
})

// 3.storing api data
let quizQuestion="";
let quizData="";
async function apiCall(){
    try{
        let response = await fetch(apiURL)
        if (response.status === 429) {
            throw new Error("Too Many Requests. Wait and try again.");
        }
        let data = await response.json();
        quizQuestion = data.results[0];
        quizData = data
        console.log("Fetched Question: ", quizQuestion);
        console.log(quizData);
        fetchQues();
    }
    catch{
        console.log("Api cant Fetch Data,TRY AGAIN..!");
        
    }

}

// 4.displaying stored questions and storing name and score and displaying completion message
let currentQuestionIndex = 0;
let correctAns = "";
// const sbtmNm = document.getElementById('submitName')
let storedName = "";
let players = [];

const addPlyr = ()=>{
    localStorage.setItem("players",JSON.stringify(players))
}

function fetchQues(){
    const quizCont = document.getElementById('quiz-container')
    if (currentQuestionIndex >= quizData.results.length) {
        quizCont.innerHTML = `
            <h2>Quiz is Completed..!</h2>
            <h3>Score: ${correctChoice}/10</h3>
            <input id="nameScr" type="text" placeholder="Enter your Name">
            <button id="submitName">Submit Answer</button>
        `;

        alert("Quiz Completed!");

        setTimeout(() => {
            const sbtmNm = document.getElementById('submitName'); // Get button after it exists
            sbtmNm.addEventListener('click', () => {
                storedName = document.getElementById('nameScr').value; // Get input value
                console.log("Stored Name:", storedName);

                document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
                document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
            
                document.getElementById("scoreboardUP").classList.add("active"); 
                document.getElementById("scoreboard").classList.add("active"); 

                if(storedName){
                    players.push({name:storedName , score:correctChoice})
                    console.log(players);
                }
                
                displayScore();
                addPlyr();
            });
        }, 0);

        return;
    }
    try{
        if (!quizQuestion) {
            console.log("No question data available.");
            return;
        }
        let quizQues = quizData.results[currentQuestionIndex];
        
        correctAns = quizQues.correct_answer;
        
        let allAnswers = [...quizQues.incorrect_answers, quizQues.correct_answer];
        allAnswers = allAnswers.sort(() => Math.random() - 0.5);
        
        let question = document.getElementById('question');
        question.innerHTML =  `<p>${quizQues.question}</p>`
        
        let optionsContainer = document.getElementById('options') 
        const noGm = document.getElementById('noGm')
        optionsContainer.innerHTML = ""; 
        noGm.innerHTML = "";
        allAnswers.forEach((answer) => {
            let optionHTML = `
                <label class="option">
                    <input type="radio" name="answer" value="${answer}">
                    <span>${answer}</span>
                </label>
            `;
            optionsContainer.innerHTML += optionHTML;
        });
    }
    catch{
        console.log("The question can't be fetched..!!,TRY AGAIN");    
    }

}

// 5.quis answer submission
let submitAnswer = document.getElementById('submitAnswer')
let correctChoice = 0;
submitAnswer.addEventListener('click',()=>{
    let selectedOption = document.querySelector('input[name="answer"]:checked')

    if(!selectedOption){
        alert("Please select an Option..!")
        return;
    }
    
    let selectedAnswer = selectedOption.value;

    if(selectedAnswer===correctAns){
        alert("✅ Correct Answer!")
        correctChoice++
    }
    else {
        alert(`❌ Wrong! Correct Answer: ${correctAns}`);
    }

    setTimeout(()=>{
        currentQuestionIndex++
        fetchQues();
    },500);
})

// 6.add a div in scoreboard of previous player
const scoreBd = document.getElementById('scoreboard')

function displayScore(){
    const plyrsList = document.getElementById('plyrsList')
    const noSc = document.getElementById('noSc')
  try{
     plyrsList.innerHTML = ""; 
     noSc.innerHTML = "";

     players.sort((a, b) => b.score - a.score);

     players.forEach((plyr)=>{
         let playerDiv = document.createElement("div");
         playerDiv.classList.add("player"); 

         playerDiv.innerHTML=`
            <p>${plyr.name}</p>
            <p>${plyr.score}/10</p>
         `;
        
         plyrsList.appendChild(playerDiv)
         console.log("child is appended..!");
         
       })
    }
    catch(error){
        console.log("Cant display players ,ERROR : ",error);
        
    }
    
}

// 7.loading playes from local storage
const loadPlyr = () => {
    let storedPlayers = localStorage.getItem("players");
    if (storedPlayers) {
        players = JSON.parse(storedPlayers);
        displayScore(); // ✅ Display scores after loading data
    }
};