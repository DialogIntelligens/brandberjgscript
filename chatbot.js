// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Dynamically inject CSS for chatbot
    var css = `
      #chat-button:hover {
        opacity: 0.7;
        transform: scale(1.1);
      }
      #speech-balloon {
        display: none;
        position: fixed;
        bottom: 75px;
        right: 80px;
        width: 205px;
        height: 90px;
        background-image: url('https://dialogintelligens.dk/wp-content/uploads/2024/09/Speech-balloon-11.gif');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 1500;
      }
      #close-balloon {
        color: white;
        font-weight: bold;
      }
      #close-balloon:hover {
        color: red;
      }
    `;
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // Inject chatbot HTML into the body
    var chatbotHTML = `
      <button id="chat-button" onclick="toggleChatWindow()" style="cursor: pointer; position: fixed; bottom: 20px; right: 20px; background: none; border: none; z-index: 401;">
        <img src="http://dialogintelligens.dk/wp-content/uploads/2024/04/messageIcon.png" alt="Chat with us" style="width: 60px; height: 60px; transition: opacity 0.3s;">
      </button>
      <div id="speech-balloon">
        <button id="close-balloon" style="position: absolute; top: 5px; right: 5px; background-color: transparent; border: none; font-size: 16px; cursor: pointer;">&times;</button>
      </div>
      <iframe id="chat-iframe" src="https://brandbjerg.onrender.com/" style="display: none; position: fixed; bottom: 3vh; right: 2vw; width: 50vh; height: 90vh; border: none; z-index: 40000;"></iframe>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Now that the elements are added, we can proceed to initialize variables and add event listeners
    initializeChatbot();
});

function initializeChatbot() {
    // Cookie Management Functions
    function setCookie(name, value, days, domain) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        var domainStr = domain ? "; domain=" + domain : "";
        document.cookie = name + "=" + (value || "") + expires + domainStr + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    // Variables and Configurations
    var isIframeEnlarged = false;
    var maxRetryAttempts = 5;
    var retryDelay = 500;
    var retryAttempts = 0;

    // Send Message to Iframe
    function sendMessageToIframe() {
        var iframe = document.getElementById('chat-iframe');
        var iframeWindow = iframe.contentWindow;

        var messageData = {
            action: 'integrationOptions',
            SOCKET_SERVER_URL: "https://den-megtige-maskine.onrender.com",
            apiEndpoint: "https://den-megtige-maskine.onrender.com/api/v1/prediction/f0243d9a-338a-4adf-82c5-fb037a667a8e",
            titleLogoG: "https://dialogintelligens.dk/wp-content/uploads/2024/04/chatIcon.png",
            AILogo: "http://dialogintelligens.dk/wp-content/uploads/2024/04/logo-3.png",
            headerLogoG: "http://dialogintelligens.dk/wp-content/uploads/2024/08/Chatbot-ikon-Brandbjerg.png",
            themeColor: "#e18107",
            pagePath: "https://dialogintelligens.dk/",
            headerTitleG: "Brandbjergs AI Drage",
            headerSubtitleG: "Du skriver med en AI. Ved at bruge denne chatbot accepterer du, at samtalen kan gemmes og behandles.",
            titleG: "Brandbjerg Højskole",
            isTabletView: window.innerWidth < 1000 && window.innerWidth > 800,
            isPhoneView: window.innerWidth < 800
        };

        function trySendingMessage() {
            if (retryAttempts < maxRetryAttempts) {
                iframeWindow.postMessage(messageData, "https://brandbjerg.onrender.com/");
                retryAttempts++;
            } else {
                console.error("Failed to send message to iframe after multiple attempts");
            }
        }

        iframe.onload = function () {
            retryAttempts = 0;
            trySendingMessage();
        };

        setTimeout(function retrySending() {
            if (retryAttempts < maxRetryAttempts) {
                trySendingMessage();
                setTimeout(retrySending, retryDelay);
            }
        }, retryDelay);
    }

    // Iframe Size Adjustment
    function adjustIframeSize() {
        var iframe = document.getElementById('chat-iframe');
        var isPhoneView = window.innerWidth < 800;

        if (isIframeEnlarged) {
            iframe.style.width = 'calc(2 * 45vh + 6vw)';
            iframe.style.height = '90vh';
        } else {
            iframe.style.width = isPhoneView ? '95vw' : 'calc(45vh + 6vw)';
            iframe.style.height = '90vh';
        }

        iframe.style.position = 'fixed';
        iframe.style.left = isPhoneView ? '50%' : 'auto';
        iframe.style.top = isPhoneView ? '50%' : 'auto';
        iframe.style.transform = isPhoneView ? 'translate(-50%, -50%)' : 'none';
        iframe.style.bottom = isPhoneView ? '' : '3vh';
        iframe.style.right = isPhoneView ? '' : '3vh';

        sendMessageToIframe();
    }

    // Toggle Chat Window Display
    window.toggleChatWindow = function () {
        var iframe = document.getElementById('chat-iframe');
        var button = document.getElementById('chat-button');
        var isCurrentlyOpen = iframe.style.display !== 'none';

        iframe.style.display = isCurrentlyOpen ? 'none' : 'block';
        button.style.display = isCurrentlyOpen ? 'block' : 'none';
        localStorage.setItem('chatWindowState', isCurrentlyOpen ? 'closed' : 'open');
        adjustIframeSize();
        sendMessageToIframe();
    };

    // Speech Balloon Management
    function manageSpeechBalloon() {
        var hasClosedBalloon = getCookie("hasClosedBalloon");
        if (hasClosedBalloon) return;

        var nextShowTime = getCookie("nextSpeechBalloonShowTime");
        var now = new Date().getTime();
        var delay = nextShowTime && parseInt(nextShowTime) > now ? parseInt(nextShowTime) - now : 10000;

        setTimeout(function showBalloon() {
            document.getElementById("speech-balloon").style.display = "block";
            setTimeout(function hideBalloon() {
                document.getElementById("speech-balloon").style.display = "none";
                var nextTime = new Date().getTime() + 600000; // 10 minutes
                setCookie("nextSpeechBalloonShowTime", nextTime, 1);
                setTimeout(showBalloon, 600000);
            }, 11000); // Show for 11 seconds
        }, delay);
    }

    // Close button functionality for speech balloon
    var closeBalloonButton = document.getElementById('close-balloon');
    if (closeBalloonButton) {
        closeBalloonButton.addEventListener('click', function () {
            var domain = window.location.hostname;
            var domainParts = domain.split(".");
            if (domainParts.length > 2) {
                domain = "." + domainParts.slice(-2).join(".");
            } else {
                domain = "." + domain;
            }
            document.getElementById('speech-balloon').style.display = 'none';
            setCookie("hasClosedBalloon", "true", 365, domain);
        });
    }

    // Event Listeners
    window.addEventListener('resize', adjustIframeSize);
    window.addEventListener('message', function (event) {
        if (event.origin !== "https://brandbjerg.onrender.com") return;

        var iframe = document.getElementById('chat-iframe');

        if (event.data.action === 'toggleSize') {
            isIframeEnlarged = !isIframeEnlarged;
            adjustIframeSize();
        } else if (event.data.action === 'closeChat') {
            iframe.style.display = 'none';
            document.getElementById('chat-button').style.display = 'block';
            localStorage.setItem('chatWindowState', 'closed');
        }
    });

    // Initialize chatbot state
    var savedState = localStorage.getItem('chatWindowState');
    var iframe = document.getElementById('chat-iframe');
    var button = document.getElementById('chat-button');

    if (savedState === 'open') {
        iframe.style.display = 'block';
        button.style.display = 'none';
        sendMessageToIframe();
    } else {
        iframe.style.display = 'none';
        button.style.display = 'block';
    }

    // Start speech balloon management
    manageSpeechBalloon();
}
