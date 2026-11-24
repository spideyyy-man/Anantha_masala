import React from 'react';

/**
 * Keep SSR initial paint 100% opaque (opacity: 1) so pages never flash blank
 * before client hydration. Motion choreography lives intentionally at section/element level.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
