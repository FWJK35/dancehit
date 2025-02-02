import sys
import librosa

print("Imported process_audio.py")

def process_audio(input_file, output_file):
    # Load the audio file
    y, sr = librosa.load(input_file)

    # Perform some basic analysis (e.g., get duration)
    duration = librosa.get_duration(y=y, sr=sr)

    # Write the results to the output file
    with open(output_file, 'w') as f:
        f.write(f"Audio Duration: {duration:.2f} seconds\n")
        f.write("Additional analysis results can be added here.")

if __name__ == "__main__":
    print("Running process_audio.py...")
    if len(sys.argv) != 3:
        print("Usage: python process_audio.py <input_file> <output_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    process_audio(input_file, output_file)
