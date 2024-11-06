import React from 'react';

export default interface VideoTileProps {
  isDragging: boolean;
  style: React.CSSProperties | undefined;
  title: string;
  url: string;
}
