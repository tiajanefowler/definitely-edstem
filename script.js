// it might be spooky but at least i used the module pattern!
"use strict";
(function() {
  let selectedId = null;
  let allHeartsCelebrationShown = false;
  let successCelebrationRunning = false;

  window.addEventListener("load", init);

  function init() {
    id("thread-search").addEventListener("input", applySearch);
    id("clear-search").addEventListener("click", clearSearch);
    qsa('.thread-row').forEach(row => row.addEventListener('click', selectThread));

    const newThreadBtn = id('new-thread');
    if (newThreadBtn) {
      newThreadBtn.addEventListener('click', triggerBeetFly);
    }

    const postAnswerBtn = id('post-answer');
    if (postAnswerBtn) {
      postAnswerBtn.addEventListener('click', triggerBeetFly);
    }

    const filterBtn = id('filter-button');
    if (filterBtn) {
      filterBtn.addEventListener('click', triggerBeetFly);
    }

    const answerTextarea = id('your-answer-textarea');
    const answerTextareaWrap = id('answer-textarea-wrap');
    if (answerTextarea && answerTextareaWrap) {
      const dawgImageCount = 36;
      let dawgImageIndex = 1;
      let previousAnswerLength = 0;

      answerTextarea.addEventListener('input', function() {
        const currentLength = answerTextarea.value.length;
        const addedChars = Math.max(0, currentLength - previousAnswerLength);

        if (addedChars > 0) {
          dawgImageIndex = ((dawgImageIndex + addedChars - 1) % dawgImageCount) + 1;
          answerTextareaWrap.style.setProperty('--answer-bg-image', 'url("images/dawg./' + dawgImageIndex + '.png")');
        }

        if (currentLength > 0) {
          answerTextareaWrap.classList.add('is-fig-bg');
        } else {
          answerTextareaWrap.classList.remove('is-fig-bg');
          answerTextareaWrap.style.removeProperty('--answer-bg-image');
          dawgImageIndex = 1;
        }

        previousAnswerLength = currentLength;
      });
    }

    initAllHeartsPopup();
    initReplyHearts();
    initHeartToggles();
    // auto-select the top thread on load
    const firstRow = document.querySelector('.thread-row');
    if (firstRow) firstRow.click();
  }

  function initAllHeartsPopup() {
    const popup = id('all-hearts-popup');
    if (!popup) return;

    popup.addEventListener('click', function(event) {
      if (event.target === popup) {
        hideAllHeartsPopup();
      }
    });
  }

  function initReplyHearts() {
    qsa('.thread-reply .comment-actions').forEach(actionsEl => {
      const existingHeart = actionsEl.querySelector('.heart-outline');
      const existingCount = actionsEl.querySelector('.comment-like-count');
      if (existingCount) {
        existingCount.dataset.hideZero = 'true';
        if ((parseInt(existingCount.dataset.baseCount || '0', 10) || 0) === 0 &&
            !actionsEl.querySelector('.heart-filled')) {
          existingCount.textContent = '';
        }
      }
      if (existingHeart && existingCount) return;

      const heartEl = document.createElement('span');
      heartEl.className = 'heart-outline small';
      heartEl.setAttribute('aria-hidden', 'true');
      heartEl.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' +
        '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>' +
        '</svg>';

      const countEl = document.createElement('span');
      countEl.className = 'comment-like-count';
      countEl.dataset.baseCount = '0';
      countEl.dataset.hideZero = 'true';
      countEl.textContent = '';

      actionsEl.insertBefore(countEl, actionsEl.firstChild);
      actionsEl.insertBefore(heartEl, countEl);
    });
  }

  function initHeartToggles() {
    qsa('.post-vote-heart, .heart-outline').forEach(heartEl => {
      const countEl = heartEl.nextElementSibling;
      if (!countEl) return;

      if (!countEl.dataset.baseCount) {
        countEl.dataset.baseCount = String(parseInt(countEl.textContent, 10) || 0);
      }

      if (countEl.dataset.hideZero === 'true' &&
          (parseInt(countEl.dataset.baseCount, 10) || 0) === 0 &&
          !heartEl.classList.contains('heart-filled')) {
        countEl.textContent = '';
      }

      heartEl.addEventListener('click', function() {
        const isLiked = heartEl.classList.toggle('heart-filled');
        const baseCount = parseInt(countEl.dataset.baseCount, 10) || 0;
        const shouldHideZero = countEl.dataset.hideZero === 'true';
        if (isLiked) {
          countEl.textContent = String(baseCount + 1);
        } else {
          countEl.textContent = shouldHideZero && baseCount === 0 ? '' : String(baseCount);
        }
        checkAllHeartsFilled();
      });
    });
  }

  function getAllHeartElements() {
    return qsa('.post-vote-heart, .heart-outline');
  }

  function areAllHeartsFilled() {
    const hearts = getAllHeartElements();
    return hearts.length > 0 && Array.from(hearts).every(heartEl => heartEl.classList.contains('heart-filled'));
  }

  function checkAllHeartsFilled() {
    if (allHeartsCelebrationShown || successCelebrationRunning) return;
    if (!areAllHeartsFilled()) return;
    addArtieSidebarCheckmark();
    triggerSuccessCelebration();
  }

  function addArtieSidebarCheckmark() {
    const artieRow = document.querySelector('.thread-row[data-thread-id="199"] .thread-title-row');
    if (!artieRow) return;
    if (artieRow.querySelector('.thread-title-check')) return;

    const checkEl = document.createElement('span');
    checkEl.className = 'thread-title-check';
    checkEl.setAttribute('aria-hidden', 'true');
    checkEl.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' +
      '<path d="m20 6-11 11-5-5"></path>' +
      '</svg>';
    artieRow.appendChild(checkEl);
  }

  function triggerSuccessCelebration() {
    if (allHeartsCelebrationShown || successCelebrationRunning) return;
    successCelebrationRunning = true;

    const perSideCount = 10;
    const spawnStaggerMs = 85;

    for (let i = 0; i < perSideCount; i++) {
      window.setTimeout(function() {
        spawnSingleSuccess(false);
        spawnSingleSuccess(true);
      }, i * spawnStaggerMs);
    }

    const revealDelay = (perSideCount * spawnStaggerMs) + 1200;
    window.setTimeout(function() {
      showAllHeartsPopup();
      allHeartsCelebrationShown = true;
      successCelebrationRunning = false;
    }, revealDelay);
  }

  function spawnSingleSuccess(fromRight) {
    const successImg = document.createElement('img');
    successImg.className = 'success-fly ' + (fromRight ? 'success-fly--right' : 'success-fly--left');
    successImg.src = 'images/success.png';
    successImg.alt = '';
    successImg.setAttribute('aria-hidden', 'true');

    const minTop = 60;
    const maxTop = Math.max(minTop, window.innerHeight - 150);
    const randomTop = Math.floor(minTop + Math.random() * (maxTop - minTop + 1));
    successImg.style.top = randomTop + 'px';

    if (fromRight) {
      successImg.style.right = (-220 + Math.random() * 140) + 'px';
      successImg.style.left = 'auto';

      const midX = -(34 + Math.random() * 28);
      const midY = -6 - Math.random() * 18;
      const exitX = -(95 + Math.random() * 30);
      const exitY = -12 - Math.random() * 24;

      successImg.style.setProperty('--success-mid-x', midX.toFixed(2) + 'vw');
      successImg.style.setProperty('--success-mid-y', midY.toFixed(2) + 'vh');
      successImg.style.setProperty('--success-exit-x', exitX.toFixed(2) + 'vw');
      successImg.style.setProperty('--success-exit-y', exitY.toFixed(2) + 'vh');
    } else {
      successImg.style.left = (-220 + Math.random() * 140) + 'px';

      const midX = 34 + Math.random() * 28;
      const midY = -6 - Math.random() * 18;
      const exitX = 95 + Math.random() * 30;
      const exitY = -12 - Math.random() * 24;

      successImg.style.setProperty('--success-mid-x', midX.toFixed(2) + 'vw');
      successImg.style.setProperty('--success-mid-y', midY.toFixed(2) + 'vh');
      successImg.style.setProperty('--success-exit-x', exitX.toFixed(2) + 'vw');
      successImg.style.setProperty('--success-exit-y', exitY.toFixed(2) + 'vh');
    }

    successImg.style.width = (120 + Math.random() * 70) + 'px';
    successImg.style.animationDuration = (2.4 + Math.random() * 0.9) + 's';

    document.body.appendChild(successImg);
    successImg.addEventListener('animationend', function() {
      successImg.remove();
    });
  }

  function showAllHeartsPopup() {
    const popup = id('all-hearts-popup');
    if (!popup) return;

    popup.hidden = false;
    popup.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(function() {
      popup.classList.add('is-visible');
    });
  }

  function hideAllHeartsPopup() {
    const popup = id('all-hearts-popup');
    if (!popup) return;

    popup.classList.remove('is-visible');
    popup.setAttribute('aria-hidden', 'true');
    window.setTimeout(function() {
      popup.hidden = true;
    }, 350);
  }

  function applySearch() {
    let searchText = id("thread-search").value.trim().toLowerCase();
    let anyVisibleSelected = false;
    qsa('.thread-row').forEach(row => {
      const titleEl = row.querySelector('.thread-title');
      const authorEl = row.querySelector('.thread-author');
      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const author = authorEl ? authorEl.textContent.toLowerCase() : '';
      const matches = !searchText || title.includes(searchText) || author.includes(searchText);
      row.style.display = matches ? '' : 'none';
      if (matches && String(row.dataset.threadId) === String(selectedId)) anyVisibleSelected = true;
    });

    if (!anyVisibleSelected) {
      selectedId = null;
      showEmptyState();
    }
  }

  function clearSearch() {
    id("thread-search").value = "";
    applySearch();
  }

  function selectThread() {
    const row = this;
    selectedId = row.dataset.threadId;
    qsa('.thread-row').forEach(r => r.classList.remove('active'));
    row.classList.add('active');
    qsa('.thread-detail-view').forEach(view => {
      view.hidden = String(view.dataset.threadId) !== String(selectedId);
    });
  }

  function showEmptyState() {
    qsa('.thread-detail-view').forEach(view => {
      view.hidden = true;
    });
  }

  function triggerBeetFly() {
    const beetCount = 12;
    for (let i = 0; i < beetCount; i++) {
      const spawnDelay = i * 90;
      window.setTimeout(function() {
        spawnSingleBeet();
      }, spawnDelay);
    }
  }

  function spawnSingleBeet() {
    const beet = document.createElement('img');
    beet.className = 'beet-fly';
    beet.src = 'images/super-beet.png';
    beet.alt = '';
    beet.setAttribute('aria-hidden', 'true');

    const minTop = 70;
    const maxTop = Math.max(minTop, window.innerHeight - 160);
    const randomTop = Math.floor(minTop + Math.random() * (maxTop - minTop + 1));
    beet.style.top = randomTop + 'px';
    beet.style.left = (-220 + Math.random() * 140) + 'px';

    const centerX = 38 + Math.random() * 36;
    const centerY = -4 - Math.random() * 22;
    const driftX = centerX + 6 + Math.random() * 14;
    const driftY = centerY - (2 + Math.random() * 8);
    const exitX = 110 + Math.random() * 35;
    const exitY = -18 - Math.random() * 30;

    beet.style.setProperty('--beet-center-x', centerX.toFixed(2) + 'vw');
    beet.style.setProperty('--beet-center-y', centerY.toFixed(2) + 'vh');
    beet.style.setProperty('--beet-drift-x', driftX.toFixed(2) + 'vw');
    beet.style.setProperty('--beet-drift-y', driftY.toFixed(2) + 'vh');
    beet.style.setProperty('--beet-exit-x', exitX.toFixed(2) + 'vw');
    beet.style.setProperty('--beet-exit-y', exitY.toFixed(2) + 'vh');

    beet.style.width = (150 + Math.random() * 80) + 'px';
    beet.style.animationDuration = (2.5 + Math.random() * 0.8) + 's';

    document.body.appendChild(beet);
    beet.addEventListener('animationend', function() {
      beet.remove();
    });
  }

  function id(id) {
    return document.getElementById(id);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();
