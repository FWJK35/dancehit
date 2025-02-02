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
    
    Returns:
        A dictionary mapping each beat timestamp (in seconds) to a list of numbers.
    """
    # Load the audio file and extract waveform data and sample rate.
    y, sr = librosa.load(audio_file, sr=None)
    
    # Detect beats in the audio file.
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    
    # Convert beat frames to time values (in seconds).
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    
    # Define the pool of possible numbers.
    possible_numbers = [-3, -2, -1, 0, 1, 2, 3]
    
    # Define the probabilities for list lengths:
    # 1 number: 30%, 2 numbers: 50%, 3 numbers: 20%.
    length_choices = [1, 2, 3]
    length_weights = [0.3, 0.5, 0.2]
    
    # Helper function to check for conflict constraints.
    def violates_constraint(num_list):
        # Cannot have both positive 2 and 3.
        if 2 in num_list and 3 in num_list:
            return True
        # Cannot have both negative 2 and -3.
        if -2 in num_list and -3 in num_list:
            return True
        return False

    # Generate the hashmap with beat timestamps as keys and the corresponding list of numbers as values.
    steps_dict = {}
    for beat in beat_times:
        # Determine how many numbers to generate based on the probability distribution.
        list_length = random.choices(length_choices, weights=length_weights, k=1)[0]
        # Use random.sample (sampling without replacement) to ensure no repeats,
        # and re-sample if the generated list violates the constraint.
        while True:
            step_numbers = random.sample(possible_numbers, list_length)
            if not violates_constraint(step_numbers):
                break
        steps_dict[beat] = step_numbers
    
    return steps_dict

if __name__ == "__main__":
    # Specify the paths to your two audio files.
    print("Running process_audio.py...")
    if len(sys.argv) != 3:
        print("Usage: python process_audio.py <input_file> <output_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    beat_steps = generate_ddr_steps(input_file)

    # audio_path_1 = "Songs/Travis Scott - FE!N ft. Playboi Carti.mp3"  # Replace with your first audio file path
    # audio_path_2 = "Songs/BTS - Dynamite .mp3"  
    # audio_path_3 = "Songs/Miley Cyrus - Party In The U.S.A .mp3" 

    # Generate the DDR steps hashmap for the first music file.
    # beat_steps_1 = generate_ddr_steps(audio_path_1)
    
    # # Generate the DDR steps hashmap for the second music file.
    # beat_steps_2 = generate_ddr_steps(audio_path_2)
    # beat_steps_3 = generate_ddr_steps(audio_path_3)
    with open(output_file, "w") as f:
        json.dump(beat_steps, f, indent=4)

    # with open("FEIN.json", "w") as f:
    #     json.dump(beat_steps_1, f, indent=4)

# Save the second hashmap to a JSON file.
    # with open("Dynamite.json", "w") as f:
    #  json.dump(beat_steps_2, f, indent=4)
    # with open("Party in the USA.json", "w") as f:
    #  json.dump(beat_steps_2, f, indent=4)
    # print("Hashmaps saved as JSON files.")
    # # Print the hashmap for the first music file.
    # print("Hashmap for the first music file:")
    # for timestamp, numbers in beat_steps_1.items():
    #     print(f"{timestamp:.2f}s -> {numbers}")
    
    # print("\nHashmap for the second music file:")
    # for timestamp, numbers in beat_steps_2.items():
    #     print(f"{timestamp:.2f}s -> {numbers}")
