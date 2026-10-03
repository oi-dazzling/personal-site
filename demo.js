(function () {
  'use strict';

  var PROJECTS = ['notes', 'palette', 'focus'];
  var TITLES = { notes: '笔记过滤', palette: '配色切换', focus: '专注计时' };
  var root = document.documentElement;

  function each(list, handler) {
    Array.prototype.forEach.call(list, handler);
  }

  function readProject() {
    var value = null;
    try {
      value = new URLSearchParams(window.location.search).get('project');
    } catch (error) {
      value = null;
    }
    return PROJECTS.indexOf(value) === -1 ? 'notes' : value;
  }

  function panelOf(project) {
    return document.getElementById('panel-' + project);
  }

  function applyProject(project, options) {
    var settings = options || {};
    root.setAttribute('data-project', project);
    each(document.querySelectorAll('.switch-link'), function (link) {
      if (link.getAttribute('data-project') === project) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    document.title = TITLES[project] + ' · 交互演示';
    if (settings.focusHeading) {
      var panel = panelOf(project);
      var heading = panel ? panel.querySelector('.panel-title') : null;
      if (heading) {
        heading.focus();
      }
    }
  }

  each(document.querySelectorAll('.switch-link'), function (link) {
    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      var project = link.getAttribute('data-project');
      if (PROJECTS.indexOf(project) === -1) {
        return;
      }
      if (!window.history || !window.history.pushState) {
        return;
      }
      event.preventDefault();
      window.history.pushState({ project: project }, '', './demo.html?project=' + project);
      applyProject(project, { focusHeading: true });
    });
  });

  window.addEventListener('popstate', function () {
    applyProject(readProject(), { focusHeading: true });
  });

  var TAGS = ['设计', '开发', '灵感'];
  var activeTag = 'all';
  var noteSeq = 0;
  var notes = [
    { id: 'seed-1', text: '把首页留白收紧一点，让首屏信息更集中。', tag: '设计', own: false },
    { id: 'seed-2', text: '给作品卡片补一个加载失败的兜底状态。', tag: '开发', own: false },
    { id: 'seed-3', text: '薄荷绿配暖橙，对比更有记忆点。', tag: '设计', own: false },
    { id: 'seed-4', text: '先做最小可用，再逐步打磨。', tag: '灵感', own: false }
  ];

  var tagFilter = document.getElementById('tagFilter');
  var noteList = document.getElementById('noteList');
  var noteForm = document.getElementById('noteForm');
  var noteText = document.getElementById('noteText');
  var noteTag = document.getElementById('noteTag');
  var notesStatus = document.getElementById('notesStatus');

  function announce(element, message) {
    if (!element) {
      return;
    }
    element.textContent = '';
    window.setTimeout(function () {
      element.textContent = message;
    }, 40);
  }

  function renderTagFilter() {
    tagFilter.textContent = '';
    var options = [{ value: 'all', label: '全部' }];
    TAGS.forEach(function (tag) {
      options.push({ value: tag, label: tag });
    });
    options.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'tag-btn';
      button.textContent = option.label;
      button.setAttribute('aria-pressed', activeTag === option.value ? 'true' : 'false');
      button.addEventListener('click', function () {
        activeTag = option.value;
        renderTagFilter();
        tagFilter.querySelector('[aria-pressed="true"]').focus();
        renderNotes();
        announce(notesStatus, '已筛选：' + option.label);
      });
      tagFilter.appendChild(button);
    });
  }

  function renderNotes() {
    noteList.textContent = '';
    var visible = notes.filter(function (note) {
      return activeTag === 'all' || note.tag === activeTag;
    });

    if (!visible.length) {
      var empty = document.createElement('li');
      empty.className = 'note-empty';
      empty.textContent = '这个标签下还没有笔记。';
      noteList.appendChild(empty);
      return;
    }

    visible.forEach(function (note) {
      var item = document.createElement('li');
      item.className = 'note-item';

      var body = document.createElement('div');
      body.className = 'note-body';

      var text = document.createElement('p');
      text.className = 'note-text';
      text.textContent = note.text;

      var meta = document.createElement('p');
      meta.className = 'note-meta';

      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = note.tag;

      var origin = document.createElement('span');
      origin.className = 'note-origin';
      origin.textContent = note.own ? '我添加的' : '示例内容';

      meta.appendChild(chip);
      meta.appendChild(origin);
      body.appendChild(text);
      body.appendChild(meta);
      item.appendChild(body);

      if (note.own) {
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'icon-btn';
        remove.textContent = '删除';
        remove.setAttribute('aria-label', '删除笔记：' + note.text);
        remove.addEventListener('click', function () {
          notes = notes.filter(function (entry) {
            return entry.id !== note.id;
          });
          renderNotes();
          announce(notesStatus, '已删除该笔记');
          noteText.focus();
        });
        item.appendChild(remove);
      }

      noteList.appendChild(item);
    });
  }

  TAGS.forEach(function (tag) {
    var option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    noteTag.appendChild(option);
  });

  noteForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = noteText.value.trim();
    if (!value) {
      announce(notesStatus, '请先输入笔记内容');
      noteText.focus();
      return;
    }
    noteSeq += 1;
    notes.push({ id: 'own-' + noteSeq, text: value, tag: noteTag.value, own: true });
    noteText.value = '';
    if (activeTag !== 'all') {
      activeTag = 'all';
      renderTagFilter();
    }
    renderNotes();
    announce(notesStatus, '已添加笔记');
    noteText.focus();
  });

  var SCHEMES = [
    {
      id: 'charcoal',
      name: '深炭黑',
      colors: [
        { key: 'bg', name: '深炭黑', hex: '#14161A' },
        { key: 'text', name: '米白', hex: '#F7F5F0' },
        { key: 'accent', name: '薄荷绿', hex: '#34D399' },
        { key: 'warm', name: '暖橙', hex: '#F59E0B' }
      ]
    },
    {
      id: 'deepsea',
      name: '深海',
      colors: [
        { key: 'bg', name: '深海蓝', hex: '#0F1A24' },
        { key: 'text', name: '雾白', hex: '#E8F1F2' },
        { key: 'accent', name: '青绿', hex: '#4FD1C5' },
        { key: 'warm', name: '珊瑚橙', hex: '#FF8A5B' }
      ]
    },
    {
      id: 'sand',
      name: '暖砂',
      colors: [
        { key: 'bg', name: '暖砂褐', hex: '#1F1B16' },
        { key: 'text', name: '亚麻白', hex: '#FBF7F0' },
        { key: 'accent', name: '嫩芽绿', hex: '#86EFAC' },
        { key: 'warm', name: '焦糖橙', hex: '#FB923C' }
      ]
    }
  ];

  var schemeTabs = document.getElementById('schemeTabs');
  var swatchList = document.getElementById('swatchList');
  var preview = document.getElementById('preview');
  var paletteStatus = document.getElementById('paletteStatus');

  function readableOn(hex) {
    var value = hex.replace('#', '');
    var channels = [0, 2, 4].map(function (start) {
      var channel = parseInt(value.slice(start, start + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    var luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    return luminance > 0.179 ? '#14161A' : '#F7F5F0';
  }

  function legacyCopy(text) {
    try {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '0';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, text.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch (error) {
      return false;
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }, function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function renderSchemeTabs() {
    schemeTabs.textContent = '';
    SCHEMES.forEach(function (scheme, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'tag-btn';
      button.textContent = scheme.name;
      button.setAttribute('aria-pressed', index === activeScheme ? 'true' : 'false');
      button.addEventListener('click', function () {
        applyScheme(index, false);
        schemeTabs.querySelector('[aria-pressed="true"]').focus();
      });
      schemeTabs.appendChild(button);
    });
  }

  function renderSwatches() {
    swatchList.textContent = '';
    SCHEMES[activeScheme].colors.forEach(function (color) {
      var item = document.createElement('li');

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch';
      button.style.background = color.hex;
      button.style.color = readableOn(color.hex);
      button.setAttribute('aria-label', '复制 ' + color.name + ' ' + color.hex);

      var name = document.createElement('span');
      name.className = 'swatch-name';
      name.textContent = color.name;

      var hex = document.createElement('code');
      hex.className = 'swatch-hex';
      hex.textContent = color.hex;

      button.appendChild(name);
      button.appendChild(hex);
      button.addEventListener('click', function () {
        copyText(color.hex).then(function (ok) {
          if (ok) {
            announce(paletteStatus, '已复制 ' + color.name + ' ' + color.hex);
          } else {
            announce(paletteStatus, '复制失败：请手动选中 ' + color.hex + ' 后复制');
          }
        });
      });

      item.appendChild(button);
      swatchList.appendChild(item);
    });
  }

  var activeScheme = 0;

  function applyScheme(index, silent) {
    activeScheme = index;
    var map = {};
    SCHEMES[index].colors.forEach(function (color) {
      map[color.key] = color.hex;
    });
    preview.style.setProperty('--pv-bg', map.bg);
    preview.style.setProperty('--pv-text', map.text);
    preview.style.setProperty('--pv-accent', map.accent);
    preview.style.setProperty('--pv-warm', map.warm);
    renderSchemeTabs();
    renderSwatches();
    if (!silent) {
      announce(paletteStatus, '已切换到' + SCHEMES[index].name + '配色');
    }
  }

  var FOCUS_TOTAL = 300;
  var focusRemaining = FOCUS_TOTAL * 1000;
  var focusEndAt = 0;
  var focusRunning = false;
  var focusTicker = null;

  var timeDisplay = document.getElementById('timeDisplay');
  var progressTrack = document.getElementById('progressTrack');
  var progressFill = document.getElementById('progressFill');
  var timerState = document.getElementById('timerState');
  var startPause = document.getElementById('startPause');
  var resetBtn = document.getElementById('resetBtn');
  var focusStatus = document.getElementById('focusStatus');

  function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  function renderFocus() {
    var seconds = Math.ceil(focusRemaining / 1000);
    if (seconds < 0) {
      seconds = 0;
    }
    if (seconds > FOCUS_TOTAL) {
      seconds = FOCUS_TOTAL;
    }
    timeDisplay.textContent = formatTime(seconds);
    progressFill.style.transform = 'scaleX(' + (seconds / FOCUS_TOTAL) + ')';
    progressTrack.setAttribute('aria-valuenow', String(seconds));
    progressTrack.setAttribute('aria-valuetext', '剩余 ' + Math.floor(seconds / 60) + ' 分 ' + (seconds % 60) + ' 秒');
  }

  function stopTicker() {
    if (focusTicker !== null) {
      window.clearInterval(focusTicker);
      focusTicker = null;
    }
  }

  function stepFocus() {
    var left = focusEndAt - Date.now();
    if (left <= 0) {
      focusRemaining = 0;
      renderFocus();
      finishFocus();
      return;
    }
    focusRemaining = left;
    renderFocus();
  }

  function startFocus() {
    if (focusRunning) {
      return;
    }
    focusEndAt = Date.now() + focusRemaining;
    focusRunning = true;
    stopTicker();
    focusTicker = window.setInterval(stepFocus, 200);
    timerState.textContent = '进行中';
    startPause.textContent = '暂停';
    announce(focusStatus, '倒计时已开始');
  }

  function pauseFocus() {
    if (!focusRunning) {
      return;
    }
    focusRemaining = Math.max(0, focusEndAt - Date.now());
    focusRunning = false;
    stopTicker();
    renderFocus();
    timerState.textContent = '已暂停';
    startPause.textContent = '继续';
    announce(focusStatus, '倒计时已暂停');
  }

  function finishFocus() {
    focusRunning = false;
    stopTicker();
    timerState.textContent = '已结束';
    startPause.textContent = '重新开始';
    announce(focusStatus, '倒计时结束');
  }

  function resetFocus(silent) {
    focusRunning = false;
    stopTicker();
    focusRemaining = FOCUS_TOTAL * 1000;
    renderFocus();
    timerState.textContent = '未开始';
    startPause.textContent = '开始';
    if (!silent) {
      announce(focusStatus, '已重置为 5 分钟');
    }
  }

  startPause.addEventListener('click', function () {
    if (focusRunning) {
      pauseFocus();
      return;
    }
    if (focusRemaining <= 0) {
      resetFocus(true);
    }
    startFocus();
  });

  resetBtn.addEventListener('click', function () {
    resetFocus(false);
  });

  window.addEventListener('pageshow', function () {
    if (focusRunning) {
      stepFocus();
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (focusRunning && !document.hidden) {
      stepFocus();
    }
  });

  applyProject(readProject(), {});
  renderTagFilter();
  renderNotes();
  applyScheme(0, true);
  renderFocus();
})();
