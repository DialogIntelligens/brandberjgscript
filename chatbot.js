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

// JavaScript for handling the chatbot logic
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

  iframe.onload = function () {
    iframeWindow.postMessage(messageData, "https://brandbjerg.onrender.com/");
  };
}

function adjustIframeSize() {
  var iframe = document.getElementById('chat-iframe');
  var isPhoneView = window.innerWidth < 800;

  if (isPhoneView) {
    iframe.style.width = '95vw';
    iframe.style.height = '90vh';
  } else {
    iframe.style.width = '50vh';
    iframe.style.height = '90vh';
  }

  sendMessageToIframe();
}

// Event Listeners
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
});
