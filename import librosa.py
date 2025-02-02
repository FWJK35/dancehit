import librosa
import numpy as np
import random

def generate_ddr_steps(audio_file: str) -> dict:
    """
    Processes the given audio file to detect beats and generates for each beat a list
    of numbers (from the set [-3, -2, -1, 0, 1, 2, 3]) according to the following length
    distribution:
        - 1 number: 30% chance
        - 2 numbers: 50% chance
        - 3 numbers: 20% chance

    Additionally:
        - No number is repeated in any generated list.
        - The list must not contain both -2 and -3 or both 2 and 3 simultaneously.
    
    Returns:
        A dictionary mapping each beat timestamp (in seconds) to a list of numbers.
    """
    # Load the audio file and extract waveform data and sample rate.
    y, sr = librosa.load(audio_file, sr=None)
    
    # Detect beats in the audio file.
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    
    # Convert beat frames to actual time values (in seconds).
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    
    # Define the pool of possible numbers.
    possible_numbers = [-3, -2, -1, 0, 1, 2, 3]
    
    # Define the probabilities for list lengths:
    # 1 number: 30%, 2 numbers: 50%, 3 numbers: 20%.
    length_choices = [1, 2, 3]
    length_weights = [0.3, 0.5, 0.2]
    
    # Helper function to check if a list violates the constraint.
    def violates_constraint(num_list):
        # Cannot have both 2 and 3.
        if 2 in num_list and 3 in num_list:
            return True
        # Cannot have both -2 and -3.
        if -2 in num_list and -3 in num_list:
            return True
        return False

    # Generate the hashmap with beat timestamps as keys and the corresponding list of numbers as values.
    steps_dict = {}
    for beat in beat_times:
        # Choose how many numbers to generate for this beat.
        list_length = random.choices(length_choices, weights=length_weights, k=1)[0]
        # Use random.sample to ensure no repeats; re-sample if the list violates the constraint.
        while True:
            step_numbers = random.sample(possible_numbers, list_length)
            if not violates_constraint(step_numbers):
                break
        steps_dict[beat] = step_numbers
    
    return steps_dict

if __name__ == "__main__":
    # Specify the path to the audio file to analyze.
    audio_path = "Songs/Travis Scott - FE!N ft. Playboi Carti.mp3"  # Replace with your audio file path
    
    # Generate the beat-to-number mapping.
    beat_steps = generate_ddr_steps(audio_path)
    
    # Print the resulting hashmap.
    print("Beat timestamps and corresponding number lists:")
    for timestamp, numbers in beat_steps.items():
        print(f"{timestamp:.2f}s -> {numbers}")
