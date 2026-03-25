import { useCallback, useEffect, useRef, useState } from "react";

const EXIT_DURATION_MS = 140;
const ENTER_DURATION_MS = 220;
const STAGGER_MS = 34;
const BLANK_GAP_MS = 120;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getAnimatableElements(container) {
  if (!container) return [];

  const marked = Array.from(container.querySelectorAll("[data-transition-item]"));
  if (marked.length > 0) {
    return marked;
  }

  const primary = container.firstElementChild;
  if (!primary) return [];

  const directChildren = Array.from(primary.children || []).filter((el) => el instanceof HTMLElement);
  if (directChildren.length > 0) {
    return directChildren;
  }

  return [primary];
}

function sortTopToBottom(elements) {
  return [...elements].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}

async function animateOut(container) {
  const elements = sortTopToBottom(getAnimatableElements(container));
  if (elements.length === 0) return;

  const jobs = elements.map((element, index) =>
    element
      .animate(
        [
          { opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" },
          { opacity: 0, transform: "translateY(-8px)", filter: "blur(1.5px)" },
        ],
        {
          duration: EXIT_DURATION_MS,
          easing: "cubic-bezier(0.4, 0, 1, 1)",
          delay: index * STAGGER_MS,
          fill: "forwards",
        },
      )
      .finished.catch(() => undefined),
  );

  await Promise.all(jobs);
}

async function animateIn(container) {
  const elements = sortTopToBottom(getAnimatableElements(container));
  if (elements.length === 0) return;

  const jobs = elements.map((element, index) =>
    element
      .animate(
        [
          { opacity: 0, transform: "translateY(10px)", filter: "blur(1.5px)" },
          { opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" },
        ],
        {
          duration: ENTER_DURATION_MS,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          delay: index * STAGGER_MS,
          fill: "both",
        },
      )
      .finished.catch(() => undefined),
  );

  await Promise.all(jobs);
}

export default function SequentialContentTransition({ routeKey, children }) {
  const contentRef = useRef(null);
  const runningRef = useRef(false);
  const pendingRouteKeyRef = useRef(routeKey);
  const unmountedRef = useRef(false);
  const activeRouteKeyRef = useRef(routeKey);

  const [phase, setPhase] = useState("idle");

  const runTransition = useCallback(async () => {
    if (runningRef.current || unmountedRef.current) return;
    runningRef.current = true;

    while (!unmountedRef.current) {
      const targetKey = pendingRouteKeyRef.current;

      setPhase("exiting");
      await animateOut(contentRef.current);
      if (unmountedRef.current) break;

      setPhase("blank");
      await wait(BLANK_GAP_MS);
      if (unmountedRef.current) break;

      if (pendingRouteKeyRef.current === targetKey) {
        setPhase("entering");
        await wait(16);
        if (unmountedRef.current) break;
        await animateIn(contentRef.current);
        if (unmountedRef.current) break;

        setPhase("idle");
        break;
      }
    }

    runningRef.current = false;
    activeRouteKeyRef.current = pendingRouteKeyRef.current;
  }, []);

  useEffect(() => {
    const changed = routeKey !== activeRouteKeyRef.current;
    pendingRouteKeyRef.current = routeKey;

    if (changed && !runningRef.current) {
      runTransition();
    }
  }, [routeKey, runTransition]);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const isBlank = phase === "blank";

  return (
    <div className="min-h-full">
      {isBlank ? (
        <div className="min-h-full" />
      ) : (
        <div ref={contentRef} key={`${phase}-${routeKey}`} className="min-h-full">
          {children}
        </div>
      )}
    </div>
  );
}