export const CodeCopyScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
window.copyHighlightCode = async (e) => {
  const button = e.currentTarget;
  const tooltip = button.querySelector('.highlight_copy_tooltip');
  const controls = button.getAttribute('aria-controls');
  const target = document.getElementById(controls);
  
  if (!target || !tooltip) {
    console.error('Target element or tooltip not found');
    return;
  }
  
  // Ignore if state management class already exists (processing in progress)
  if (button.classList.contains('is-active')) {
    return;
  }
  
  try {
    const codeText = target.textContent || '';
    
    // Copy using modern Clipboard API
    await navigator.clipboard.writeText(codeText);
    
    // On success
    tooltip.textContent = 'Copied!!';
    
  } catch (error) {
    console.error('Copy failed:', error);
    // On error
    tooltip.textContent = 'Error...';
  }
  
  // Set active state
  button.classList.add('is-active');
  tooltip.classList.add('is-active');
  
  // Reset after 1.2 seconds
  setTimeout(() => {
    button.classList.remove('is-active');
    tooltip.classList.remove('is-active');
    tooltip.textContent = '';
  }, 1200);
};`,
      }}
    />
  );
};
