// Function to set a cookie with an optional domain
function setCookie(name, value, days, domain) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  var domainStr = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=${value || ''}${expires}${domainStr}; path=/`;
}

// Function to get a cookie value by name
function getCookie(name) {
  var nameEQ = `${name}=`;
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

var isIframeEnlarged = false;
var maxRetryAttempts = 5;
var retryAttempts = 0;

// Send integration options to the iframe
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

  // Function to try sending the message to iframe with retries
  function trySendingMessage() {
    if (retryAttempts < maxRetryAttempts) {
      iframeWindow.postMessage(messageData, "https://brandbjerg.onrender.com/");
      retryAttempts++;
    } else {
      console.error("Failed to send message to iframe after multiple attempts");
    }
  }

  iframe.onload = function() {
    retryAttempts = 0;
    trySendingMessage();
  };

  setTimeout(function retrySending() {
    if (retryAttempts < maxRetryAttempts) {
      trySendingMessage();
    }
  }, 500);
}

// Event listener for postMessage to toggle the chat window size or close it
window.addEventListener('message', function(event) {
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

// Toggle chat window display
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

// Adjust iframe size based on device width
function adjustIframeSize() {
  var iframe = document.getElementById('chat-iframe');
  var isTabletView = window.innerWidth < 1000 && window.innerWidth > 800;
  var isPhoneView = window.innerWidth < 800;

  iframe.style.width = isIframeEnlarged ? 'calc(2 * 45vh + 6vw)' : (window.innerWidth < 1000 ? '95vw' : 'calc(45vh + 6vw)');
  iframe.style.height = '90vh';
  iframe.style.position = 'fixed';
  iframe.style.left = window.innerWidth < 1000 ? '50%' : 'auto';
  iframe.style.transform = window.innerWidth < 1000 ? 'translate(-50%, -50%)' : 'none';
}

// Manage speech balloon visibility and scheduling
function manageSpeechBalloon() {
  if (getCookie("hasClosedBalloon")) return;

  setTimeout(function showBalloon() {
    document.getElementById("speech-balloon").style.display = "block";
    setTimeout(function hideBalloon() {
      document.getElementById("speech-balloon").style.display = "none";
      var nextTime = new Date().getTime() + 600000; // 10 minutes
      setCookie("nextSpeechBalloonShowTime", nextTime, 1, window.location.hostname);
    }, 11000); // Show for 11 seconds
  }, 10000); // Initial delay of 10 seconds
}

// On page load
document.addEventListener('DOMContentLoaded', function() {
  var savedState = localStorage.getItem('chatWindowState');
  var iframe = document.getElementById('chat-iframe');
  var button = document.getElementById('chat-button');
  
  if (savedState === 'open') {
    iframe.style.display = 'block';
    button.style.display = 'none';
    sendMessageToIframe();
  }

  manageSpeechBalloon();
});

// Resize adjustments
window.addEventListener('resize', adjustIframeSize);
