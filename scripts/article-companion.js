(function() {
        var writingSection = document.getElementById('article-content') || document.getElementById('writing');
        if (!writingSection) return;
        var mount = document.createElement('div');
        mount.innerHTML = "<aside\n            id=\"article-companion\"\n            class=\"article-companion\"\n            aria-label=\"Article focus companion\"\n            hidden\n          >\n            <div id=\"focus-bubble\" class=\"focus-bubble\" hidden>\n              <p id=\"focus-message\"></p>\n              <button\n                id=\"dismiss-focus-message\"\n                class=\"focus-bubble__close\"\n                type=\"button\"\n                aria-label=\"Dismiss focus reminder\"\n              >\n                &times;\n              </button>\n            </div>\n            <button\n              id=\"companion-face\"\n              class=\"companion-face\"\n              type=\"button\"\n              aria-label=\"Play with the article companion\"\n            >\n              <span class=\"companion-eyes\" aria-hidden=\"true\">\n                <span class=\"companion-eye\">\n                  <span class=\"companion-pupil\"></span>\n                  <span class=\"companion-eyelid\"></span>\n                </span>\n                <span class=\"companion-eye\">\n                  <span class=\"companion-pupil\"></span>\n                  <span class=\"companion-eyelid\"></span>\n                </span>\n              </span>\n              <span class=\"companion-mouth\" aria-hidden=\"true\"></span>\n            </button>\n            <span\n              id=\"focus-live-region\"\n              class=\"visually-hidden\"\n              aria-live=\"polite\"\n              aria-atomic=\"true\"\n            ></span>\n          </aside>";
        document.body.appendChild(mount.firstElementChild);
        var companion = document.getElementById('article-companion');
        var companionFace = document.getElementById('companion-face');
        var focusBubble = document.getElementById('focus-bubble');
        var focusMessage = document.getElementById('focus-message');
        var dismissFocusMessage = document.getElementById('dismiss-focus-message');
        var focusLiveRegion = document.getElementById('focus-live-region');
        var pupils = companion.querySelectorAll('.companion-pupil');
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        var firstPromptDelay = 45000;
        var repeatPromptDelay = 120000;
        var idleTimer = null;
        var idleDeadline = 0;
        var idleTimeRemaining = firstPromptDelay;
        var hasPrompted = false;
        var sectionIsVisible = false;
        var expressionTimer = null;
        var expressionIndex = 0;
        var messageIndex = 0;
        var pointerFrame = null;
        var latestPointer = null;
        var expressions = ['is-curious', 'is-skeptical', 'is-surprised'];
        var focusMessages = [
          'Still here? \ud83d\udc40',
          'Eyes still on the article?',
          'Quick focus check\u2014still with me?'
        ];

        function companionIsActive() {
          return sectionIsVisible && !document.hidden;
        }

        function hideFocusPrompt() {
          if (document.activeElement === dismissFocusMessage) {
            companionFace.focus({ preventScroll: true });
          }
          focusBubble.hidden = true;
          companion.classList.remove('is-checking-in');
          companionFace.setAttribute('aria-label', 'Play with the article companion');
          focusLiveRegion.textContent = '';
        }

        function setExpression(name) {
          if (reducedMotion.matches) return;
          expressions.forEach(function(expression) {
            companionFace.classList.remove(expression);
          });
          companionFace.classList.add(name);
        }

        function cycleExpression() {
          expressionIndex = (expressionIndex + 1) % expressions.length;
          setExpression(expressions[expressionIndex]);
        }

        function startExpressions() {
          if (reducedMotion.matches || expressionTimer) return;
          expressionTimer = window.setInterval(cycleExpression, 6000);
        }

        function stopExpressions() {
          window.clearInterval(expressionTimer);
          expressionTimer = null;
        }

        function showFocusPrompt() {
          if (!companionIsActive()) return;

          var message = focusMessages[messageIndex];
          messageIndex = (messageIndex + 1) % focusMessages.length;
          hasPrompted = true;
          focusMessage.textContent = message;
          focusLiveRegion.textContent = message;
          focusBubble.hidden = false;
          companion.classList.add('is-checking-in');
          companionFace.setAttribute('aria-label', 'Dismiss focus reminder');
          setExpression('is-surprised');

          idleTimeRemaining = repeatPromptDelay;
          scheduleIdleTimer();
        }

        function scheduleIdleTimer() {
          window.clearTimeout(idleTimer);
          if (!companionIsActive()) return;

          var delay = Math.max(0, idleTimeRemaining);
          idleDeadline = performance.now() + delay;
          idleTimer = window.setTimeout(showFocusPrompt, delay);
        }

        function pauseIdleTimer() {
          if (idleTimer) {
            idleTimeRemaining = Math.max(0, idleDeadline - performance.now());
          }
          window.clearTimeout(idleTimer);
          idleTimer = null;
        }

        function markActivity(event) {
          if (!companionIsActive()) return;
          // Let the close button receive its click/Enter before hiding it.
          if (!event || !focusBubble.contains(event.target)) hideFocusPrompt();
          idleTimeRemaining = hasPrompted ? repeatPromptDelay : firstPromptDelay;
          scheduleIdleTimer();
        }

        function syncCompanion() {
          if (companionIsActive()) {
            if (!companion.hidden) return;
            companion.hidden = false;
            scheduleIdleTimer();
            startExpressions();
          } else {
            pauseIdleTimer();
            stopExpressions();
            window.cancelAnimationFrame(pointerFrame);
            pointerFrame = null;
            hideFocusPrompt();
            companion.hidden = true;
          }
        }

        function movePupils(x, y) {
          if (reducedMotion.matches || !companionIsActive()) return;

          pupils.forEach(function(pupil) {
            var eye = pupil.parentElement;
            var rect = eye.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            var dx = x - (rect.left + rect.width / 2);
            var dy = y - (rect.top + rect.height / 2);
            var angle = Math.atan2(dy, dx);
            var cosine = Math.cos(angle);
            var sine = Math.sin(angle);
            var maxX = rect.width * 0.22;
            var maxY = rect.height * 0.18;
            var edgeDistance = 1 / Math.sqrt(
              (cosine * cosine) / (maxX * maxX) +
              (sine * sine) / (maxY * maxY)
            );
            var distance = Math.min(edgeDistance, Math.sqrt(dx * dx + dy * dy) * 0.09);

            pupil.style.setProperty('--pupil-x', (cosine * distance).toFixed(2) + 'px');
            pupil.style.setProperty('--pupil-y', (sine * distance).toFixed(2) + 'px');
          });
        }

        function handlePointerMove(event) {
          if (!companionIsActive()) return;

          latestPointer = { x: event.clientX, y: event.clientY };
          if (!pointerFrame) {
            pointerFrame = window.requestAnimationFrame(function() {
              movePupils(latestPointer.x, latestPointer.y);
              pointerFrame = null;
            });
          }

          markActivity(event);
        }

        function resetPupils() {
          pupils.forEach(function(pupil) {
            pupil.style.removeProperty('--pupil-x');
            pupil.style.removeProperty('--pupil-y');
          });
        }

        var sectionObserver = new IntersectionObserver(function(entries) {
          sectionIsVisible = entries[0].isIntersecting;
          syncCompanion();
        }, { threshold: 0 });

        sectionObserver.observe(writingSection);

        document.addEventListener('pointermove', handlePointerMove, { passive: true });
        document.addEventListener('pointerdown', handlePointerMove, { passive: true });
        // Browsers cancel pointermove during native touch scrolling.
        document.addEventListener('touchmove', function(event) {
          if (event.touches.length) {
            handlePointerMove({ clientX: event.touches[0].clientX,
              clientY: event.touches[0].clientY, target: event.target });
          }
        }, { passive: true });
        document.addEventListener('scroll', markActivity, { passive: true });
        document.addEventListener('keydown', markActivity);
        document.addEventListener('visibilitychange', syncCompanion);

        companionFace.addEventListener('click', function() {
          hideFocusPrompt();
          cycleExpression();
          markActivity();
        });

        dismissFocusMessage.addEventListener('click', function() {
          hideFocusPrompt();
          markActivity();
          companionFace.focus();
        });

        function handleMotionPreferenceChange() {
          resetPupils();
          if (reducedMotion.matches) {
            stopExpressions();
            expressions.forEach(function(expression) {
              companionFace.classList.remove(expression);
            });
          } else if (companionIsActive()) {
            startExpressions();
          }
        }

        if (reducedMotion.addEventListener) {
          reducedMotion.addEventListener('change', handleMotionPreferenceChange);
        } else {
          reducedMotion.addListener(handleMotionPreferenceChange);
        }
})();

