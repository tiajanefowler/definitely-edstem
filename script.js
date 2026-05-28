// checking my code quality?
"use strict";
(function() {
  let selectedId = null;

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

    initHeartToggles();
    // auto-select the top thread on load
    const firstRow = document.querySelector('.thread-row');
    if (firstRow) firstRow.click();
  }

  function initHeartToggles() {
    qsa('.post-vote-heart, .heart-outline').forEach(heartEl => {
      const countEl = heartEl.nextElementSibling;
      if (!countEl || !countEl.textContent.trim()) {
        return;
      }

      if (!countEl.dataset.baseCount) {
        countEl.dataset.baseCount = String(parseInt(countEl.textContent, 10) || 0);
      }

      heartEl.addEventListener('click', function() {
        const isLiked = heartEl.classList.toggle('heart-filled');
        const baseCount = parseInt(countEl.dataset.baseCount, 10) || 0;
        countEl.textContent = String(isLiked ? baseCount + 1 : baseCount);
      });
    });
  }

  function applySearch() {
    let searchText = id("thread-search").value.trim().toLowerCase();
    let anyVisibleSelected = false;
    qsa('.thread-row').forEach(row => {
      const title = (row.dataset.title || '').toLowerCase();
      const preview = (row.dataset.preview || '').toLowerCase();
      const author = (row.dataset.author || '').toLowerCase();
      const matches = !searchText || title.includes(searchText) || preview.includes(searchText) || author.includes(searchText);
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

    id("post-avatar").style.background = row.dataset.avatarColor || '#dbdbdb';
    const postAuthorEl = id("post-author");
    let authorNameSpan = postAuthorEl.querySelector('.post-author-name');
    if (!authorNameSpan) {
      authorNameSpan = document.createElement('span');
      authorNameSpan.className = 'post-author-name';
      postAuthorEl.appendChild(authorNameSpan);
    }
    authorNameSpan.textContent = row.dataset.author || '';
    authorNameSpan.style.color = row.dataset.authorColor || '#000';

    const postMetaEl = id('post-meta');
    postMetaEl.textContent = '';
    postMetaEl.appendChild(document.createTextNode(row.dataset.time || ''));
    postMetaEl.appendChild(document.createTextNode(' in '));
    const metaStrong = document.createElement('strong');
    metaStrong.className = 'meta-category';
    metaStrong.textContent = row.dataset.category || '';
    postMetaEl.appendChild(metaStrong);
    const titleEl = id("detail-title");
    titleEl.textContent = row.dataset.title || '';
    const existingNum = titleEl.querySelector('.thread-number');
    if (existingNum) existingNum.remove();
    const numSpan = document.createElement('span');
    numSpan.className = 'thread-number';
    numSpan.textContent = ' #' + (row.dataset.threadId || '');
    titleEl.appendChild(numSpan);
    id("detail-content").textContent = row.dataset.body || '';
    id("post-views").textContent = row.dataset.views || '';
    id("answer-count").textContent = (row.dataset.answerCount || '1') + ' Answer';
    id("answer-avatar").style.background = row.dataset.answerAvatarColor || '#17d1f2';
    id("answer-author").textContent = row.dataset.answerAuthor || '';
    id("answer-time").textContent = row.dataset.answerTime || '';
    id("answer-content").textContent = row.dataset.answerContent || '';
    id("answer-likes").textContent = row.dataset.answerLikes || '';
    id("comment-avatar").style.background = row.dataset.commentAvatarColor || '#dbdbdb';
    qsa(".comment-author")[0].textContent = row.dataset.commentAuthor || '';
    qsa(".comment-time")[0].textContent = row.dataset.commentTime || '';
    qsa(".comment-body")[0].textContent = row.dataset.commentContent || '';
    qsa(".comment-like-count")[0].textContent = row.dataset.commentLikes || '';

    id("thread-detail").classList.remove("is-hidden");
  }

  function showEmptyState() {
    id("thread-detail").classList.add("is-hidden");
    id("empty-state").classList.remove("is-hidden");
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
