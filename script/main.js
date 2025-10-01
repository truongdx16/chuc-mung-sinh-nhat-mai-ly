// New Surprise Story Flow
let currentAct = 0;
let foundClues = 0;
let totalClues = 4;
let isMobile = false;

// Detect mobile device
const detectMobile = () => {
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
            window.innerWidth <= 768;
  return isMobile;
};

// Initialize the surprise story
window.addEventListener("load", () => {
  detectMobile();
  startSurpriseStory();
});

const startSurpriseStory = () => {
  // Act 1: Mystery Opening
  setTimeout(() => {
    showMysteryOverlay();
  }, 1000);
};

const showMysteryOverlay = () => {
  const overlay = document.getElementById('mysteryOverlay');
  overlay.style.display = 'flex';
  
  // Auto transition to detective mode after 3 seconds (shorter on mobile)
  const transitionTime = isMobile ? 2000 : 3000;
  setTimeout(() => {
    hideMysteryOverlay();
    showDetectiveMode();
  }, transitionTime);
};

const hideMysteryOverlay = () => {
  const overlay = document.getElementById('mysteryOverlay');
  overlay.classList.add('hidden');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 1000);
};

const showDetectiveMode = () => {
  const detectiveMode = document.getElementById('detectiveMode');
  detectiveMode.classList.add('active');
  
  // Add click handlers for clues
  const clues = document.querySelectorAll('.clue');
  clues.forEach((clue, index) => {
    clue.addEventListener('click', () => {
      findClue(clue, index);
    });
    
    // Add touch support for mobile
    clue.addEventListener('touchstart', (e) => {
      e.preventDefault();
      findClue(clue, index);
    });
  });
};

const findClue = (clueElement, clueIndex) => {
  if (!clueElement.classList.contains('found')) {
    clueElement.classList.add('found');
    foundClues++;
    
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    const progress = (foundClues / totalClues) * 100;
    progressFill.style.width = progress + '%';
    
    // Play success sound
    playSuccessSound();
    
    // Create sparkle effect
    createSparkleEffect(clueElement);
    
    // Check if all clues found
    if (foundClues === totalClues) {
      setTimeout(() => {
        hideDetectiveMode();
        showInteractiveCake();
      }, 1500);
    }
  }
};

const hideDetectiveMode = () => {
  const detectiveMode = document.getElementById('detectiveMode');
  detectiveMode.classList.remove('active');
};


const showInteractiveCake = () => {
  const interactiveCake = document.getElementById('interactiveCake');
  interactiveCake.classList.add('active');
  
  // Add click handlers for candles
  const candles = document.querySelectorAll('.candle');
  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      blowCandle(candle);
    });
    
    // Add touch support for mobile
    candle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      blowCandle(candle);
    });
  });
  
  // After cake interaction, show original birthday content (shorter on mobile)
  const transitionTime = isMobile ? 7000 : 10000;
  setTimeout(() => {
    hideInteractiveCake();
    showOriginalBirthdayContent();
  }, transitionTime);
};

const blowCandle = (candle) => {
  if (!candle.classList.contains('blown')) {
    candle.classList.add('blown');
    
    // Create wind effect
    createWindEffect(candle);
    
    // Play blow sound
    playBlowSound();
    
    // Check if all candles blown
    const allCandles = document.querySelectorAll('.candle');
    const blownCandles = document.querySelectorAll('.candle.blown');
    
    if (allCandles.length === blownCandles.length) {
      setTimeout(() => {
        createConfettiExplosion();
      }, 1000);
    }
  }
};

const hideInteractiveCake = () => {
  const interactiveCake = document.getElementById('interactiveCake');
  interactiveCake.classList.remove('active');
};

const showOriginalBirthdayContent = () => {
  // Show the original birthday animation
  toggleMusicPlayback(true);
  animationTimeline();
  addInteractiveEffects();
};

// Sound effects
const playSuccessSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
  oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
  oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

const playErrorSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

const playBlowSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

const createWindEffect = (element) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Reduce wind particles on mobile for better performance
  const windCount = isMobile ? 3 : 5;
  
  for (let i = 0; i < windCount; i++) {
    const wind = document.createElement('div');
    wind.innerHTML = '💨';
    wind.style.position = 'fixed';
    wind.style.left = centerX + 'px';
    wind.style.top = centerY + 'px';
    wind.style.fontSize = isMobile ? '0.8rem' : '1rem';
    wind.style.pointerEvents = 'none';
    wind.style.zIndex = '1000';
    
    document.body.appendChild(wind);

    const angle = (i / windCount) * Math.PI * 2;
    const distance = isMobile ? 40 + Math.random() * 20 : 50 + Math.random() * 30;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;

    gsap.to(wind, {
      x: endX - centerX,
      y: endY - centerY,
      scale: 0,
      opacity: 0,
      duration: isMobile ? 0.6 : 0.8,
      ease: "power2.out",
      onComplete: () => wind.remove()
    });
  }
};

const createConfettiExplosion = () => {
  const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#FFDAB9', '#FFFACD'];
  
  // Reduce particle count on mobile for better performance
  const particleCount = isMobile ? 25 : 50;
  
  for (let i = 0; i < particleCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.width = isMobile ? '8px' : '10px';
    confetti.style.height = isMobile ? '8px' : '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '1000';
    
    document.body.appendChild(confetti);

    gsap.to(confetti, {
      y: window.innerHeight + 100,
      x: (Math.random() - 0.5) * (isMobile ? 150 : 200),
      rotation: 360,
      duration: isMobile ? 2 + Math.random() : 3 + Math.random() * 2,
      ease: "power2.out",
      onComplete: () => confetti.remove()
    });
  }
};

// Add interactive effects for cute elements
const addInteractiveEffects = () => {
  // Balloon click/touch effects
  const balloons = document.querySelectorAll('.baloons img');
  balloons.forEach(balloon => {
    balloon.addEventListener('click', () => {
      createBurstEffect(balloon);
      playPopSound();
    });
    
    // Add touch support for mobile
    balloon.addEventListener('touchstart', (e) => {
      e.preventDefault();
      createBurstEffect(balloon);
      playPopSound();
    });
  });

  // Profile picture click/touch effect
  const profilePic = document.querySelector('.profile-picture');
  if (profilePic) {
    profilePic.addEventListener('click', () => {
      createHeartBurst(profilePic);
    });
    
    profilePic.addEventListener('touchstart', (e) => {
      e.preventDefault();
      createHeartBurst(profilePic);
    });
  }

  // Text box click/touch effect
  const textBox = document.querySelector('.text-box');
  if (textBox) {
    textBox.addEventListener('click', () => {
      createSparkleEffect(textBox);
    });
    
    textBox.addEventListener('touchstart', (e) => {
      e.preventDefault();
      createSparkleEffect(textBox);
    });
  }

  // Add cute hover effects for desktop
  if (!('ontouchstart' in window)) {
    addDesktopHoverEffects();
  }
};

// Add desktop-specific hover effects
const addDesktopHoverEffects = () => {
  const balloons = document.querySelectorAll('.baloons img');
  balloons.forEach(balloon => {
    balloon.addEventListener('mouseenter', () => {
      gsap.to(balloon, {
        scale: 1.1,
        rotation: 5,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    balloon.addEventListener('mouseleave', () => {
      gsap.to(balloon, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
};

// Create burst effect for balloons
const createBurstEffect = (element) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Create multiple small elements for burst
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    
    document.body.appendChild(particle);

    // Animate particle
    const angle = (i / 8) * Math.PI * 2;
    const distance = 100 + Math.random() * 50;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;

    gsap.to(particle, {
      x: endX - centerX,
      y: endY - centerY,
      scale: 0,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      onComplete: () => particle.remove()
    });
  }

  // Scale and fade the balloon
  gsap.to(element, {
    scale: 1.5,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    onComplete: () => {
      gsap.to(element, {
        scale: 1,
        opacity: 1,
        duration: 0.3
      });
    }
  });
};

// Create heart burst effect
const createHeartBurst = (element) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Reduce heart count on mobile for better performance
  const heartCount = isMobile ? 4 : 6;
  
  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement('div');
    heart.innerHTML = '💖';
    heart.style.position = 'fixed';
    heart.style.left = centerX + 'px';
    heart.style.top = centerY + 'px';
    heart.style.fontSize = isMobile ? '1.5rem' : '2rem';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '1000';
    
    document.body.appendChild(heart);

    const angle = (i / heartCount) * Math.PI * 2;
    const distance = isMobile ? 60 + Math.random() * 30 : 80 + Math.random() * 40;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;

    gsap.to(heart, {
      x: endX - centerX,
      y: endY - centerY,
      scale: 0,
      opacity: 0,
      rotation: 360,
      duration: isMobile ? 1.2 : 1.5,
      ease: "power2.out",
      onComplete: () => heart.remove()
    });
  }
};

// Create sparkle effect
const createSparkleEffect = (element) => {
  const rect = element.getBoundingClientRect();
  
  // Reduce sparkle count on mobile for better performance
  const sparkleCount = isMobile ? 8 : 12;
  
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'fixed';
    sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
    sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
    sparkle.style.fontSize = isMobile ? '1.2rem' : '1.5rem';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '1000';
    
    document.body.appendChild(sparkle);

    gsap.fromTo(sparkle, {
      scale: 0,
      opacity: 0,
      rotation: 0
    }, {
      scale: 1,
      opacity: 1,
      rotation: 360,
      duration: isMobile ? 0.6 : 0.8,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(sparkle, {
          scale: 0,
          opacity: 0,
          duration: isMobile ? 0.3 : 0.5,
          onComplete: () => sparkle.remove()
        });
      }
    });
  }
};

// Play pop sound (placeholder - you can add actual sound files)
const playPopSound = () => {
  // Create a simple pop sound using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

// animation timeline
const animationTimeline = () => {
  // split chars that needs to be animated individually
  const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
  const hbd = document.getElementsByClassName("wish-hbd")[0];

  textBoxChars.innerHTML = `<span>${textBoxChars.innerHTML
    .split("")
    .join("</span><span>")}</span>`;

  hbd.innerHTML = `<span>${hbd.innerHTML
    .split("")
    .join("</span><span>")}</span>`;

  const ideaTextTrans = {
    opacity: 0,
    y: -20,
    rotationX: 5,
    skewX: "15deg",
  };

  const ideaTextTransLeave = {
    opacity: 0,
    y: 20,
    rotationY: 5,
    skewX: "-15deg",
  };

  // timeline
  const tl = new TimelineMax();

  tl.to(".container", 0.6, {
    visibility: "visible",
  })
    .from(".one", 0.7, {
      opacity: 0,
      y: 10,
    })
    .from(".two", 0.4, {
      opacity: 0,
      y: 10,
    })
    .to(
      ".one",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "+=3.5"
    )
    .to(
      ".two",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "-=1"
    )
    .from(".three", 0.7, {
      opacity: 0,
      y: 10,
    })
    .to(
      ".three",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "+=3"
    )
    .from(".four", 0.7, {
      scale: 0.2,
      opacity: 0,
    })
    .from(".fake-btn", 0.3, {
      scale: 0.2,
      opacity: 0,
    })
    .staggerTo(
      ".hbd-chatbox span",
      0.5,
      {
        visibility: "visible",
      },
      0.05
    )
    .to(
      ".fake-btn",
      0.1,
      {
        backgroundColor: "rgb(127, 206, 248)",
      },
      "+=1"
    )
    .to(
      ".four",
      0.5,
      {
        scale: 0.2,
        opacity: 0,
        y: -150,
      },
      "+=1"
    )
    .from(".idea-1", 0.7, ideaTextTrans)
    .to(".idea-1", 0.7, ideaTextTransLeave, "+=0.5")
    .from(".idea-2", 0.7, ideaTextTrans)
    .to(".idea-2", 0.7, ideaTextTransLeave, "+=0.5")
    .from(".idea-3", 0.7, ideaTextTrans)
    .to(".idea-3 strong", 0.5, {
      scale: 1.2,
      x: 10,
      backgroundColor: "rgb(21, 161, 237)",
      color: "#fff",
    })
    .to(".idea-3", 0.7, ideaTextTransLeave, "+=2.5")
    .from(".idea-4", 0.7, ideaTextTrans)
    .to(".idea-4", 0.7, ideaTextTransLeave, "+=2.5")
    .from(
      ".idea-5",
      0.7,
      {
        rotationX: 15,
        rotationZ: -10,
        skewY: "-5deg",
        y: 50,
        z: 10,
        opacity: 0,
      },
      "+=1.5"
    )
    .to(
      ".idea-5 span",
      0.7,
      {
        rotation: 90,
        x: 8,
      },
      "+=1.4"
    )
    .to(
      ".idea-5",
      0.7,
      {
        scale: 0.2,
        opacity: 0,
      },
      "+=2"
    )
    .staggerFrom(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: 15,
        ease: Expo.easeOut,
      },
      0.2
    )
    .staggerTo(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: -15,
        ease: Expo.easeOut,
      },
      0.2,
      "+=1.5"
    )
    .staggerFromTo(
      ".baloons img",
      2.5,
      {
        opacity: 0.9,
        y: 1400,
      },
      {
        opacity: 1,
        y: -1000,
      },
      0.2
    )
    .from(
      ".profile-picture",
      0.5,
      {
        scale: 3.5,
        opacity: 0,
        x: 25,
        y: -25,
        rotationZ: -45,
      },
      "-=2"
    )
    .from(".hat", 0.5, {
      x: -100,
      y: 350,
      rotation: -180,
      opacity: 0,
    })
    .staggerFrom(
      ".wish-hbd span",
      0.7,
      {
        opacity: 0,
        y: -50,
        // scale: 0.3,
        rotation: 150,
        skewX: "30deg",
        ease: Elastic.easeOut.config(1, 0.5),
      },
      0.1
    )
    .staggerFromTo(
      ".wish-hbd span",
      0.7,
      {
        scale: 1.4,
        rotationY: 150,
      },
      {
        scale: 1,
        rotationY: 0,
        color: "#ff69b4",
        ease: Expo.easeOut,
      },
      0.1,
      "party"
    )
    .from(
      ".wish h5",
      0.5,
      {
        opacity: 0,
        y: 10,
        skewX: "-15deg",
      },
      "party"
    )
    .staggerTo(
      ".eight svg",
      1.5,
      {
        visibility: "visible",
        opacity: 0,
        scale: 80,
        repeat: 3,
        repeatDelay: 1.4,
      },
      0.3
    )
    .to(".six", 0.5, {
      opacity: 0,
      y: 30,
      zIndex: "-1",
    })
    .staggerFrom(".nine p", 1, ideaTextTrans, 1.2)
    .to(
      ".last-smile",
      0.5,
      {
        rotation: 90,
      },
      "+=1"
    );

  // Restart Animation on click
  const replyBtn = document.getElementById("replay");
  replyBtn.addEventListener("click", () => {
    window.location.reload();
  });
};

const toggleMusicPlayback = (enable) => {
  const song = document.querySelector(".song");
  if (enable) {
    song.play();
  } else {
    song.pause();
    song.currentTime = 0;
  }
};
