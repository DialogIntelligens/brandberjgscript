// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Inject CSS into the head
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

    // Inject HTML into the body
    var chatbotHTML = `
    <button id="chat-button" style="cursor: pointer; position: fixed; bottom: 20px; right: 20px; background: none; border: none; z-index: 401;">
      <img src="http://dialogintelligens.dk/wp-content/uploads/2024/04/messageIcon.png" alt="Chat with us" style="width: 60px; height: 60px; transition: opacity 0.3s;">
    </button>

    <div id="speech-balloon">
      <button id="close-balloon" style="position: absolute; top: 5px; right: 5px; background-color: transparent; border: none; font-size: 16px; cursor: pointer;">&times;</button>
    </div>

    <iframe id="chat-iframe" src="https://brandbjerg.onrender.com/" style="display: none; position: fixed; bottom: 3vh; right: 2vw; width: 50vh; height: 90vh; border: none; z-index: 40000;"></iframe>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Now that the elements are in the DOM, we can add event listeners and functions

    // Cookie functions
    function setCookie(name, value, days, domain) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
      }
      var domainStr = domain ? "; domain=" + domain : "";
      document.cookie = name + "=" + (value || "") + expires + domainStr + "; path=/";
    }

    function getCookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }

    var isIframeEnlarged = false;
    var maxRetryAttempts = 5;
    var retryDelay = 500;
    var retryAttempts = 0;

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

      window.addEventListener('message', function(event) {
        if (event.origin === "https://brandbjerg.onrender.com" && event.data.ack === 'integrationOptionsReceived') {
          console.log("Iframe acknowledged receiving integration options");
          retryAttempts = maxRetryAttempts;
        }
      });

      iframe.onload = function() {
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

    window.addEventListener('message', function(event) {
      if (event.origin !== "https://brandbjerg.onrender.com") return;

      if (event.data.action === 'toggleSize') {
        isIframeEnlarged = !isIframeEnlarged;
        adjustIframeSize();
      } else if (event.data.action === 'closeChat') {
        document.getElementById('chat-iframe').style.display = 'none';
        document.getElementById('chat-button').style.display = 'block';
        localStorage.setItem('chatWindowState', 'closed');
      }
    });

    // Attach event listener to chat-button
    document.getElementById('chat-button').addEventListener('click', toggleChatWindow);

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

    function adjustIframeSize() {
      var iframe = document.getElementById('chat-iframe');
      console.log("Adjusting iframe size. Window width: ", window.innerWidth);

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

      sendMessageToIframe(); // Ensure message data is updated and sent
    }

    function manageSpeechBalloon() {
      var hasClosedBalloon = getCookie("hasClosedBalloon");
      if (hasClosedBalloon) {
        document.getElementById('speech-balloon').style.display = 'none';
        return;
      }

      // Get next scheduled show time from cookie
      var nextShowTime = getCookie("nextSpeechBalloonShowTime");
      var now = new Date().getTime();
      var delay = 0;

      if (nextShowTime && parseInt(nextShowTime) > now) {
        // Balloon is scheduled to be shown in the future
        delay = parseInt(nextShowTime) - now;
      }

      // Schedule the balloon to be shown after 'delay' or initial 10-second delay
      setTimeout(function showBalloon() {
        document.getElementById("speech-balloon").style.display = "block"; // Show the balloon
        // Hide the balloon after 11 seconds
        setTimeout(function hideBalloon() {
          document.getElementById("speech-balloon").style.display = "none"; // Hide balloon after 11 seconds
          // Update the next scheduled show time to 10 minutes from now
          var nextTime = new Date().getTime() + 600000; // 10 minutes in milliseconds
          var domain = window.location.hostname;
          var domainParts = domain.split(".");
          if (domainParts.length > 2) {
            // Assume domain is in the format subdomain.domain.tld
            domain = "." + domainParts.slice(-2).join(".");
          } else {
            domain = "." + domain;
          }
          setCookie("nextSpeechBalloonShowTime", nextTime, 1, domain); // Set cookie with domain covering subdomains
          // Call showBalloon function again after 10 minutes (without needing to reload)
          setTimeout(showBalloon, 600000); // 10 minutes wait before showing the balloon again
        }, 11000); // 11 seconds open duration
      }, delay || 10000); // Initial 10-second delay before first show
    }

    // Close button functionality
    var closeBalloonButton = document.getElementById('close-balloon');
    if (closeBalloonButton) {
      closeBalloonButton.addEventListener('click', function() {
        var domain = window.location.hostname;
        var domainParts = domain.split(".");
        if (domainParts.length > 2) {
          // Assume domain is in the format subdomain.domain.tld
          domain = "." + domainParts.slice(-2).join(".");
        } else {
          domain = "." + domain;
        }
        document.getElementById('speech-balloon').style.display = 'none';
        setCookie("hasClosedBalloon", "true", 365, domain); // Store state in cookie for 1 year
      });
    }

    // Initial load and resize adjustments
    adjustIframeSize();
    window.addEventListener('resize', adjustIframeSize);

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

    // Start the speech balloon management when the page loads
    manageSpeechBalloon();
});
