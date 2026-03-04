# Measure
<div>
  <img height="150" alt="logo" src="https://github.com/user-attachments/assets/d41bb4e8-6abe-4ada-a9b1-ac768e8ba160" />
</div>
<a href="https://github.com/MohanSG/Measure">Github</a>
<br>

## Technologies Used
<div>
  <ul>
    <li>HTML/CSS/JS</li>
    <li>Node/Expressjs/EJS</li>
    <li>Postgres</li>
  </ul>
</div>

## What is measure?
<div style="margin-bottom: 10">
Measure is website for practicing chinese measure words. Chinese measure words are essential classifiers used between a number/denominator and a noun. Measure allows users to practice at their
own HSK level as well as compete with others using the speed mode. Users are able to register and login to an account and try to place on the top 10 leaderboards. Measure in its current form is a
very simple tool mainly used for practice rather than learning. Measure is fully responsive and comfortable to use on both desktops and mobile. 
</div>

<div>
  <img height="350" alt="Homepage" src="https://github.com/user-attachments/assets/d2b5b2c6-aa75-4de3-b7b0-fa29e90ee7f1" />
  <img height="350" alt="image" src="https://github.com/user-attachments/assets/3439e309-3d13-4391-8b94-362cdf7dbed7" />
</div>

## Practice Mode
<div>
  Practice mode allows users to answer gap-fill questions after choosing their desired HSK level. In this mode, users go at their own pace to answer 20 questions. At the end, their score is given
  and they are given the option to try again. If help is needed, a translate button is available which shows the pinyin and english for any hovered word. This button can be toggled on/off at any time
  during the quiz. 
</div>
<div>
  <img height="200" alt="Practice-Mode" src="https://github.com/user-attachments/assets/ed8580d7-ed24-4828-b4a1-8de234fe3606" />
  <img height="200" alt="Practice-Recording" src="https://github.com/user-attachments/assets/54460a06-e7f2-4fa8-ab63-117c9d288cfd"/>
</div>

## Speed Mode
<div>
  Speed mode is similar to practice mode except for a few changes. First, a 30 second time constraint is now placed on the user, the time taken for the next question to be displayed is decreased and the user now needs to be logged in. The aim is to answer as many questions as possible before the 30 seconds is up. After the speed mode session is complete, if the user doesn't have a previous hiscore or they have beaten their previous score, their hiscore will be updated in the database. The leaderboards will then be checked to see if they are eligible to be placed in the top 10. Speed mode also requires users to answer questions for all hsk levels as there is currently only one leaderboard. In the future, I would like to add a leaderboard for each HSK level. 
</div>
  
<div>
  <img height="350" alt="image" src="https://github.com/user-attachments/assets/b0f57b59-1805-4cb3-9161-e5460182b696" />
</div>

## Leaderboard
<div>
  The leaderboard shows the current top 10 scorers. As I mentioned earlier, speed mode requires users to answer questions for all hsk levels. This is the most fair way to place users as there is only one leaderboard. In the future, I would like to add a leaderboard for each HSK level.
</div>

<div>
  <img height="350" alt="Screenshot 2026-03-04 151410" src="https://github.com/user-attachments/assets/f54fecdd-fee9-46ce-bcd5-b57f80c6f783" />
</div>

## Register/Login
<div>
  Users have the ability to use the practice mode without authentication. For speed mode, authentication is needed to for leaderboards and saving scores. I used a local passport session strategy to achieve this. In the future, I would like to add Oauth authentication too. 
</div>

<div>

<img height="350" alt="Screenshot 2026-03-04 153002" src="https://github.com/user-attachments/assets/dc562571-5be1-43dd-a175-089f80229b5b" />
<img height="350" alt="Screenshot 2026-03-04 153035" src="https://github.com/user-attachments/assets/5933ab3f-f985-4781-8e69-5df64f6e841d" />

</div>
