import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Firebase config here
const firebaseConfig = {
    apiKey: "AIzaSyCcDsIUb9Wl3SHEeidz0MsFQS6UfN8Xd3U",
    authDomain: "bistro-boss-restro.firebaseapp.com",
    projectId: "bistro-boss-restro",
    storageBucket: "bistro-boss-restro.appspot.com",
    messagingSenderId: "187576370008",
    appId: "1:187576370008:web:c2f3d5770651bcd39cdb2d"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider()

const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const userName = document.getElementById("userName");

signOutButton.style.display = "none";

const userSignIn = async () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user
            console.log(user);
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message
        })
}

const userSignOut = async () => {
    signOut(auth).then(() => {
        console.log("logged out!")
    }).catch((error) => { })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        signOutButton.style.display = "block";
        signInButton.style.display = "none";
        userName.style.display = "block";
        userName.innerHTML = user.displayName;      
    } else {
        signOutButton.style.display = "none";
        signInButton.style.display = "flex";
        userName.style.display = "none";
    }
})

signInButton.addEventListener('click', userSignIn);
signOutButton.addEventListener('click', userSignOut);

// Image POST and GET

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');

    uploadForm.addEventListener('submit', async (event) => {
        // event.preventDefault(); // Prevent default form submission

        const formData = new FormData(uploadForm);
        const image = formData.get('image');

        const uploadData = new FormData();
        uploadData.append('image', image);

        try {
            const response = await fetch('https://bistro-boss-server-v2.vercel.app/api/v1/images/upload', {
                method: 'POST',
                body: uploadData
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Image uploaded successfully:', data);
                fetchImages();
            } else {
                console.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const imageContainer = document.getElementById('imageContainer');
    const loadingElement = document.createElement('p');
    loadingElement.textContent = 'Loading...';
    imageContainer.appendChild(loadingElement);

    // Function to fetch images from the API
    const fetchImages = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/images');
            // loadingElement.style.display = 'block';
            if (response.ok) {
                const images = await response.json();
                displayImages(images);
            } else {
                console.error('Failed to fetch images');
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            loadingElement.style.display = 'none';
        }
    };

    // Function to display images in the HTML
    const displayImages = (images) => {
        images.forEach((image) => {
            const imgElement = document.createElement('img');
            imgElement.src = `data:${image.contentType};base64,${arrayBufferToBase64(image.imageData.data)}`;
            imgElement.alt = image.imageName;
            imgElement.classList.add('image-item');
            imageContainer.appendChild(imgElement);
        });
    };

    // Function to convert ArrayBuffer to Base64
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    // Call the fetchImages function to load and display images on page load
    fetchImages();
});


document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('inputImage');
    const croppedImage = document.getElementById('croppedImage');
    const imageForm = document.getElementById('imageForm');
    const cropBtn = document.getElementById('cropBtn');

    cropBtn.style.display = 'none';

    let cropper = null; 

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            if (cropper) {
                cropper.destroy();
            }

            croppedImage.src = reader.result;

            // Initialize Cropper.js
            cropper = new Cropper(croppedImage, {
                aspectRatio: 1,
                viewMode: 2,
                autoCropArea: 0.8,
                responsive: true,
            });
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    });

    // Handle crop button click
    cropBtn.addEventListener('click', () => {
        const canvas = cropper.getCroppedCanvas();

        if (canvas) {
            croppedImage.src = canvas.toDataURL(); 
            croppedImage.style.display = 'block'; 
            cropBtn.style.display = 'block';
            
        } else {
            console.error('Error cropping image');
            cropBtn.style.display = 'none';
        }
    });

    // Handle form submission
    imageForm.addEventListener('submit', async (event) => {

        if (!cropper) {
            console.error('No image cropped');
            return;
        }

        try {
            const canvas = cropper.getCroppedCanvas();
            const croppedImageData = canvas.toDataURL('image/webp');

            const formData = new FormData(imageForm);
            formData.append('croppedImage', croppedImageData);

            const response = await fetch('https://bistro-boss-server-v2.vercel.app/api/v1/images/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Image uploaded successfully:', data);
                croppedImage.style.display = 'none';
                cropper.destroy();
                cropper = null;
                croppedImage.src = '';
                input.value = '';
            } else {
                console.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    });
});



