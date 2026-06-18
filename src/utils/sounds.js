// Sound utility for GoodGov - James Brown-style funk effects
export const playSound = (type) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Helper function to create a drum hit (kick/snare/hi-hat)
  const createDrumHit = (type) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'kick') {
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      gainNode.gain.setValueAtTime(1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'snare') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'hihat') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
    }
    
    return { oscillator, gainNode };
  };
  
  // Helper function to create a bass note
  const createBassNote = (frequency, startTime, duration) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };
  
  switch(type) {
    case 'click':
      // Funky click (hi-hat + snare)
      createDrumHit('hihat');
      setTimeout(() => createDrumHit('snare'), 50);
      break;
      
    case 'success':
      // James Brown-style success riff (bass + drums)
      // Bassline
      createBassNote(130.81, audioContext.currentTime, 0.15);
      createBassNote(164.81, audioContext.currentTime + 0.15, 0.15);
      createBassNote(195.99, audioContext.currentTime + 0.3, 0.2);
      // Drums
      createDrumHit('kick');
      setTimeout(() => createDrumHit('snare'), 100);
      setTimeout(() => createDrumHit('hihat'), 200);
      setTimeout(() => createDrumHit('kick'), 300);
      break;
      
    case 'error':
      // Error (low bass + snare
      createBassNote(65.41, audioContext.currentTime, 0.5);
      setTimeout(() => createDrumHit('snare'), 250);
      break;
      
    case 'select':
      // Quick hi-hat
      createDrumHit('hihat');
      break;
      
    case 'loading':
      // Loading groove (hi-hat + kick loop)
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          createDrumHit('hihat');
          if (i % 2 === 0) {
            setTimeout(() => createDrumHit('kick'), 200);
          }
        }, i * 300);
      }
      break;
      
    default:
      break;
  }
};