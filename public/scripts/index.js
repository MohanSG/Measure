console.log("JS loaded");
const sentenceHeader = document.querySelector(".sentence-div");
const choiceOptions = document.querySelectorAll(".choices .pushable");
const menuButtons = document.querySelectorAll(".buttons");
const hintsButton = document.querySelector(".hints");

const sentenceContainer = document.querySelector(".sentence-container");
const welcomeContainer = document.querySelector(".welcome-container");
const resultsContainer = document.querySelector(".results-container");

const slider = document.querySelector(".hsk-slider");
const submitLevels = document.querySelector(".submit-levels");
const speedMode = document.querySelector(".speed-button");

let questionBuffer = [];
let currentMeasureWords = [];

let currentQuestion = null;
let currentAnswerButton = null;

let enableHints = false;
let correctAnswers = 0;

let speedModeActive = false;
let speedModeTimer = null;
let timeRemaining = 0;

let currentUser = null;

welcome();

//Button click event listener that checks the answer
choiceOptions.forEach(function (button) {
  button.addEventListener("click", function (event) {
    choiceOptions.forEach((button) => {
      button.disabled = true;
    });
    const innerHTML = button.children[0].innerHTML;
    const front = button.querySelector(".front");
    checkAnswer(innerHTML, front, currentAnswerButton);
  });
});

//For enabling or disabling pinyin and english definition hints
hintsButton.addEventListener("click", function () {
  const icon = hintsButton.children[0];
  icon.classList.toggle("active");
  enableHints = !enableHints;

  if (enableHints) {
    initHints();
  } else {
    disableHints();
  }
});

//Submit levels from welcome screen
submitLevels.addEventListener("click", function () {
  //const checked = document.querySelectorAll("input[name=level]:checked");
  const level = parseInt(slider.value);

  const levels = Array.from({ length: level }, (_, i) => i + 1);;
  // checked.forEach((level) => {
  //   levels.push(parseInt(level.value));
  // });
  if (levels.length > 0) {
    start(levels);
  }
  console.log(levels);
});

speedMode.addEventListener("click", async function () {
  if (await isLoggedIn()) {
    //const checked = document.querySelectorAll("input[name=level]");

    const levels = [1, 2, 3, 4, 5, 6, 7];

    //checked.forEach((level) => (level.checked = true));
    slider.value = 7
    setTimeout(() => {
      startSpeedMode(levels);
    }, 1000);
    
  } else {
    window.location.href = "/login";
    return;
  }
});

//Check if user is logged in on server side
async function isLoggedIn() {
  const response = await fetch("/auth/status", {
    credentials: "include",
  });
  const data = await response.json();
  return data.authenticated;
}

async function updateCurrentUser() {
  const response = await fetch("/userData", {
    credentials: "include",
  });
  const user = await response.json();
  currentUser = user.user;
}

//fetch call to grab random sentences for the array buffer (array, int)
async function getSentences(hsk_levels, amount) {
  try {
    const response = await fetch("/getSentences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        levels: hsk_levels,
        amount: amount,
      }),
    });
    if (response.ok) {
      const result = await response.json();
      return result.message;
    }
  } catch (error) {
    console.log(`An error occurred: ${error} `);
    return error;
  }
}

async function getMeasureWords(hsk_levels) {
  try {
    const response = await fetch("/getMeasureWords", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hsk_levels),
    });
    if (response.ok) {
      const result = await response.json();
      return result.message;
    }
  } catch (error) {
    console.log(`An error occurred: ${error} `);
    return error;
  }
}

async function welcome() {
  if (await isLoggedIn()) {
    await updateCurrentUser();
    console.log(currentUser);
  } else {
    console.log("Not logged in");
  }

  menuButtons.forEach((button) => {
    button.style.display = "none";
  });
  welcomeContainer.style.display = "flex";
  resultsContainer.style.display = "none";
  sentenceContainer.style.display = "none";
  welcomeContainer.style.opacity = 1;
  console.log("Home loaded");
  const welcomeElements = Array.from(welcomeContainer.children[0].children);
  console.log(welcomeElements);

  for (const [index, element] of welcomeElements.entries()) {
    setTimeout(() => {
      element.style.opacity = 1;
    }, 250 * (index + 1));
  }
}

//Start practice mode
async function start(levels) {
  correctAnswers = 0;
  menuButtons.forEach((button) => {
    button.style.display = "block";
  });
  welcomeContainer.style.display = "none";
  sentenceContainer.style.display = "flex";
  questionBuffer = await getSentences(levels, 20);
  currentQuestion = questionBuffer[0];
  currentMeasureWords = await getMeasureWords(levels);
  nextQuestion();
}

//Start speed mode - 30 seconds to answer as many questions as possible
async function startSpeedMode(levels) {
  speedModeActive = true;
  correctAnswers = 0;
  timeRemaining = 30;

  menuButtons.forEach((button) => {
    button.style.display = "block";
  });
  welcomeContainer.style.display = "none";
  sentenceContainer.style.display = "flex";
  questionBuffer = await getSentences(levels, 200);
  currentQuestion = questionBuffer[0];
  currentMeasureWords = await getMeasureWords(levels);
  nextQuestion();

  const timer = document.querySelector(".timer");
  timer.style.display = 'block';
  let timerWidth = timer.clientWidth;

  speedModeTimer = setInterval(() => {
    timeRemaining--;
    let newWidth = (timerWidth / 30) * timeRemaining
    timer.style.width = `${newWidth}px`
    console.log(newWidth)
    console.log(`Time remaining: ${timeRemaining}`);

    if (timeRemaining <= 0) {
      clearInterval(speedModeTimer);
      timer.style.width = '90%';
      timer.style.display = 'none';
      results();
    }
  }, 1000);
}

//At the end of practice or speed round, display number of correct answers
async function results() {
  sentenceContainer.style.display = "none";
  resultsContainer.style.display = "flex";

  document
    .querySelector(".again-button")
    .addEventListener("click", function () {
      welcome();
    });

  const resultsHeader = document.querySelector(".result-header");
  if (speedModeActive) {
    resultsHeader.innerHTML = `You scored ${correctAnswers}!`;
  } else {
    resultsHeader.innerHTML = `You scored ${correctAnswers}/20!`;
  }

  if (speedModeActive) {
    console.log(currentUser.highscore);
    console.log(correctAnswers);

    if (!currentUser.highscore || currentUser.highscore < correctAnswers) {
      console.log("New high score!");
      await updateHighScore(correctAnswers);
      await updateCurrentUser();
    }

    speedModeActive = false;
    reset();
    if (speedModeTimer) {
      clearInterval(speedModeTimer);
      speedModeTimer = null;
    }
  } else {
    reset();
  }
}

//Gets a random question and displays it with new set of answer options
function nextQuestion() {
  console.log(currentQuestion);

  initSentenceHeader(currentQuestion.sentence);
  initOptions(currentQuestion.answer, currentMeasureWords);
}

async function updateHighScore(score) {
  try {
    const response = await fetch("/updateHighScore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        score: score,
      }),
    });
    if (response.ok) {
      const result = await response.json();
      return result.message;
    }
  } catch (error) {
    console.log(
      `An error occurred when updating high score (front end): ${error} `
    );
    return error;
  }
}

//Set buttons for the next question
function initOptions(answer, characters) {
  let existingOptions = [];

  answerIndex = getRandomNumber(choiceOptions.length);
  currentAnswerButton = choiceOptions[answerIndex].children[0];
  currentAnswerButton.innerHTML = answer;

  existingOptions.push(answer);

  choiceOptions.forEach((button, index) => {
    //Ensures all options are unique
    const buttonText = button.children[0];
    if (index !== answerIndex) {
      let character = characters[getRandomNumber(characters.length)];

      while (existingOptions.includes(character)) {
        character = characters[getRandomNumber(characters.length)];
      }

      buttonText.innerHTML = character;
      existingOptions.push(character);
    }
  });
}

//Creates a div for each character
function initSentenceHeader(sentence) {
  const words = sentence.split(" ");
  const pinyin_words = currentQuestion.pinyinSentence.split(" ");

  words.forEach((word, index) => {
    if (word === "") {
      words.splice(index, 1);
    }
  });

  words.forEach((word, index) => {
    const newDiv = document.createElement("div");
    newDiv.classList.add("wordDiv");

    const wordHeader = document.createElement("h1");
    wordHeader.innerHTML = word;
    wordHeader.classList.add("sentence", "noto-sans-sc-normal");

    newDiv.append(wordHeader);
    sentenceHeader.append(newDiv);
  });

  if (enableHints) {
    initHints();
  }
}

//Enables hint for word
function initHints() {
  const headers = sentenceHeader.children;
  const sentence = currentQuestion.sentence.split(" ");

  sentence.forEach((word, index) => {
    if (word === "") {
      sentence.splice(index, 1);
    }
  });

  for (let i = 0; i < headers.length; i++) {
    if (sentence[i] !== "＿") {
      const tooltipText = document.createElement("span");
      tooltipText.classList.add("tool-tip-text-above");
      tooltipText.innerHTML = `${
        currentQuestion.pinyinSentence.split(" ")[i]
      }\n${currentQuestion.translOrder[i]}`;
      headers[i].append(tooltipText);
    }
  }
}

function disableHints() {
  const tooltips = document.querySelectorAll(".tool-tip-text-above");
  tooltips.forEach((tooltip) => {
    tooltip.remove();
  });
}

function checkAnswer(answer, front, answerButton) {
  console.log(`Speed Mode: ${speedModeActive}`);
  let delay = speedModeActive ? 500 : 1000;
  if (speedModeActive && timeRemaining <= 0) return;

  const correctColor = `hsla(116, 96%, 60%, 1.00)`;
  for (let div of sentenceHeader.children) {
    if (div.children[0].innerHTML === "＿") {
      div.children[0].innerHTML = currentQuestion.answer;
      div.children[0].style.backgroundColor = correctColor;
      div.children[0].style.borderRadius = "12px";
    }
  }

  sentenceHeader.innerHTML = sentenceHeader.innerHTML.replace(
    " ＿ ",
    ` ${answer} `
  );
  //correct answer
  if (answer === currentQuestion.answer) {
    correctAnswers += 1;
    console.log(`${correctAnswers}/20`);
    front.style.backgroundColor = correctColor;
    front.style.color = "white";
    //incorrect answer
  } else {
    console.log(`${correctAnswers}/20`);
    front.style.backgroundColor = "red";
    front.style.color = "white";
    answerButton.style.backgroundColor = correctColor;
  }

  questionBuffer.shift();
  setTimeout(() => {
    if (questionBuffer.length > 0 && (!speedModeActive || timeRemaining > 0)) {
      currentQuestion = questionBuffer[0];
      reset();
      nextQuestion();
    } else {
      results();
    }
  }, delay);
}

function reset() {
  sentenceHeader.innerHTML = "";
  resetButtonStyles();
  choiceOptions.forEach((button) => {
    button.disabled = false;
  });
}

function resetButtonStyles() {
  choiceOptions.forEach((button) => {
    const child = button.children[0];
    child.style.backgroundColor = `hsla(0, 0%, 100%, 1.00)`;
    child.style.color = "black";
    child.innerHTML = "";
  });
}

//Gets a random number between 0 and specified number, mostly for initiating buttons
function getRandomNumber(number) {
  return Math.floor(Math.random() * number);
}
