import React from 'react';

/**
 * Reveal component: wraps children and adds Tailwind classes when element enters viewport.
 * Uses IntersectionObserver and respects prefers-reduced-motion.
 * Props:
 *  - className: base classes applied always
 *  - revealClass: classes to add when visible (e.g. "opacity-100 translate-y-0")
 *  - hiddenClass: classes before reveal (e.g. "opacity-0 translate-y-6")
 *  - rootMargin / threshold: passed to IntersectionObserver
 */
export default function Reveal({
  children,
  className = '',
  revealClass = 'opacity-100 translate-y-0 scale-100',
  hiddenClass = 'opacity-0 -translate-y-6 scale-95',
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.15,
  as: Component = 'div',
  once = true,
  duration = 700,
  delay = 0,
  easing = 'cubic-bezier(0.22, 0.9, 0.3, 1)',
  staggerIndex = 0,
  staggerDelay = 100,
  onReveal,
  style,
  initialInView = false,
  ...rest
}) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(Boolean(initialInView));

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // SSR safety: if window is undefined, reveal immediately
    if (typeof window === 'undefined') {
      setVisible(true);
      return undefined;
    }

    // Respect users who prefer reduced motion
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return undefined;
    }

    let hasRevealed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (once) {
            if (!hasRevealed && entry.isIntersecting) {
              hasRevealed = true;
              setVisible(true);
              if (typeof onReveal === 'function') onReveal(entry);
              observer.unobserve(entry.target);
            }
          } else {
            if (entry.isIntersecting) {
              setVisible(true);
              if (typeof onReveal === 'function') onReveal(entry);
            } else {
              setVisible(false);
            }
          }
        });
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold, onReveal]);

  const computedDelay = Math.max(0, Number(delay)) + Math.max(0, Number(staggerIndex)) * Math.max(0, Number(staggerDelay));
  const transitionStyle = {
    transitionProperty: 'transform, opacity, filter',
    transitionDuration: `${Math.max(0, Number(duration))}ms`,
    transitionTimingFunction: easing,
    transitionDelay: `${computedDelay}ms`,
    willChange: 'transform, opacity, filter',
    ...style,
  };

  const base = `${className} transition-all`;
  const applied = visible ? `${base} ${revealClass}` : `${base} ${hiddenClass}`;

  return (
    <Component ref={ref} className={applied} style={transitionStyle} {...rest}>
      {children}
    </Component>
  );
}

// Preset: Slide variants using safe, purged Tailwind classes
export function Slide({ direction = 'up', revealClass, hiddenClass, ...rest }) {
  const map = {
    up: { hidden: 'opacity-0 translate-y-6', reveal: 'opacity-100 translate-y-0' },
    down: { hidden: 'opacity-0 -translate-y-6', reveal: 'opacity-100 translate-y-0' },
    left: { hidden: 'opacity-0 translate-x-6', reveal: 'opacity-100 translate-x-0' },
    right: { hidden: 'opacity-0 -translate-x-6', reveal: 'opacity-100 translate-x-0' },
  };
  const preset = map[direction] || map.up;
  return (
    <Reveal
      hiddenClass={hiddenClass || preset.hidden}
      revealClass={revealClass || preset.reveal}
      {...rest}
    />
  );
}

export function SlideUp(props) { return <Slide direction="up" {...props} />; }
export function SlideDown(props) { return <Slide direction="down" {...props} />; }
export function SlideLeft(props) { return <Slide direction="left" {...props} />; }
export function SlideRight(props) { return <Slide direction="right" {...props} />; }


