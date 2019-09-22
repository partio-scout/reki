import React from 'react';

export function getPresenceLabel(value) {
  if (value == 1) {
    return 'Poistunut leiristä';
  } else if (value == 2) {
    return 'Poistunut leiristä väliaikaisesti';
  } else if (value == 3) {
    return 'Saapunut leiriin';
  }
  return 'Tuntematon arvo';
}

export function getPresenceColor(value) {
  if (value == 1) {
    return '#ec404b';
  } else if (value == 2) {
    return '#f7c810';
  } else if (value == 3) {
    return '#1bbc81';
  }
  return '#777';
}

export function Presence({ value }) {
  const label = getPresenceLabel(value);
  const color = getPresenceColor(value);

  return (
    <div style={ { backgroundColor: color, borderRadius: '50%', height: '15px', width: '15px' } } title={ label } />
  );
}
