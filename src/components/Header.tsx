import type { FunctionComponent } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { Logo } from './Logo';

export type Props = {};

export const Header: FunctionComponent<Props> = () => {
  const [animating, setAnimating] = useState(false);

  const handleEnter = useCallback(() => {
    if (!animating) {
      setAnimating(true);
    }
  }, [animating]);

  const handleAnimatingEnd = useCallback(() => {
    setAnimating(false);
  }, [animating]);

  return (
    <header className="py-32">
      <div className="container text-center">
        <a
          className="inline-flex items-end text-primary-500 hover:text-primary-700 no-underline"
          href="/"
          onMouseEnter={handleEnter}
          onTouchStart={handleEnter}
        >
          <span className="block w-16 md:w-24" aria-hidden>
            <Logo animatable animating={animating} onAnimationEnd={handleAnimatingEnd} />
          </span>
          <span className="ml-2 font-accent text-2xl md:text-4xl">wadackel.me</span>
        </a>
      </div>
    </header>
  );
};
