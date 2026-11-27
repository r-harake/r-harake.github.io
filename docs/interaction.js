// The portfolio remains readable when scripting is disabled.
const inspect = document.querySelector('#inspect');
const specimen = document.querySelector('#specimen');
const caption = document.querySelector('#specimen-caption');
inspect.hidden = false;

inspect.addEventListener('click', () => {
  const enlarged = specimen.classList.toggle('zoomed');
  inspect.setAttribute('aria-pressed', String(enlarged));
  inspect.querySelector('.inspect-label').textContent = enlarged ? 'Whole specimen' : 'Wing detail';
  caption.textContent = enlarged ? 'Wing venation · enlarged illustration' : 'Dragonfly · illustrative plate';
});
