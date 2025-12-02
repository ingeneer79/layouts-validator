'use client'

import { Button, Checkbox, Flex, FloatButton, Image, Slider, UploadFile } from "antd";
import Upload from "antd/es/upload/Upload";
import { useState } from "react";
import "./TransparencyComparer.css";
import { usePanAndZoom } from "./hooks/usePanAndZoom";
import { ImagesCanvas } from "../ImagesCanvas/ImagesCanvas";
import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";

export const TransparencyComparer = () => {

  const {
    srcFile,
    maketFile,
  } = useSourceFilesStore(state => state);

  const {
    setSrcImageOpacity
  } = usePanAndZoom();

  return (
    <Flex vertical gap={10}>        
    <Flex gap={10} style={{width: "100%", marginLeft: "10px", alignItems: "center"}}>
      <label>Прозрачность</label>
      <Slider disabled={!maketFile || !srcFile} tooltip={{ formatter: (value) => `${value}%` }} defaultValue={50} onChange={(value) => {
        setSrcImageOpacity(value / 100)
        }} style={{width: "100%"}}/>                
    </Flex>              
      {srcFile || maketFile ? (
        <ImagesCanvas
          srcFileVisible={true}
          maketFileVisible={true}
        />
      ): (
        <Flex className="no-images">
          <h3>Выберите макет</h3>
        </Flex>            
      )
      }
    </Flex>
  );
};
