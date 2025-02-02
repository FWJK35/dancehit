import librosa
import numpy as np
import matplotlib.pyplot as plt
import random
import json
import sys

##############################
# Peak Detection by Window
##############################
def detect_peaks_by_window(audio_file: str,
                           hop_length: int = 512,
                           window_duration: float = 5.0,
                           threshold_multiplier: float = 1.5):
    """
    Loads an audio file, computes its RMS energy, and then divides the song into non-overlapping
    windows of length window_duration (in seconds). For each window, if its average RMS is greater 
    than threshold_multiplier times the overall RMS average, the start time of that window is marked as a peak.
    
    Parameters:
        audio_file (str): Path to the audio file.
        hop_length (int): Number of samples between successive RMS frames.
        window_duration (float): Duration (in seconds) of each window.
        threshold_multiplier (float): Multiplier for the overall RMS average to define the threshold.
    
    Returns:
        overall_avg (float): Overall average RMS of the song.
        threshold (float): The computed threshold (threshold_multiplier × overall_avg).
        times (np.array): Time stamps for each RMS frame.
        rms (np.array): RMS energy per frame.
        peak_times (list): List of times (in seconds) marking the start of each window that qualifies as a peak.
        peak_indices (list): List of frame indices corresponding to the detected peaks.
    """
    # 1. Load audio and compute RMS.
    y, sr = librosa.load(audio_file, sr=None)
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)
    
    # 2. Compute overall average RMS and the threshold.
    overall_avg = np.mean(rms)
    threshold = threshold_multiplier * overall_avg
    
    # 3. Determine the number of frames corresponding to a window_duration.
    frames_per_window = int(round(window_duration * sr / hop_length))
    
    peak_times = []
    peak_indices = []
    
    # 4. Process the RMS in non-overlapping windows.
    n_windows = len(rms) // frames_per_window
    for i in range(n_windows):
        start_idx = i * frames_per_window
        end_idx = start_idx + frames_per_window
        window_avg = np.mean(rms[start_idx:end_idx])
        if window_avg > threshold:
            peak_times.append(times[start_idx])
            peak_indices.append(start_idx)
    
    return overall_avg, threshold, times, rms, peak_times, peak_indices

##############################
# DDR Moves Generation
##############################
def generate_ddr_steps_with_peaks(audio_file: str,
                                  peak_intervals,
                                  default_weights=(0.3, 0.5, 0.2),
                                  peak_weights=(0.1, 0.4, 0.5)):
    """
    Processes the given audio file to detect beats and generates for each beat a list
    of numbers (from the set [-3, -2, -1, 0, 1, 2, 3]). If a beat occurs during a
    detected peak interval, a "hard" probability distribution is used (favoring 2 or 3 moves).
    Otherwise, a default distribution is used.
    
    The distributions are defined by:
        - default_weights: (chance for 1 number, 2 numbers, 3 numbers)
        - peak_weights: (chance for 1 number, 2 numbers, 3 numbers) during peaks
    
    Additionally:
        - No number is repeated in any generated list.
        - The list must not contain both -2 and -3 or both 2 and 3 simultaneously.
    
    Returns:
        steps_dict (dict): A dictionary mapping each beat timestamp (in seconds) to a list of numbers.
    """
    # Load the audio file and detect beats.
    y, sr = librosa.load(audio_file, sr=None)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    
    # Define the pool of possible numbers.
    possible_numbers = [-3, -2, -1, 0, 1, 2, 3]
    length_choices = [1, 2, 3]
    
    # Helper function to check conflict constraints.
    def violates_constraint(num_list):
        if 2 in num_list and 3 in num_list:
            return True
        if -2 in num_list and -3 in num_list:
            return True
        return False
    
    steps_dict = {}
    for beat in beat_times:
        # Check if this beat falls in any peak interval.
        in_peak = any(start <= beat < end for (start, end) in peak_intervals)
        # Use different probability weights if in a peak.
        weights = list(peak_weights) if in_peak else list(default_weights)
        list_length = random.choices(length_choices, weights=weights, k=1)[0]
        # Generate without replacement; re-sample if the generated list violates constraints.
        while True:
            step_numbers = random.sample(possible_numbers, list_length)
            if not violates_constraint(step_numbers):
                break
        steps_dict[beat] = step_numbers
    return steps_dict

##############################
# Main: Combine Peak Detection & DDR Moves
##############################
if __name__ == "__main__":
    # Replace with your audio file path.
    audio_file = "Songs/Coldplay - A Sky Full Of Stars (Official audio).mp3"
    
    # 1. Detect peaks.
    window_duration = 5.0  # seconds
    overall_avg, threshold, times, rms, peak_times, peak_indices = detect_peaks_by_window(
        audio_file,
        hop_length=512,
        window_duration=window_duration,
        threshold_multiplier=1.5
    )
    
    # Create peak intervals from peak_times.
    # Each interval is [start, start + window_duration]
    peak_intervals = [(pt, pt + window_duration) for pt in peak_times]
    
    # Print peak information.
    print(f"Overall RMS Average: {overall_avg:.3f}")
    print(f"Threshold (1.5x Average): {threshold:.3f}")
    print("Detected Peak Windows (start time - end time in seconds):")
    for interval in peak_intervals:
        print(f"{interval[0]:.2f} - {interval[1]:.2f}")
    
    # 2. Generate DDR steps.
    # During a peak, use a distribution favoring more moves:
    # (For example: 1 number: 10%, 2 numbers: 40%, 3 numbers: 50%)
    # Outside peaks, use the default: (1: 30%, 2: 50%, 3: 20%)
    ddr_moves = generate_ddr_steps_with_peaks(
        audio_file,
        peak_intervals,
        default_weights=(0.3, 0.5, 0.2),
        peak_weights=(0.1, 0.4, 0.5)
    )
    
    # Optionally, write the DDR moves dictionary to a JSON file.
    output_file = "DDR_moves.json"
    with open(output_file, "w") as f:
        json.dump(ddr_moves, f, indent=4)
    
    # Print a few DDR moves.
    print("\nSample DDR Moves (Beat Time -> Moves):")
    for i, (beat_time, moves) in enumerate(ddr_moves.items()):
        # Print the first 5 beats for demonstration.
        if i >= 5:
            break
        print(f"{beat_time:.2f}s -> {moves}")
    
    # 3. Plot the RMS energy with detected peaks.
    plt.figure(figsize=(10, 4))
    plt.plot(times, rms, label="RMS Energy")
    plt.axhline(y=overall_avg, color="green", linestyle="--", label=f"Overall Avg ({overall_avg:.2f})")
    plt.axhline(y=threshold, color="red", linestyle="--", label=f"Threshold ({threshold:.2f})")
    # Mark the detected peak window start times.
    plt.scatter(peak_times, [rms[i] for i in peak_indices],
                color="magenta", zorder=5, label="Detected Peak Windows")
    plt.xlabel("Time (s)")
    plt.ylabel("RMS Energy")
    plt.title("Detected Peak Windows (5-Second RMS > 1.5× Overall Average)")
    plt.legend()
    plt.tight_layout()
    plt.show()
