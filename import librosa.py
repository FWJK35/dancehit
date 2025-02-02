import librosa
import librosa.display
import numpy as np
import matplotlib.pyplot as plt
import random

def generate_ddr_steps(audio_file: str, bpm_threshold: int = 120):
    # Load the audio file and extract waveform data and sample rate
    y, sr = librosa.load(audio_file, sr=None)
    
    # Detect beats in the audio file
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    
    # Ensure tempo is a single numerical value (handling NumPy array output)
    if isinstance(tempo, np.ndarray):
        tempo = tempo[0] if tempo.size > 0 else 0
    
    # Convert beat frames to actual time values (in seconds)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    
    # Define DDR step choices (Up, Down, Left, Right)
    ddr_moves = ['⬆️', '⬇️', '⬅️', '➡️']
    
    # Extract spectral features to influence DDR steps
    rms = librosa.feature.rms(y=y)[0]  # Root Mean Square (Energy)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]  # Brightness
    
    # Normalize features
    rms = (rms - np.min(rms)) / (np.max(rms) - np.min(rms))
    spectral_centroid = (spectral_centroid - np.min(spectral_centroid)) / (np.max(spectral_centroid) - np.min(spectral_centroid))
    
    # Generate DDR steps based on detected beats and audio features
    ddr_steps = []
    for i, beat in enumerate(beat_times):
        index = min(i, len(rms) - 1)
        energy = rms[index]
        brightness = spectral_centroid[index]
        
        steps = []
        
        # **Move Selection Logic**
        if energy > 0.8:
            # High energy = rapid, strong moves (3-4 moves at a time)
            steps = random.sample(ddr_moves, k=random.choice([3, 4]))
        elif energy > 0.6:
            # Moderate energy = 2 moves per beat
            steps = random.sample(ddr_moves, k=2)
        elif energy > 0.4:
            # Lower energy = 1 move per beat
            steps = [random.choice(ddr_moves)]
        else:
            # Low energy = occasional steps, mostly rests
            steps = [random.choice(ddr_moves)] if random.random() > 0.5 else []
        
        # Add variation based on brightness
        if brightness > 0.7:
            steps.append('➡️') if '➡️' not in steps else None  # Bias towards rightward movement
        elif brightness < 0.1:
            steps.append('⬅️') if '⬅️' not in steps else None  # Bias towards leftward movement
        
        # Ensure unique moves (no duplicate moves in a single beat)
        steps = list(set(steps))

        ddr_steps.append((beat, steps))
    
    return tempo, ddr_steps

def visualize_ddr_steps(ddr_steps):
    # Extract beat times and corresponding DDR steps
    times, steps = zip(*ddr_steps)
    
    # Create a plot to visualize DDR steps
    plt.figure(figsize=(10, 4))
    plt.eventplot(times, orientation='horizontal', linelengths=0.8, color='b')
    
    # Annotate the steps on the visualization
    for i, (time, step) in enumerate(ddr_steps):
        plt.text(time, 1, ''.join(step), fontsize=12, ha='center', va='center')
    
    # Label the axes and title
    plt.xlabel("Time (seconds)")
    plt.ylabel("DDR Steps")
    plt.title("DDR Step Chart")
    plt.grid()
    plt.show()

if __name__ == "__main__":
    # Specify the path to the audio file to analyze
    audio_path = "C:/Users/aksha/Downloads/Coldplay - A Sky Full Of Stars (Official audio).mp3" # Replace with your audio file path
    
    # Generate DDR steps based on the detected beat pattern
    tempo, ddr_steps = generate_ddr_steps(audio_path)
    
    # Display the detected tempo and corresponding DDR steps
    print(f"Detected Tempo: {float(tempo):.2f} BPM")
    print("DDR Steps:")
    for beat, steps in ddr_steps:
        print(f"{beat:.2f}s -> {', '.join(steps)}")
    
    # Visualize the DDR steps in a timeline
    visualize_ddr_steps(ddr_steps)
