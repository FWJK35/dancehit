import librosa
import numpy as np
import matplotlib.pyplot as plt

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

if __name__ == '__main__':
    # Replace with the path to your audio file.
    # audio_file = "Songs/Coldplay - A Sky Full Of Stars (Official audio).mp3"
    # audio_file = "Songs/Coldplay - /Users/aalibaali/Desktop/Mock Website/Songs/Coldplay - A Sky Full Of Stars (Official audio).mp3"
    audio_file = "Songs/Travis Scott - FE!N ft. Playboi Carti.mp3"


    
    overall_avg, threshold, times, rms, peak_times, peak_indices = detect_peaks_by_window(
        audio_file,
        hop_length=512,
        window_duration=5.0,
        threshold_multiplier=1.5
    )
    
    # Print results.
    print(f"Overall RMS Average: {overall_avg:.3f}")
    print(f"Threshold (1.5x Average): {threshold:.3f}")
    print("Detected Peaks at (s):")
    for pt in peak_times:
        print(f"{pt:.2f}")
    
    # Plot the RMS energy, overall average, threshold, and mark detected peaks.
    plt.figure(figsize=(10, 4))
    plt.plot(times, rms, label="RMS Energy")
    plt.axhline(y=overall_avg, color="green", linestyle="--", label=f"Overall Avg ({overall_avg:.2f})")
    plt.axhline(y=threshold, color="red", linestyle="--", label=f"Threshold ({threshold:.2f})")
    
    # Plot detected peaks (mark at the beginning of each window)
    plt.scatter(peak_times, [rms[i] for i in peak_indices],
                color="magenta", zorder=5, label="Detected Peaks")
    
    plt.xlabel("Time (s)")
    plt.ylabel("RMS Energy")
    plt.title("Detected Peaks Based on 5-Second RMS Windows > 1.5x Overall Average")
    plt.legend()
    plt.tight_layout()
    plt.show()
