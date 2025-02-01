const uploadButton = document.getElementById('uploadSongButton');
const audioUpload = document.getElementById('audioUpload');
const canvas = document.getElementById('waveform');
const audioPlayer = document.getElementById('audioPlayer');
const ctx = canvas.getContext('2d');

let audioContext;
let audioBuffer;
let waveformData = [];
let progressInterval;

// Trigger file input when button is clicked
uploadButton.addEventListener('click', () => audioUpload.click());

// Handle file upload
audioUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    // Reset state
    waveformData = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up audio player
    audioPlayer.src = url;
    
    // Process audio for waveform
    const reader = new FileReader();
    reader.onload = function(e) {
        initAudioContext(e.target.result);
    };
    reader.readAsArrayBuffer(file);
});

// Initialize Web Audio API
function initAudioContext(arrayBuffer) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    audioContext.decodeAudioData(arrayBuffer, function(buffer) {
        audioBuffer = buffer;
        drawWaveform(buffer);
    });
}

// Draw waveform with progress
function drawWaveform(buffer) {
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 150;
    ctx.clearRect(0, 0, width, height);
    
    const channelData = buffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    // Store waveform data
    waveformData = [];
    
    for(let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for(let j = 0; j < step; j++) {
            const datum = channelData[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        
        waveformData.push({
            x: i,
            height: Math.max(1, (max - min) * amp),
            y: (1 + min) * amp
        });
    }
    
    // Draw initial waveform
    drawProgressWaveform(0);
}

// Draw waveform with current progress
function drawProgressWaveform(progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const progressIndex = Math.floor(progress * waveformData.length);
    
    waveformData.forEach((point, index) => {
        ctx.fillStyle = index <= progressIndex ? '#4b0082' : '#fb00ff';
        ctx.fillRect(point.x, point.y, 1, point.height);
    });
}

// Update progress
function updateProgress() {
    if (!audioBuffer) return;
    
    const currentTime = audioPlayer.currentTime;
    const duration = audioBuffer.duration;
    const progress = currentTime / duration;
    
    drawProgressWaveform(progress);
    
    if (!audioPlayer.paused) {
        requestAnimationFrame(updateProgress);
    }
}

// Audio player event listeners
audioPlayer.addEventListener('play', () => {
    progressInterval = requestAnimationFrame(updateProgress);
});

audioPlayer.addEventListener('pause', () => {
    cancelAnimationFrame(progressInterval);
});

// Click to seek
canvas.addEventListener('click', function(e) {
    if (!audioBuffer) return;
    
    const duration = audioBuffer.duration;
    const clickPosition = (e.clientX - canvas.getBoundingClientRect().left) / canvas.width;
    const seekTime = duration * clickPosition;
    
    audioPlayer.currentTime = seekTime;
    drawProgressWaveform(clickPosition);
    
    if (audioPlayer.paused) {
        audioPlayer.play();
    }
});