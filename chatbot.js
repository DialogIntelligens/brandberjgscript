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
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
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
        headerSubtitleG: "Du skriver med en AI. Ved at bruge denne chatbot accepterer du, at samtalen kan gemmes og behandles. Læs mere i vores privatlivspolitik.",
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
    var isTabletView = window.innerWidth < 1000 && window.innerWidth > 800;
    var isPhoneView = window.innerWidth < 800;

    if (isIframeEnlarged) {
        iframe.style.width = 'calc(2 * 45vh + 6vw)';
        iframe.style.height = '90vh';
    } else {
        iframe.style.width = window.innerWidth < 1000 ? '95vw' : 'calc(45vh + 6vw)';
        iframe.style.height = '90vh';
    }

    iframe.style.position = 'fixed';
    iframe.style.left = window.innerWidth < 1000 ? '50%' : 'auto';
    iframe.style.top = window.innerWidth < 1000 ? '50%' : 'auto';
    iframe.style.transform = window.innerWidth < 1000 ? 'translate(-50%, -50%)' : 'none';
    iframe.style.bottom = window.innerWidth < 1000 ? '' : '3vh';
    iframe.style.right = window.innerWidth < 1000 ? '' : '3vh';

    sendMessageToIframe();
}

// Toggle Chat Window Display
function toggleChatWindow() {
    var iframe = document.getElementById('chat-iframe');
    var button = document.getElementById('chat-button');
    var isCurrentlyOpen = iframe.style.display !== 'none';

    iframe.style.display = isCurrentlyOpen ? 'none' : 'block';
    button.style.display = isCurrentlyOpen ? 'block' : 'none';
    localStorage.setItem('chatWindowState', isCurrentlyOpen ? 'closed' : 'open');
    adjustIframeSize();
    sendMessageToIframe();
}

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
            var nextTime = new Date().getTime() + 30000;
            setCookie("nextSpeechBalloonShowTime", nextTime, 1);
            setTimeout(showBalloon, 60000);
        }, 10000);
    }, delay);
}

// Event Listeners and Initialization
window.addEventListener('resize', adjustIframeSize);
document.addEventListener('DOMContentLoaded', function () {
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

    manageSpeechBalloon();
});
