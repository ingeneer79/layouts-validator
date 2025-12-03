"use client";

import {
  Button,
  Checkbox,
  Flex,
  FloatButton,
  Image,
  Input,
  Slider,
  UploadFile,
} from "antd";
import Upload from "antd/es/upload/Upload";
import { useState } from "react";
import "./TransparencyComparer.css";
import { usePanAndZoom } from "./hooks/usePanAndZoom";
import { ImagesCanvas } from "../ImagesCanvas/ImagesCanvas";
import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";

export const TransparencyComparer = () => {
  const { srcFile, layoutFile, setLayoutImageOpacity } = useSourceFilesStore(
    state => state
  );

  const { onMouseDown: onMouseDownLayout, containerRef: containerRefLayout } =
    usePanAndZoom();

  const [scale, setScale] = useState(1);    

  return (
    <Flex vertical gap={10}>
      <Flex
        gap={10}
        style={{ width: "100%", marginLeft: "10px", alignItems: "center" }}
      >
        <label>Прозрачность</label>
        <Slider
          disabled={!layoutFile || !srcFile}
          tooltip={{ formatter: value => `${value}%` }}
          defaultValue={50}
          onChange={value => {
            setLayoutImageOpacity(value / 100);
          }}
          style={{ width: "100%" }}
        />
      </Flex>
      <Flex gap={10} style={{ alignItems: "center" }}>
        <label className={!layoutFile ? "disabled" : ""}>Масштаб</label>
        <Input
          type="number"
          disabled={!layoutFile}
          style={{ width: "70px" }}
          value={scale}
          onChange={e => setScale(Number(e.target.value))}
        ></Input>
      </Flex>

      {srcFile || layoutFile ? (
        <div ref={containerRefLayout}>
          <ImagesCanvas
            srcFileVisible={true}
            layoutFileVisible={true}
            containerRef={containerRefLayout}
            onMouseDown={onMouseDownLayout}
            scale={scale}
          />
        </div>
      ) : (
        <Flex className="no-images">
          <h3>Выберите макет</h3>
        </Flex>
      )}
    </Flex>
  );
};
