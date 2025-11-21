import { useRef, useReducer, useState } from 'react';
import reducer, { initialState } from './reducer';
import { pan, startPan, zoom } from './actions';
export const usePanAndZoom = () => {
  const [isMoving, setIsMoving] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const onMouseMoveInWindow = (event: MouseEvent) => {
    event.preventDefault();
    setIsMoving(true);
    dispatch(pan(event));
  };
  const onDragStart = (event: MouseEvent) => {
    event.preventDefault();
  };

  const onMouseUpInWindow = () => {
    window.removeEventListener('mouseup', onMouseUpInWindow);
    window.removeEventListener('mousemove', onMouseMoveInWindow);
    document.removeEventListener("dragstart", onDragStart);
    setIsMoving(false);
  };
  const onMouseDown = (event: MouseEvent) => {
    dispatch(startPan(event));
    document.addEventListener("dragstart", onDragStart);
    window.addEventListener('mouseup', onMouseUpInWindow);
    window.addEventListener('mousemove', onMouseMoveInWindow);
  };
  const onWheel = (event: WheelEvent) => {
    if (event.deltaY !== 0 && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      dispatch(zoom(event, containerRect));
    }
  };
  return {
    ...state,
    isMoving,
    containerRef,
    onMouseDown,
    onWheel
  };
};