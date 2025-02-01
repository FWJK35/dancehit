import cv2
import mediapipe as mp
import numpy as np
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

leftHandCounter = 0
rightHandCounter = 0
leftFootCounter = 0
rightFootCounter = 0


def inside(rect, handArr):
    for part in handArr:
        # print(part)
        # print(rect)
        if(part[0] > rect[0][0] and part[0] < rect[1][0] and part[1] > rect[0][1] and part[1] < rect[1][1]):
                return True
    
    return False

cap = cv2.VideoCapture(0)

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

## Setup mediapipe instance
with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    while cap.isOpened():
        ret, frame = cap.read()

        if(not ret):
            break

        start_point = (100, 100)  # (x, y) top-left
        end_point = (300, 300)  # (x, y) bottom-right

        rect = [[100, 100], [400, 400]]

        # Draw the rectangle (BGR color, thickness)
        color = (0, 0, 255)  # Red
        thickness = 5  # Thickness of 2 pixels

        cv2.rectangle(frame, start_point, end_point, color, thickness)


        # Define text and position
        text1 = "Left Hand Counter: " + str(leftHandCounter)
        text2 = "Right Hand Counter: " + str(rightHandCounter)
        text3 = "Left Counter: " + str(leftHandCounter)
        text4 = "Left Hand Counter: " + str(leftHandCounter)
        
        position1 = (1700, 50)  # (x, y) position in pixels
        position2 = (1700, 150)  # (x, y) position in pixels
        position3 = (1700, 250)  # (x, y) position in pixels
        position4 = (1700, 350)  # (x, y) position in pixels
        

        # Define font, scale, color, and thickness
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 1
        color = (0, 0, 0)  # Green color in BGR
        thickness = 4

        # Put text on the frame
        cv2.putText(frame, text, position1, font, font_scale, color, thickness, cv2.LINE_AA)
        cv2.putText(frame, text, position1, font, font_scale, color, thickness, cv2.LINE_AA)
        cv2.putText(frame, text, position1, font, font_scale, color, thickness, cv2.LINE_AA)
        cv2.putText(frame, text, position1, font, font_scale, color, thickness, cv2.LINE_AA)
        

        # Recolor image to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        # Make detection
        results = pose.process(image)

        try:
            landmarks = results.pose_landmarks.landmark

            wristR = [int(landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x * width), int(landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y * height)]
            pinkyR = [int(landmarks[mp_pose.PoseLandmark.RIGHT_PINKY.value].x * width), int(landmarks[mp_pose.PoseLandmark.RIGHT_PINKY.value].y * height)]
            indexR = [int(landmarks[mp_pose.PoseLandmark.RIGHT_INDEX.value].x * width), int(landmarks[mp_pose.PoseLandmark.RIGHT_INDEX.value].y * height)]
            thumbR = [int(landmarks[mp_pose.PoseLandmark.RIGHT_THUMB.value].x * width), int(landmarks[mp_pose.PoseLandmark.RIGHT_THUMB.value].y * height)]
            
            wristL = [int(landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x * width), int(landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y * height)]
            pinkyL = [int(landmarks[mp_pose.PoseLandmark.LEFT_PINKY.value].x * width), int(landmarks[mp_pose.PoseLandmark.LEFT_PINKY.value].y * height)]
            indexL = [int(landmarks[mp_pose.PoseLandmark.LEFT_INDEX.value].x * width), int(landmarks[mp_pose.PoseLandmark.LEFT_INDEX.value].y * height)]
            thumbL = [int(landmarks[mp_pose.PoseLandmark.LEFT_THUMB.value].x * width), int(landmarks[mp_pose.PoseLandmark.LEFT_THUMB.value].y * height)]

            rightHand = [wristR, pinkyR, indexR, thumbR]
            leftHand = [wristL, pinkyL, indexL, thumbL]
            
            if inside(rect, rightHand):
                rightHandCounter += 1
            if inside(rect, leftHand):
                leftHandCounter -= 1
         
        except:
            pass

        # Recolor back to BGR
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Render detections
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                                mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
                                 )               

        cv2.imshow('Mediapipe Feed', image)

        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()