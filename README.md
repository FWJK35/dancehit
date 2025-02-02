## Inspiration
Inspired by classic arcade games like Dance Dance Revolution and Just Dance, we wanted to make an accessible program that requires no stage for those who can not afford arcade points, are too far away from an arcade, or simply enjoy the convenience of home. We were additionally motivated to fix the limitations of these types of stage games, which only have a limited selection of playable music options and have a high energy input. 

## What it does
The user is first asked to input a song of their choice, which the program uses to generate a unique move pattern based on the song's rhythm and chorus. Once the user is ready, they can begin the dancing. Arrows enter the screen, signaling to the user which moves they must complete in each given moment. If they are able to do them successfully, their game score increments accordingly. Once the song ends, they are given a final score, indicating how many of the dance moves they hit successfully.

## How we built it
The front end of the website uses HTML, JavaScript, and CSS to include all the content components and provide an aesthetic UI. The back end of the website is coded with JavaScript and Python. It uses two machine learning package, posenet and librosa, to accomplish the more complex tasks of computer vision and customized beat generation. Render was used for deployment, and GitHub was used for source control.

## Main challenges we ran into
1. The audio processing package, librosa, did not have built-in functions to recognize the chorus and beat drops of a song. We had to manually create our own functions and test a lot of different methods to create special move patterns for these song regions, which took a lot of time and testing. 

2. Despite not knowing Javascript, to get the camera feed and frame rate to work efficiently, we needed to use the posenet package on Javascript, which was a major learning and understanding challenge. Furthermore, many of our programmers had never done web development using React, making the sliding figures an especially struggling feature to implement.

## Accomplishments that we're proud of
Firstly, the video and computer vision software runs flawlessly without lag on the website, which was a major achievement given the amount of computation that is required for each frame. Furthermore, the user can input any song and receive a uniquely generated beat pattern based on its characteristics, fixing a problem that the industry still has not solved. The user can also do hand and feet motion, rather than just feet motion in more classic Arcade games.

## What we learned
Individually, we each learned how to improve our web developments skills, both to include content and to aesthetically format it for users. Many of our teammates learned how to use machine learning and computer vision packages, while others learned how to work with servers and connect the front end with the back end. Given the video game format of our project, we all took key takeaways in general game logic and how to design one with many interconnected parts.

## What's next for Pocket Dance
We want to include visual animations on the video screen for when a user hits an arrow, along with a pose recognition system that identifies dances and provides extra points based on specific moves and combinations. Furthermore, we hope to add leaderboards and a multiplayer feature in the future.
