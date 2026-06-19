import { useCallback, useEffect, useState } from 'react';

function normalizeHeading(value) {
  if (!Number.isFinite(value)) return null;
  return ((value % 360) + 360) % 360;
}

function getHeading(event) {
  if (Number.isFinite(event.webkitCompassHeading)) {
    return normalizeHeading(event.webkitCompassHeading);
  }
  if (event.absolute && Number.isFinite(event.alpha)) {
    return normalizeHeading(360 - event.alpha);
  }
  if (Number.isFinite(event.alpha)) {
    return normalizeHeading(360 - event.alpha);
  }
  return null;
}

export function useCompassHeading() {
  const [active, setActive] = useState(false);
  const [heading, setHeading] = useState(null);
  const [available, setAvailable] = useState(
    typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
  );

  useEffect(() => {
    if (!active || typeof window === 'undefined') return undefined;

    const handleOrientation = (event) => {
      const nextHeading = getHeading(event);
      if (nextHeading === null) return;
      setAvailable(true);
      setHeading(nextHeading);
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [active]);

  const enableCompass = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setAvailable(false);
      return false;
    }

    const orientationEvent = window.DeviceOrientationEvent;
    if (typeof orientationEvent.requestPermission === 'function') {
      try {
        const permission = await orientationEvent.requestPermission();
        if (permission !== 'granted') {
          setAvailable(false);
          return false;
        }
      } catch {
        setAvailable(false);
        return false;
      }
    }

    setAvailable(true);
    setActive(true);
    return true;
  }, []);

  const toggleCompass = useCallback(async () => {
    if (active) {
      setActive(false);
      return true;
    }
    return enableCompass();
  }, [active, enableCompass]);

  return {
    compassActive: active,
    compassAvailable: available,
    compassHeading: heading,
    toggleCompass
  };
}
