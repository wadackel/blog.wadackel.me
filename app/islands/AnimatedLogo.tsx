import { useState, useCallback } from 'hono/jsx';
import Logo from './Logo';

type Props = {
  animatable?: boolean;
  onAnimationEnd?: () => void;
};

export default function AnimatedLogo({ animatable }: Props) {
  const [animating, setAnimating] = useState(false);

  const handleEnter = useCallback(() => {
    if (!animating) {
      setAnimating(true);
    }
  }, [animating]);

  const handleAnimatingEnd = useCallback(() => {
    setAnimating(false);
  }, []);

  return (
    <a
      className="inline-flex items-end text-primary-500 hover:text-primary-700 no-underline"
      href="/"
      {...(animatable ? { onMouseEnter: handleEnter, onTouchStart: handleEnter } : {})}
    >
      <span className="block w-16 md:w-24" aria-hidden="true">
        <Logo animatable animating={animating} onAnimationEnd={handleAnimatingEnd} />
      </span>
      <span className="ml-2 font-accent text-2xl md:text-4xl w-[4.5em]">wadackel.me</span>
    </a>
  );
}
