// New Surprise Story Flow
let currentAct = 0;
let foundClues = 0;
let totalClues = 4;
let isMobile = false;

// Detect mobile device
const detectMobile = () => {
  isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
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
  const overlay = document.getElementById("mysteryOverlay");
  overlay.style.display = "flex";

  // Auto transition to detective mode after 3 seconds (shorter on mobile)
  const transitionTime = isMobile ? 2000 : 3000;
  setTimeout(() => {
    hideMysteryOverlay();
    showDetectiveMode();
  }, transitionTime);
};

const hideMysteryOverlay = () => {
  const overlay = document.getElementById("mysteryOverlay");
  overlay.classList.add("hidden");
  setTimeout(() => {
    overlay.style.display = "none";
  }, 1000);
};

const showDetectiveMode = () => {
  const detectiveMode = document.getElementById("detectiveMode");
  detectiveMode.classList.add("active");

  // Add click handlers for clues
  const clues = document.querySelectorAll(".clue");
  clues.forEach((clue, index) => {
    clue.addEventListener("click", () => {
      findClue(clue, index);
    });

    // Add touch support for mobile
    clue.addEventListener("touchstart", (e) => {
      e.preventDefault();
      findClue(clue, index);
    });
  });
};

const findClue = (clueElement, clueIndex) => {
  if (!clueElement.classList.contains("found")) {
    clueElement.classList.add("found");
    foundClues++;

    // Update progress bar
    const progressFill = document.getElementById("progressFill");
    const progress = (foundClues / totalClues) * 100;
    progressFill.style.width = progress + "%";

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
  const detectiveMode = document.getElementById("detectiveMode");
  detectiveMode.classList.remove("active");
};

const showInteractiveCake = () => {
  // Skip cake interaction and go directly to birthday content
  showOriginalBirthdayContentEnhanced();
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
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.3
  );

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
  oscillator.frequency.exponentialRampToValueAtTime(
    100,
    audioContext.currentTime + 0.2
  );

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.2
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

const createConfettiExplosion = () => {
  const colors = ["#FF69B4", "#FF1493", "#FFB6C1", "#FFDAB9", "#FFFACD"];

  // Reduce particle count on mobile for better performance
  const particleCount = isMobile ? 25 : 50;

  for (let i = 0; i < particleCount; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-10px";
    confetti.style.width = isMobile ? "8px" : "10px";
    confetti.style.height = isMobile ? "8px" : "10px";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.pointerEvents = "none";
    confetti.style.zIndex = "1000";

    document.body.appendChild(confetti);

    gsap.to(confetti, {
      y: window.innerHeight + 100,
      x: (Math.random() - 0.5) * (isMobile ? 150 : 200),
      rotation: 360,
      duration: isMobile ? 2 + Math.random() : 3 + Math.random() * 2,
      ease: "power2.out",
      onComplete: () => confetti.remove(),
    });
  }
};

// Add interactive effects for cute elements
const addInteractiveEffects = () => {
  // Balloon click/touch effects
  const balloons = document.querySelectorAll(".baloons img");
  balloons.forEach((balloon) => {
    balloon.addEventListener("click", () => {
      createBurstEffect(balloon);
      playPopSound();
    });

    // Add touch support for mobile
    balloon.addEventListener("touchstart", (e) => {
      e.preventDefault();
      createBurstEffect(balloon);
      playPopSound();
    });
  });

  // Profile picture click/touch effect
  const profilePic = document.querySelector(".profile-picture");
  if (profilePic) {
    profilePic.addEventListener("click", () => {
      createHeartBurst(profilePic);
    });

    profilePic.addEventListener("touchstart", (e) => {
      e.preventDefault();
      createHeartBurst(profilePic);
    });
  }

  // Text box click/touch effect
  const textBox = document.querySelector(".text-box");
  if (textBox) {
    textBox.addEventListener("click", () => {
      createSparkleEffect(textBox);
    });

    textBox.addEventListener("touchstart", (e) => {
      e.preventDefault();
      createSparkleEffect(textBox);
    });
  }

  // Add cute hover effects for desktop
  if (!("ontouchstart" in window)) {
    addDesktopHoverEffects();
  }
};

// Add desktop-specific hover effects
const addDesktopHoverEffects = () => {
  const balloons = document.querySelectorAll(".baloons img");
  balloons.forEach((balloon) => {
    balloon.addEventListener("mouseenter", () => {
      gsap.to(balloon, {
        scale: 1.1,
        rotation: 5,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    balloon.addEventListener("mouseleave", () => {
      gsap.to(balloon, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
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
    const particle = document.createElement("div");
    particle.style.position = "fixed";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.width = "10px";
    particle.style.height = "10px";
    particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "1000";

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
      onComplete: () => particle.remove(),
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
        duration: 0.3,
      });
    },
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
    const heart = document.createElement("div");
    heart.innerHTML = "💖";
    heart.style.position = "fixed";
    heart.style.left = centerX + "px";
    heart.style.top = centerY + "px";
    heart.style.fontSize = isMobile ? "1.5rem" : "2rem";
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "1000";

    document.body.appendChild(heart);

    const angle = (i / heartCount) * Math.PI * 2;
    const distance = isMobile
      ? 60 + Math.random() * 30
      : 80 + Math.random() * 40;
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
      onComplete: () => heart.remove(),
    });
  }
};

// Create sparkle effect
const createSparkleEffect = (element) => {
  const rect = element.getBoundingClientRect();

  // Reduce sparkle count on mobile for better performance
  const sparkleCount = isMobile ? 8 : 12;

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement("div");
    sparkle.innerHTML = "✨";
    sparkle.style.position = "fixed";
    sparkle.style.left = rect.left + Math.random() * rect.width + "px";
    sparkle.style.top = rect.top + Math.random() * rect.height + "px";
    sparkle.style.fontSize = isMobile ? "1.2rem" : "1.5rem";
    sparkle.style.pointerEvents = "none";
    sparkle.style.zIndex = "1000";

    document.body.appendChild(sparkle);

    gsap.fromTo(
      sparkle,
      {
        scale: 0,
        opacity: 0,
        rotation: 0,
      },
      {
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
            onComplete: () => sparkle.remove(),
          });
        },
      }
    );
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
  oscillator.frequency.exponentialRampToValueAtTime(
    200,
    audioContext.currentTime + 0.1
  );

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );

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
    .staggerFromTo(
      ".baloons img",
      1.0,
      {
        opacity: 0.9,
        y: 1400,
      },
      {
        opacity: 1,
        y: -1000,
      },
      0.1
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
      2.0,
      {
        visibility: "visible",
        opacity: 0.8,
        scale: 40,
      },
      0.15
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

// Love Message Functions
const showLoveMessage = (message) => {
  const popup = document.getElementById("loveMessagePopup");
  const messageText = document.getElementById("loveMessageText");
  messageText.textContent = message;
  popup.classList.add("show");

  // Auto close after 5 seconds
  setTimeout(() => {
    closeLoveMessage();
  }, 5000);
};

const closeLoveMessage = () => {
  const popup = document.getElementById("loveMessagePopup");
  popup.classList.remove("show");
};

// Enhanced interactive effects
const addEnhancedInteractiveEffects = () => {
  // Add love message popup to profile picture
  const profilePic = document.querySelector(".profile-picture");
  if (profilePic) {
    const loveMessages = [
      "Mình là tình yêu đẹp nhất của tui! 💕",
      "Mỗi ngày bên mình là một món quà! 🎁",
      "Tui yêu mình nhiều hơn những gì từ ngữ có thể diễn tả! 💖",
      "Mình làm cho cuộc đời tui trở nên ý nghĩa! ✨",
      "Tui muốn cùng mình đi đến cuối con đường! 🌹",
    ];

    let messageIndex = 0;

    profilePic.addEventListener("click", () => {
      showLoveMessage(loveMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loveMessages.length;
      createHeartBurst(profilePic);
    });

    profilePic.addEventListener("touchstart", (e) => {
      e.preventDefault();
      showLoveMessage(loveMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loveMessages.length;
      createHeartBurst(profilePic);
    });
  }

  // Add random love messages to text box
  const textBox = document.querySelector(".text-box");
  if (textBox) {
    textBox.addEventListener("click", () => {
      const randomMessages = [
        "Tui yêu mình! 💕",
        "Mình là tất cả với tui! 💖",
        "Cảm ơn mình đã đến bên tui! ✨",
        "Tui muốn cùng mình tạo ra nhiều kỷ niệm đẹp! 🌹",
        "Mình là ánh sáng trong cuộc đời tui! 💫",
      ];

      const randomMessage =
        randomMessages[Math.floor(Math.random() * randomMessages.length)];
      showLoveMessage(randomMessage);
      createSparkleEffect(textBox);
    });

    textBox.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const randomMessages = [
        "Tui yêu mình! 💕",
        "Mình là tất cả với tui! 💖",
        "Cảm ơn mình đã đến bên tui! ✨",
        "Tui muốn cùng mình tạo ra nhiều kỷ niệm đẹp! 🌹",
        "Mình là ánh sáng trong cuộc đời tui! 💫",
      ];

      const randomMessage =
        randomMessages[Math.floor(Math.random() * randomMessages.length)];
      showLoveMessage(randomMessage);
      createSparkleEffect(textBox);
    });
  }

  // Add special effect to wish text
  const wishText = document.getElementById("wishText");
  if (wishText) {
    wishText.addEventListener("click", () => {
      showLoveMessage("Phạm Mai Ly - Người tui yêu thương nhất trên đời! 💕");
      createHeartBurst(wishText);
    });

    wishText.addEventListener("touchstart", (e) => {
      e.preventDefault();
      showLoveMessage("Phạm Mai Ly - Người tui yêu thương nhất trên đời! 💕");
      createHeartBurst(wishText);
    });
  }
};

// Update the main function to include enhanced effects
const showOriginalBirthdayContentEnhanced = () => {
  // Show the original birthday animation
  toggleMusicPlayback(true);
  animationTimeline();
  addInteractiveEffects();
  addEnhancedInteractiveEffects(); // Add the new enhanced effects
};
