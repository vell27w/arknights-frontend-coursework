'use strict';

const status = document.querySelector('#site-status');
status.hidden = true;
let toastTimer;
function notify(message) {
  status.textContent = message;
  status.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { status.textContent = ''; status.hidden = true; }, 5000);
}

const header = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
header.classList.add('menu-ready');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  header.classList.toggle('menu-open', open);
  menuToggle.textContent = open ? '收起' : '菜单';
});
header.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '菜单';
    menuToggle.focus();
  }
});
document.querySelector('.share-button').addEventListener('click', async () => {
  try {
    if (navigator.share) await navigator.share({title: document.title, url: location.href});
    else if (navigator.clipboard && location.protocol !== 'file:') {
      await navigator.clipboard.writeText(location.href);
      notify('页面链接已复制');
    } else notify('可复制浏览器地址栏中的链接分享此页面');
  } catch (error) {
    if (error.name !== 'AbortError') notify('暂时无法分享，可复制地址栏中的链接');
  }
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(index, focus = false) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
  });
  if (focus) tabs[index].focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(index));
  tab.addEventListener('keydown', event => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    activateTab(next, true);
  });
});

const slides = [...document.querySelectorAll('.slide')];
if (slides.length) {
  const region = document.querySelector('.box-middle');
  const pause = document.querySelector('#carousel-pause');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, paused = reducedMotion.matches, hovered = false;
  function showSlide(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    document.querySelector('#slide-status').textContent = `${index + 1} / ${slides.length}`;
  }
  function reflectPause() {
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? '继续轮播' : '暂停轮播';
  }
  reflectPause();
  document.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => showSlide(index + Number(button.dataset.slide))));
  pause.addEventListener('click', () => { paused = !paused; reflectPause(); });
  region.addEventListener('mouseenter', () => { hovered = true; });
  region.addEventListener('mouseleave', () => { hovered = false; });
  reducedMotion.addEventListener('change', event => { if (event.matches) { paused = true; reflectPause(); } });
  setInterval(() => {
    if (!paused && !hovered && !document.hidden && !region.contains(document.activeElement)) showSlide(index + 1);
  }, 4500);
}

const choices = [...document.querySelectorAll('.operator-choice')];
choices.forEach((button, index) => {
  button.addEventListener('click', () => {
    const data = button.querySelector('img').dataset;
    document.querySelector('#main-image').src = data.image;
    document.querySelector('#main-image').alt = `${data.name}立绘`;
    document.querySelector('#character-name').textContent = data.name;
    document.querySelector('#character-description').textContent = data.description.trim();
    document.querySelector('.operator-shadow').src = data.image;
    document.querySelector('#character-en').textContent = data.en;
    document.querySelector('.operator-wordmark').textContent = data.en;
    setPortraitPosition(data.name);
    choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
  });
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + choices.length) % choices.length;
    choices[next].focus(); choices[next].click();
  });
});
function setPortraitPosition(name) {
  const positions = { '凯尔希': '50.7%', '阿米娅': '54.1%', '陈': '41.8%', '德克萨斯': '53%' };
  document.querySelector('.page-oper .container')?.style.setProperty('--art-x', positions[name]);
}
document.querySelectorAll('.menu-item').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.page-world .text').textContent = button.dataset.text;
    document.querySelectorAll('.menu-item').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
});

const form = document.querySelector('.login-form');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const username = form.querySelector('#username');
    const password = form.querySelector('#password');
    const agreement = form.querySelector('#agreement');
    const feedback = form.querySelector('#login-feedback');
    feedback.classList.remove('success');
    username.setAttribute('aria-invalid', String(!username.value.trim()));
    password.setAttribute('aria-invalid', String(!password.value.trim()));
    agreement.setAttribute('aria-invalid', String(!agreement.checked));
    if (!username.value.trim()) { feedback.textContent = '请输入虚构的演示账号。'; username.focus(); return; }
    if (!password.value.trim()) { feedback.textContent = '请输入虚构的演示密码。'; password.focus(); return; }
    if (!agreement.checked) { feedback.textContent = '请先确认理解演示说明。'; agreement.focus(); return; }
    form.reset();
    feedback.classList.add('success');
    feedback.textContent = '表单校验通过，输入已清空。这是演示，不会创建账号或登录会话。';
  });
}

const video = document.querySelector('.hero-video');
if (video) {
  const sound = document.querySelector('#sound-toggle');
  video.muted = true;
  function reflectSound() {
    const enabled = !video.muted && !video.paused;
    sound.setAttribute('aria-pressed', String(enabled));
    sound.setAttribute('aria-label', enabled ? '关闭背景声音' : '开启背景声音');
    sound.title = enabled ? '关闭背景声音' : '开启背景声音';
  }
  async function play() {
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    try { await video.play(); } catch { notify('视频未能播放，可以继续浏览静态封面'); }
    reflectSound();
  }
  sound.addEventListener('click', async () => {
    if (video.paused) { video.muted = false; await play(); }
    else video.muted = !video.muted;
    reflectSound();
  });
  video.addEventListener('play', reflectSound);
  video.addEventListener('pause', reflectSound);
  video.addEventListener('error', () => { reflectSound(); notify('视频加载失败，静态封面仍可浏览'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  // Muted inline playback also works on phones; respect explicit motion/data preferences.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData) play();
}
