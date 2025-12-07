"use client";

import {
  Button,
  Flex,
  Input,
  Slider,
} from "antd";
import { use, useEffect, useRef, useState } from "react";
import "./TransparencyComparer.css";
import { usePanAndZoom } from "./hooks/usePanAndZoom";
import { ImagesCanvas } from "../ImagesCanvas/ImagesCanvas";
import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";
import { PauseOutlined , PlaySquareOutlined } from "@ant-design/icons";

export const TransparencyComparer = () => {
  const { srcFile, layoutFile, setLayoutImageOpacity } = useSourceFilesStore(
    state => state
  );

  const { onMouseDown: onMouseDownLayout, containerRef: containerRefLayout } =
    usePanAndZoom();

  const [scale, setScale] = useState(1);    
  const [opacity, setOpacity] = useState(1);    
  const [animationSpeed, setAnimationSpeed] = useState(1);    
  const [animationState, setAnimationState] = useState<"play" | "pause" | "stop">("stop");  
  const [animationDirection, setAnimationDirection] = useState<number>(1);  
  const animationInterval = useRef<NodeJS.Timeout | null | number>(null);

  useEffect(() => {
    debugger
    if (animationState === "stop") {
      setOpacity(1);
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
      setAnimationSpeed(1);
    }
    if (animationState === "play") {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
      animationInterval.current = setInterval(() => {
        setOpacity(prev => {
          if (prev < 0) {
            setAnimationDirection(-animationDirection);
            return 0.1;            
          }
          if (prev > 1) {
            setAnimationDirection(-animationDirection);
            return 1;
          }
          return prev - 0.1*animationDirection;
        });
      }, 1000 - animationSpeed * 300);
    } else if (animationState === "pause" && animationInterval.current) {
      clearInterval(animationInterval.current);
    }
  }, [animationState, animationSpeed,animationDirection]);
  
  return (
    <Flex vertical gap={10}>
      <Flex gap={10} style={{ alignItems: "center" }}>
      <Flex gap={10}>
      <Flex gap={10} style={{ alignItems: "center", minWidth: "400px" }}>
        <label className={!layoutFile ? "disabled" : ""}>Скорость анимации</label>
        <Slider
          disabled={!layoutFile || !srcFile}
          min={100}
          max={200}
          tooltip={{ formatter: value => `${value}%` }}
          defaultValue={0}
          onChange={value => {
            setAnimationSpeed(1 + value / 100);
          }}
          style={{ width: "100%" }}
        />
      </Flex>        
        <Button icon={<PlaySquareOutlined />} onClick={() => setAnimationState("play")}>Начать</Button>
        <Button icon={<PauseOutlined />} onClick={() => setAnimationState("pause")}>Пауза</Button>
        <Button onClick={() => setAnimationState("stop")}>Остановить</Button>
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
      {/* <Flex
        flex={1}
        gap={10}
        style={{ width: "300px", alignItems: "center" }}
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
      </Flex> */}
      
      
      </Flex>
      

      {srcFile || layoutFile ? (
        <div ref={containerRefLayout}>
          <ImagesCanvas
            className="transparent-compare-images"
            srcFileVisible={true}
            layoutFileVisible={true}
            containerRef={containerRefLayout}
            onMouseDown={onMouseDownLayout}
            opacity={opacity}
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
