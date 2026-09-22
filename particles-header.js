/* 
 * 🌟 COOL ELEGANT HEADER SYSTEM 🌟
 * Clean, sophisticated particle effects for the header area
 */

particlesJS('particles-js-header', {
  "particles": {
    "number": {
      "value": 40,  // REDUCED for better performance - was 60
      "density": {
        "enable": true,
        "value_area": 1000  // Increased area for better performance
      }
    },
    "color": {
      "value": "#ffffff"  // ONLY WHITE - no colors
    },
    "shape": {
      "type": ["circle", "star"],
      "stroke": {
        "width": 0,
        "color": "#ffffff"
      },
      "star": {
        "nb_sides": 5
      }
    },
    "opacity": {
      "value": 0.7,  // Subtle
      "random": true,
      "anim": {
        "enable": true,
        "speed": 1.8,  // Gentle animation
        "opacity_min": 0.3,
        "sync": false
      }
    },
    "size": {
      "value": 3.0,  // Nice clean size
      "random": true,
      "anim": {
        "enable": true,
        "speed": 2.0,
        "size_min": 1.0,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 100,  // Short clean connections
      "color": "#ffffff",
      "opacity": 0.15,  // Very subtle
      "width": 0.8
    },
    "move": {
      "enable": true,
      "speed": 1.0,  // Gentle movement
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": true,
        "rotateX": 300,
        "rotateY": 400
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "grab"  // Clean grab effect
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 120,
        "line_linked": {
          "opacity": 0.5
        }
      },
      "push": {
        "particles_nb": 3
      }
    }
  },
  "retina_detect": true
});

// 🚀 COOL HEADER ROCKET ANIMATION 🚀
function createHeaderRocket() {
  const rocket = document.createElement('div');
  rocket.className = 'header-rocket';
  rocket.style.cssText = `
    position: absolute;
    width: 30px;
    height: 30px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
    border-radius: 50% 50% 50% 0;
    pointer-events: none;
    z-index: 10;
    transform: rotate(45deg);
    box-shadow: 
      0 0 20px rgba(69, 183, 209, 0.6),
      0 0 40px rgba(78, 205, 196, 0.4);
  `;
  
  // Add rocket trail
  const trail = document.createElement('div');
  trail.style.cssText = `
    position: absolute;
    top: 50%;
    left: -20px;
    width: 20px;
    height: 3px;
    background: linear-gradient(to left, rgba(255, 107, 107, 0.8), transparent);
    border-radius: 2px;
    transform: translateY(-50%);
    box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
  `;
  rocket.appendChild(trail);
  
  const headerSection = document.querySelector('.hero-section') || document.querySelector('header') || document.body;
  headerSection.style.position = 'relative';
  
  rocket.style.left = '-50px';
  rocket.style.top = Math.random() * 200 + 100 + 'px';
  
  headerSection.appendChild(rocket);
  
  rocket.animate([
    {
      transform: 'translateX(0) rotate(45deg) scale(0.5)',
      opacity: 0
    },
    {
      transform: `translateX(${window.innerWidth * 0.3}px) rotate(45deg) scale(1.2)`,
      opacity: 1,
      offset: 0.3
    },
    {
      transform: `translateX(${window.innerWidth + 100}px) rotate(45deg) scale(0.8)`,
      opacity: 0
    }
  ], {
    duration: 8000,
    easing: 'ease-out'
  }).onfinish = () => {
    if (headerSection.contains(rocket)) {
      headerSection.removeChild(rocket);
    }
  };
}

// Do not draw a rocket or planet in the header.

// ✨ SIMPLE WHITE HEADER SPARKLES ✨
function createHeaderSparkle() {
  const sparkle = document.createElement('div');
  sparkle.className = 'header-sparkle';
  sparkle.style.cssText = `
    position: absolute;
    width: 6px;
    height: 6px;
    background: #ffffff;
    pointer-events: none;
    z-index: 8;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    box-shadow: 
      0 0 8px rgba(255, 255, 255, 0.8),
      0 0 16px rgba(255, 255, 255, 0.4);
  `;
  
  const headerSection = document.querySelector('.hero-section') || document.querySelector('header') || document.body;
  headerSection.style.position = 'relative';
  
  sparkle.style.left = Math.random() * window.innerWidth + 'px';
  sparkle.style.top = Math.random() * 400 + 'px';
  
  headerSection.appendChild(sparkle);
  
  sparkle.animate([
    {
      transform: 'scale(0) rotate(0deg)',
      opacity: 0
    },
    {
      transform: 'scale(1.2) rotate(180deg)',
      opacity: 1,
      offset: 0.5
    },
    {
      transform: 'scale(0) rotate(360deg)',
      opacity: 0
    }
  ], {
    duration: 2000,
    easing: 'ease-in-out'
  }).onfinish = () => {
    if (headerSection.contains(sparkle)) {
      headerSection.removeChild(sparkle);
    }
  };
}

// Gentle header sparkles
setInterval(() => {
  if (Math.random() < 0.3) {
    createHeaderSparkle();
  }
}, 4000);

// ✨ SIMPLE WHITE HEADER WISPS ✨
function createHeaderWisp() {
  const wisp = document.createElement('div');
  wisp.className = 'header-wisp';
  wisp.style.cssText = `
    position: absolute;
    width: ${10 + Math.random() * 15}px;
    height: ${10 + Math.random() * 15}px;
    background: radial-gradient(circle at 30% 30%, 
      rgba(255, 255, 255, 0.8) 0%, 
      rgba(255, 255, 255, 0.4) 50%, 
      transparent 100%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 7;
    filter: blur(0.5px);
    box-shadow: 
      0 0 12px rgba(255, 255, 255, 0.5),
      0 0 24px rgba(255, 255, 255, 0.2);
  `;
  
  const headerSection = document.querySelector('.hero-section') || document.querySelector('header') || document.body;
  headerSection.style.position = 'relative';
  
  const startX = Math.random() * window.innerWidth;
  const startY = 500;
  
  wisp.style.left = startX + 'px';
  wisp.style.top = startY + 'px';
  
  headerSection.appendChild(wisp);
  
  const endX = startX + (Math.random() - 0.5) * 150;
  const endY = -50;
  
  wisp.animate([
    {
      transform: `translate(0, 0) scale(0.5)`,
      opacity: 0
    },
    {
      transform: `translate(${(endX - startX) * 0.5}px, ${(endY - startY) * 0.5}px) scale(1)`,
      opacity: 0.7,
      offset: 0.5
    },
    {
      transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.3)`,
      opacity: 0
    }
  ], {
    duration: 8000 + Math.random() * 4000,
    easing: 'ease-out'
  }).onfinish = () => {
    if (headerSection.contains(wisp)) {
      headerSection.removeChild(wisp);
    }
  };
}

// Gentle header wisps
setInterval(() => {
  if (Math.random() < 0.2) {
    createHeaderWisp();
  }
}, 6000);

console.log('⚡ PERFORMANCE OPTIMIZED Header Stars Loaded! ⚡'); 