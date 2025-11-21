'use client'

import { Button, Checkbox, Flex, FloatButton, Image, Slider, UploadFile } from "antd";
import Upload from "antd/es/upload/Upload";
import "./ImagesPreparer.css";
import { usePanAndZoom } from "./hooks/usePanAndZoom";
import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";
import { useEffect } from "react";
import { usePDFJS } from "./hooks/usePDF";

export const ImagesPreparer = () => {

  // Импорт PDF.js
  let pdfjsLib: any = null;

  const { srcFile, srcFileObj, maketFile, maketFileObj, srcImageOpacity, setSrcFile, setSrcFileObj, setMaketFile, setMaketFileObj, setPos, setSrcImageOpacity } = useSourceFilesStore(
    (state) => state,
  )  

  const { isMoving, containerRef, onMouseDown, onWheel, translateX, translateY, scale } = usePanAndZoom();

  const onReverse = () => {
    setSrcFile(maketFile);
    setSrcFileObj(maketFileObj);
    setMaketFile(srcFile);
    setMaketFileObj(srcFileObj);
  };

  const readPDF = (uploadedFile: Blob): Promise<string> => {
    const result = new Promise<string>((resolve, reject) => {
      
    const reader = new FileReader();
    reader.onload = async function(event) {
      if (!event.target) {
        resolve('');
        return;
      }
      const pdfData = event.target.result;
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const scale = 1.5; // Adjust for desired image quality
          const viewport = page.getViewport({ scale: scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
              canvasContext: context,
              viewport: viewport
          };
          await page.render(renderContext).promise;

          // Get image data URL
          const imageDataUrl = canvas.toDataURL('image/jpeg'); // or 'image/png'
          resolve(imageDataUrl);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
    })

    return result;

  }

  useEffect(() => {
    const pdfjs = (window as any).pdfjsLib as typeof import('pdfjs-dist/types/src/pdf');
    pdfjsLib = pdfjs;
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.mjs`;      
  }, [])


  return (
    <Flex vertical gap={10}>
        <Flex gap={10} style={{width: "100%"}}>          
            <Flex gap={10} style={{width: "100%", alignItems: "center"}}>
              <Upload
                accept=".png,.jpg,.pdf"
                maxCount={1}
                  multiple={false}
                  onChange={info => {
                  if (info.file.status === "removed") {
                    setSrcFile(undefined);
                    setSrcFileObj(undefined);
                    return;
                  }
                  if (info.file.status === "done") {
                    if (info.file.name.endsWith('.pdf')) {
                      readPDF(info.file.originFileObj as Blob).then((imageDataUrl) => {
                        setSrcFile(imageDataUrl);
                        setSrcFileObj(info.file);
                        setPos({ x: 0, y: 0, scale: 1 });
                      });
                    } else {
                      setSrcFile(URL.createObjectURL(info.file.originFileObj as File));
                      setSrcFileObj(info.file);
                    }
                    setPos({ x: 0, y: 0, scale: 1 });
                  }
                }}
              >
                  <Button>Исходник</Button>
              </Upload>
              <Checkbox style={{width: "200px"}} disabled={srcFile === undefined} defaultChecked={true} onChange={e => setSrcFile(e.target.checked ? URL.createObjectURL(srcFileObj?.originFileObj as File) : null)}>Отображать исходник</Checkbox>
            </Flex>
            <Flex gap={10} style={{width: "100%", alignItems: "center"}} >    
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
             <Checkbox style={{width: "200px"}} disabled={maketFile === undefined} defaultChecked={true} onChange={e => setMaketFile(e.target.checked ? URL.createObjectURL(maketFileObj?.originFileObj as File) : null)}>Отображать макет</Checkbox>          
            </Flex>
      </Flex>
        <Flex gap={10} style={{width: "100%", height: "55px", alignItems: "center"}}>          
              <Flex gap={10} style={{minWidth: "fit-content", alignItems: "center"}}>
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
