Module.register("MMM-ScreenSaver", {
    defaults: {
        inactivityLimit: 10 * 1000, // 15 minutes
    },

    getStyles: function() {
        return ["MMM-ScreenSaver.css"];
    },
    
    start: function() {
        this.inactivityTimer = null;
        this.lastPhotoUrl = null;
        this.isActive = false;
        this.hidden = true;

        this.bindTouchEvents();
        this.resetTimer();
    },

    notificationReceived: function(notification, payload, sender) {
       if (sender && sender.name === "MMM-GooglePhotos" && notification === "CURRENT_PHOTO_URL") {
            this.lastPhotoUrl = payload;
                
            if (this.isActive) {
                // If the screensaver is active, update the bouncing photo immediately
                this.updateBouncingPhoto(this.lastPhotoUrl);
            }
        }
        /* Manual Start of Screensaver notification */
        if(notification === "REMOTE_ACTION" && payload.action === "TOGGLE_SCREENSAVER") {
            console.log("Screensaver manual start notification received");
            if (this.hidden) {
                this.startScreenSaver();
            } else {
            }
        }
    },
    
    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.id = "screensaver";
    
        const bouncingImage = document.createElement("div");
        bouncingImage.className = "bouncing-image";
        wrapper.appendChild(bouncingImage);
    
        return wrapper;
    },
    
    

    resetTimer: function() {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            this.startScreenSaver();
        }, this.config.inactivityLimit);
    },

    startScreenSaver: function() {
        console.log("Starting Screensaver");
        this.isActive = true;
        // Display the screensaver and start bouncing animation
        const screensaverElement = document.getElementById('screensaver');
        setTimeout(() => {
        screensaverElement.style.display = 'block';
        this.updateBouncingPhoto(this.lastPhotoUrl);
        this.startBouncingAnimation();
        }, 500); 
    },
    

    stopScreenSaver: function() {
        this.isActive = false;
        console.log("stopping screensaver");
        // Hide the screensaver
        const screensaverElement = document.getElementById('screensaver');
        screensaverElement.style.display = 'none';
    },

    updateBouncingPhoto: function(photoUrl) {
        // Update the DOM element for the bouncing photo with the new URL
        const bouncingImageElement = document.querySelector('#screensaver .bouncing-image');
        bouncingImageElement.style.backgroundImage = `url(${photoUrl})`;
    },

    bindTouchEvents: function() {
        const self = this;
        window.addEventListener("touchstart", function() {
            if (self.isActive) {
                self.stopScreenSaver();
            }
            self.resetTimer();
        });
    },

    startBouncingAnimation: function() {
        const bouncingImageElement = document.querySelector('#screensaver .bouncing-image');
        let xPos = 0, yPos = 0;
        let xSpeed = 1.5, ySpeed = 1.5;
    
        const imageUrl = bouncingImageElement.style.backgroundImage.slice(4, -1).replace(/["|']/g, ""); // Extract the URL from the 'url()' format
    
        const tempImage = new Image();
        tempImage.src = imageUrl;
    
        const moduleInstance = this; // Capture the context of the module instance
    
        tempImage.onload = function() {
            let imgWidth = this.naturalWidth;
            let imgHeight = this.naturalHeight;
        
            // Calculate the ratio of the image's width to its height
            const ratio = imgWidth / imgHeight;
        
            // Check and adjust dimensions
            if (imgWidth < 600) {
                imgWidth = 600;
                imgHeight = imgWidth / ratio;
            } else if (imgHeight < 600) {
                imgHeight = 600;
                imgWidth = imgHeight * ratio;
            }
    
            // Adjust the size of the bouncing image based on its content
            bouncingImageElement.style.width = imgWidth + "px";
            bouncingImageElement.style.height = imgHeight + "px";
    
            const bounce = () => {
                // Re-fetch dimensions in case they have changed
                const currentWidth = bouncingImageElement.offsetWidth;
                const currentHeight = bouncingImageElement.offsetHeight;
            
                if (xPos + currentWidth > window.innerWidth || xPos < 0) {
                    xSpeed = -xSpeed;
                }
                if (yPos + currentHeight > window.innerHeight || yPos < 0) {
                    ySpeed = -ySpeed;
                }
        
                xPos += xSpeed;
                yPos += ySpeed;
        
                bouncingImageElement.style.left = xPos + 'px';
                bouncingImageElement.style.top = yPos + 'px';
        
                if (moduleInstance.isActive) { // Use moduleInstance here instead of this
                    requestAnimationFrame(bounce);
                }
            };
        
            bounce();
        };
    }
    
    
    
    

});
