import React, { useState, useCallback } from 'react';
import { Link } from 'gatsby';
import { Logo } from '../Logo';
import { Container } from '../Container';
import styles from './Header.module.css';

export type Props = {
  home: boolean;
};

export const Header: React.FC<Props> = ({ home }) => {
  const [animating, setAnimating] = useState(false);

  const handleEnter = useCallback(() => {
    if (!animating) {
      setAnimating(true);
    }
  }, [animating]);

  const handleAnimationEnd = useCallback(() => {
    setAnimating(false);
  }, []);

  return (
    <header className={styles.wrapper}>
      <Container>
        {React.createElement(
          home ? 'h1' : 'p',
          {
            className: styles.logo,
          },
          [
            <Link
              key="link"
              to="/"
              onMouseEnter={handleEnter}
              onTouchStart={handleEnter}
            >
              <span className={styles.logo_icon}>
                <Logo
                  animatable
                  animating={animating}
                  onAnimationEnd={handleAnimationEnd}
                />
              </span>
              <span className={styles.logo_typography}>wadackel.me</span>
            </Link>,
          ],
        )}
      </Container>
    </header>
  );
};
