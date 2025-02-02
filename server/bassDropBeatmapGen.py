

import librosa
import random
import json
import sys

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
        - No more than one DDR moves list is generated per second (if multiple beats occur in the same second, only the first is used).

    Returns:
        A dictionary mapping each beat timestamp (in seconds) to a list of numbers.
    """
    # Load the audio file and detect beats.
    y, sr = librosa.load(audio_file, sr=None)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    
    # Filter the beats: keep at most one beat per second.
    filtered_beats = []
    last_sec = None
    for beat in beat_times:
        current_sec = int(beat)  # floor to an integer second
        if last_sec is None or current_sec != last_sec:
            filtered_beats.append(beat)
            last_sec = current_sec
        # Else: skip this beat because it's in the same second as the previous one.

    # Define the pool of possible numbers.
    possible_numbers = [-3, -2, -1, 0, 1, 2, 3]
    
    # Define the probabilities for list lengths:
    # 1 number: 30%, 2 numbers: 50%, 3 numbers: 20%.
    length_choices = [1, 2, 3]
    length_weights = [0.3, 0.5, 0.2]
    
    # Helper function to check for conflict constraints.
    def violates_constraint(num_list):
        # Cannot have both 2 and 3.
        if 2 in num_list and 3 in num_list:
            return True
        # Cannot have both -2 and -3.
        if -2 in num_list and -3 in num_list:
            return True
        return False

    # Generate DDR moves for the filtered beats.
    steps_dict = {}
    for beat in filtered_beats:
        # Choose how many moves to generate based on the probability distribution.
        list_length = random.choices(length_choices, weights=length_weights, k=1)[0]
        # Generate the move list without repeats and check constraints.
        while True:
            step_numbers = random.sample(possible_numbers, list_length)
            if not violates_constraint(step_numbers):
                break
        steps_dict[beat] = step_numbers

    return steps_dict

if __name__ == "__main__":
    # Check for command-line arguments.
    if len(sys.argv) != 3:
        print("Usage: python process_audio.py <input_audio_file> <output_text_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Generate DDR moves for the input file.
    beat_steps = generate_ddr_steps(input_file)
    
    # Write the DDR moves to a plain text file.
    with open(output_file, "w") as f:
        # Sort the beats to keep the output in chronological order.
        for beat_time in sorted(beat_steps.keys()):
            moves = beat_steps[beat_time]
            # Format the beat time to 2 decimal places.
            f.write(f"{beat_time:.2f}s -> {moves}\n")
    
    # print(f"DDR moves written to {output_file}")

