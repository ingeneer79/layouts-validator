import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";
import { usePanAndZoom } from "../ImagesPreparer/hooks/usePanAndZoom";
import { Image } from "antd";
import { MouseEventHandler, useEffect, WheelEventHandler } from "react";

type MaketFileVisibleProps = {
  srcFileVisible: boolean;
  maketFileVisible: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  onMouseDown?: MouseEventHandler;
  onWheel?: WheelEventHandler;
  scale: number;
};

export const ImagesCanvas = ({
  srcFileVisible,
  maketFileVisible,
  containerRef,
  onMouseDown,
  onWheel,
  scale,
}: MaketFileVisibleProps) => {
  const {
    srcFile,
    maketFile,
    maketImageOpacity,
    maketImageRotateAngle,
    maketImageTranslateX,
    maketImageTranslateY,
    maketImageZoom,
  } = useSourceFilesStore(state => state);

  return (
    <div className="compare-images comparer-background" ref={containerRef}>
      {srcFile && (
        <div
          className="compare-image-wrapper src-file-image"
          style={{
            transform: `translate(0px, 0px) scale(${scale})`,
            display: srcFileVisible ? "block" : "none",
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
      {maketFile && (
        <div
          className="compare-image-wrapper"
          onMouseDown={onMouseDown}
          onWheel={onWheel}
          style={{
            top: `${srcFileVisible ? "-500px" : "0px"}`,
            position: "relative",
            opacity: maketImageOpacity,
            transform: `translate(${maketImageTranslateX}px, ${maketImageTranslateY}px) scale(${
              scale + maketImageZoom / 100
            }) rotate(${maketImageRotateAngle}deg)`,
            display: maketFileVisible ? "block" : "none",
          }}
        >
          <Image
            className="compare-image"
            src={maketFile}
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
