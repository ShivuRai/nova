const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const number = (value, fallback) => Number.isFinite(value) ? Math.round(value) : fallback;

function calculateIslandBounds(area, state) {
  const { expanded, isRetracted, isAiWhisperOpen } = state;
  const position = typeof state.position === 'string' ? state.position : 'top-center';
  const margin = clamp(number(state.sideMargin, 16), 0, 64);
  const offset = isRetracted ? 0 : clamp(number(state.topOffset, 0), 0, 64);
  const horizontalPadding = 16;
  const contentWidth = clamp(number(state.width, 268), 120, 700);
  const contentHeight = clamp(number(state.height, 38), 8, 460);
  const width = Math.min(area.width, Math.max(contentWidth, isAiWhisperOpen ? 400 : 0) + horizontalPadding);
  const height = Math.min(area.height, Math.max(contentHeight + (expanded ? 16 : isRetracted ? 6 : 10), isAiWhisperOpen ? 340 : 0));
  const x = position.endsWith('left') ? margin : position.endsWith('right') ? area.width - width - margin : Math.round((area.width - width) / 2);
  const y = position.startsWith('bottom') ? area.height - height - offset : offset;
  return {
    x: area.x + clamp(x, 0, area.width - width),
    y: area.y + clamp(y, 0, area.height - height),
    width,
    height,
  };
}

module.exports = { calculateIslandBounds };
