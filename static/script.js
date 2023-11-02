document.addEventListener("DOMContentLoaded", function () {
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");
    let processing = false; 
    let userMessage = null; // Variable to store user's message
    const inputInitHeight = chatInput.scrollHeight;
    const addInitialOutgoingMessage = () => {
        const initialOutgoingMessage = createChatLi("👋 Hi, how may I assist you today?", "incoming");
        chatbox.appendChild(initialOutgoingMessage);
    };
    const createChatLi = (message, className) => {
        // Create a chat <li> element with passed message and className
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", `${className}`);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi; // return chat <li> element
    }
    const generateResponse = (chatElement, callback) => {
        const messageElement = chatElement.querySelector("p");
        // You should set the text content here or use it further in this function.
        // For example:
        // Add the loading effect with the "pulse" class
        messageElement.innerHTML = '<div id="lottie-container"></div>' 
       // Define the fetch request configuration outside the function
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_message: userMessage })
        };
        const lottieContainer = document.getElementById("lottie-container");
        lottieContainer.style.width = '18px'; // Set the desired width
        lottieContainer.style.height = '18px'; // Set the desired height
        // Load and play the Lottie animation
        lottie.loadAnimation({
            container: lottieContainer, // DOM element to render the animation
            renderer: 'svg', // or 'canvas' or 'html'
            loop: true, // Set to true for looping
            autoplay: true, // Set to true to start playing immediately
            path: 'static/animation_lnwyhd03.json', // Path to your Lottie JSON file
        });
        // Send a POST request to your Flask app (same origin), get the response, and set it as the paragraph text
        fetch("/chatbot", requestOptions)
            .then(res => res.json())
            .then(data => {
            // Assuming data.bot_response contains a message with the URL
            const responseText = data.bot_response;
    
            // Regular expression to find URLs in the text
            const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%=~_|$?!:,.]*[A-Z0-9+&@#/%=~_|$])/gi;
    
            // Replace URLs with clickable links
            const messageWithLinks = responseText.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
            // Set the modified message as innerHTML
            messageElement.innerHTML = messageWithLinks;
            callback();
            })
            .catch(() => {
                messageElement.classList.add("error");
                messageElement.textContent = "Oops! Something went wrong. Please try again.";
                callback();
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
        }
    const handleChat = () => {
        if (processing) {
            return; // Don't handle new input when the chatbot is processing
        }    
        processing = true;
        // sendChatBtn.style.display = 'none';
        userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
        if(!userMessage) return;
        // Clear the input textarea and set its height to default
        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;
    
        // Append the user's message to the chatbox
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
            
        setTimeout(() => {
            // Display "Thinking..." message while waiting for the response
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi, () => {
                // Callback to enable input when the response is received
                processing = false;
                // sendChatBtn.style.display();
            });
        }, 600);    
    }    

    chatInput.addEventListener("input", () => {
        // Adjust the height of the input textarea based on its content
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });
    
    chatInput.addEventListener("keydown", (e) => {
        // If Enter key is pressed without Shift key and the window 
        // width is greater than 800px, handle the chat
        if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });
    addInitialOutgoingMessage();
    sendChatBtn.addEventListener("click", handleChat);
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    });
    
    