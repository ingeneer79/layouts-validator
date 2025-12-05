import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";
import { Image } from "antd";
import { MouseEventHandler, WheelEventHandler } from "react";

type LayoutFileVisibleProps = {
  srcFileVisible: boolean;
  layoutFileVisible: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  onMouseDown?: MouseEventHandler;
  onWheel?: WheelEventHandler;
  scale: number;
};

export const ImagesCanvas = ({
  srcFileVisible,
  layoutFileVisible,
  containerRef,
  onMouseDown,
  onWheel,
  scale,
}: LayoutFileVisibleProps) => {
  const {
    srcFile,
    layoutFile,
    layoutImageOpacity,
    layoutImageRotateAngle,
    layoutImageTranslateX,
    layoutImageTranslateY,
    layoutImageZoom,
  } = useSourceFilesStore(state => state);

  return (
    <div className="compare-images comparer-background" ref={containerRef}>
      {srcFile && (
        <div
          className="compare-image-wrapper src-file-image"
          style={{
            transform: `translate(0px, 0px) scale(${scale})`,
            display: srcFileVisible ? "flex" : "none",
          }}
        >
          <Image
            className="compare-image"
            src={srcFile}
            width="100%"
            height="100%"
            alt=""
            preview={false}
          />
        </div>
      )}
      {layoutFile && (
        <div
          className="compare-image-wrapper"
          onMouseDown={onMouseDown}
          onWheel={onWheel}
          style={{
            position: "relative",
            opacity: layoutImageOpacity,
            transform: `translate(${layoutImageTranslateX}px, ${layoutImageTranslateY}px) scale(${
              scale + layoutImageZoom / 100
            }) rotate(${layoutImageRotateAngle}deg)`,
            display: layoutFileVisible ? "block" : "none",
          }}
        >
          <Image
            className="compare-image"
            src={layoutFile}
            width="100%"
            height="100%"
            alt=""
            preview={false}
          />
        </div>
      )}
    </div>
  );
};
