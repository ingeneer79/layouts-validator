'use client'

import { Button, Checkbox, Flex, FloatButton, Image, Slider, UploadFile } from "antd";
import Upload from "antd/es/upload/Upload";
import { useState } from "react";
import "./ImagesPreparer.css";
import { usePanAndZoom } from "./hooks/usePanAndZoom";
import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";

export const ImagesPreparer = () => {

  const { srcFile, srcFileObj, maketFile, maketFileObj, srcImageOpacity, setSrcFile, setSrcFileObj, setMaketFile, setMaketFileObj, setPos, setSrcImageOpacity } = useSourceFilesStore(
    (state) => state,
  )  
  // const [srcFile, setSrcFile] = useState<string | undefined | null>();
  // const [srcFileObj, setSrcFileObj] = useState<UploadFile | undefined>();
  // const [maketFile, setMaketFile] = useState<string | null | undefined>();
  // const [maketFileObj, setMaketFileObj] = useState<UploadFile | undefined>();
  // const [srcImageOpacity, setSrcImageOpacity] = useState(0.5);
  // const [pos, setPos] = useState({ x: 0, y: 0, scale: 1 });

  const { isMoving, containerRef, onMouseDown, onWheel, translateX, translateY, scale } = usePanAndZoom();

  const onReverse = () => {
    setSrcFile(maketFile);
    setSrcFileObj(maketFileObj);
    setMaketFile(srcFile);
    setMaketFileObj(srcFileObj);
  };

  return (
    <Flex vertical gap={10}>
        <Flex gap={10} style={{width: "100%"}}>          
            <Upload
              accept="image/*"
              maxCount={1}
                multiple={false}
                onChange={info => {
                if (info.file.status === "removed") {
                    setSrcFile(undefined);
                    setSrcFileObj(undefined);
                  return;
                }
                if (info.file.status === "done") {
                    setSrcFile(URL.createObjectURL(info.file.originFileObj as File));
                    debugger
                    setSrcFileObj(info.file);
                    setPos({ x: 0, y: 0, scale: 1 });
                }
              }}
            >
                <Button>Исходник</Button>
            </Upload>
            <Upload
              accept="image/*"
              maxCount={1}
              multiple={false}
              onChange={info => {
                if (info.file.status === "removed") {
                    setMaketFile(undefined);
                    setMaketFileObj(undefined);
                  return;
                }
                if (info.file.status === "done") {
                    setMaketFile(URL.createObjectURL(info.file.originFileObj as File));
                    setMaketFileObj(info.file);
                    setPos({ x: 0, y: 0, scale: 1 });
                }
              }}
            >
                <Button disabled={!srcFile}>Макет из типографии</Button>
            </Upload>            
      </Flex>
        <Flex gap={10} style={{width: "100%", height: "55px", alignItems: "center"}}>          
              <Flex gap={10} style={{minWidth: "fit-content", alignItems: "center"}}>
                <Checkbox disabled={srcFile === undefined} defaultChecked={true} onChange={e => setSrcFile(e.target.checked ? URL.createObjectURL(srcFileObj?.originFileObj as File) : null)}>Отображать исходник</Checkbox>
                <Checkbox disabled={maketFile === undefined} defaultChecked={true} onChange={e => setMaketFile(e.target.checked ? URL.createObjectURL(maketFileObj?.originFileObj as File) : null)}>Отображать макет</Checkbox>          
                <Button onClick={onReverse} title="Поменять местами" icon={<i className="fa-solid fa-arrows-up-down-left-right"></i>} />
              </Flex>    
              <Flex gap={10} style={{width: "100%", marginLeft: "10px", alignItems: "center"}}>
                <label>Прозрачность</label>
                <Slider disabled={!maketFile || !srcFile || isMoving} tooltip={{ formatter: (value) => `${value}%` }} defaultValue={50} onChange={(value) => {
                  if (isMoving) {
                    return
                  }
                  setSrcImageOpacity(value / 100)
                  }} style={{width: "100%"}}/>                
              </Flex>              
        </Flex>      
      {srcFile || maketFile ? (
        <div className="compare-images" ref={containerRef}>
          {
            srcFile && (
                <div className="compare-image-wrapper" style={{ transform: `translate(0px, 0px) scale(${scale})`}}>
                  <Image className="compare-image" src={srcFile} width="100%" height="100%" alt="" preview={false} />
                </div>
            )
          }
          { maketFile && (
            <div className="compare-image-wrapper" onMouseDown={onMouseDown} onWheel={onWheel} style={{ top: `${srcFile ? "-500px" : "0px"}`, position: "relative", opacity: srcImageOpacity, transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }}>
              <Image className="compare-image" src={maketFile} width="100%" height="100%" alt="" preview={false} />
            </div>
          )}
        </div>
      ): (
        <Flex className="no-images">
          <h3>Выберите макет</h3>
        </Flex>            
      )
      }
    </Flex>
  );
};
