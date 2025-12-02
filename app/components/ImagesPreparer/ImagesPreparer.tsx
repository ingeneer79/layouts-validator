"use client";

import { Button, Checkbox, Flex, Image, Slider } from "antd";
import Upload from "antd/es/upload/Upload";
import "./ImagesPreparer.css";
import { usePanAndZoom } from "./hooks/usePanAndZoom";
import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";
import { useEffect, useState } from "react";
import { InteractionOutlined, RotateLeftOutlined } from "@ant-design/icons";
import { RotateRightOutlined } from "@ant-design/icons";
import Input from "antd/es/input/Input";

export const ImagesPreparer = () => {
  // Импорт PDF.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  const {
    srcFile,
    srcFileObj,
    maketFile,
    maketFileObj,
    maketImageOpacity,
    maketImageRotateAngle,
    maketImageZoom,
    setSrcFile,
    setSrcFileObj,
    setMaketFile,
    setMaketFileObj,
    setPos,
    setMaketImageOpacity,
    setMaketImageRotateAngle,
    setMaketImageZoom,
  } = useSourceFilesStore(state => state);

  const {
    isMoving,
    containerRef,
    onMouseDown,
    onWheel,
    translateX,
    translateY,    
    scale,
  } = usePanAndZoom();

  const onReverse = () => {
    setSrcFile(maketFile);
    setSrcFileObj(maketFileObj);
    setMaketFile(srcFile);
    setMaketFileObj(srcFileObj);
  };

  const onRotateMaketImage = (angle: number) => {
    if (srcFileObj) {
      let newAngle = maketImageRotateAngle + angle;
      if (newAngle % 360 === 0) {
        newAngle = 0;
      } 
      setMaketImageRotateAngle(newAngle);
    }
  };

  const readPDF = (uploadedFile: Blob): Promise<string> => {
    const result = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = async function (event) {
        if (!event.target || !pdfjsLib) {
          resolve("");
          return;
        }
        const pdfData = event.target.result;
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const scale = 1.5; // Adjust for desired image quality
          const viewport = page.getViewport({ scale: scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;

          // Get image data URL
          const imageDataUrl = canvas.toDataURL("image/jpeg"); // or 'image/png'
          resolve(imageDataUrl);
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    });

    return result;
  };

  useEffect(() => {
    const pdfjs = (window as any)
      .pdfjsLib as typeof import("pdfjs-dist/types/src/pdf");
    setPdfjsLib(pdfjs);
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.mjs`;
  }, []);

  return (
    <Flex className="image-preparer" vertical gap={10}>
      <Flex gap={10} style={{ width: "100%" }}>
        <Flex gap={10} style={{ alignItems: "center", minWidth: "380px" }}>
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
                if (info.file.name.endsWith(".pdf")) {
                  readPDF(info.file.originFileObj as Blob).then(
                    imageDataUrl => {
                      setSrcFile(imageDataUrl);
                      setSrcFileObj(info.file);
                      setPos({ x: 0, y: 0, scale: 1 });
                      setMaketImageRotateAngle(0);
                    }
                  );
                } else {
                  setSrcFile(
                    URL.createObjectURL(info.file.originFileObj as File)
                  );
                  setSrcFileObj(info.file);
                }
                setPos({ x: 0, y: 0, scale: 1 });
                setMaketImageRotateAngle(0);
              }
            }}
          >
            <Button disabled={!pdfjsLib}>Исходник</Button>
          </Upload>
          <Flex
            gap={10}
            style={{
              alignItems: "center",
              position: "absolute",
              left: "110px",
              top: "6px",
            }}
          >
            <Checkbox
              style={{ width: "200px" }}
              disabled={srcFile === undefined}
              defaultChecked={true}
              onChange={e =>
                setSrcFile(
                  e.target.checked
                    ? URL.createObjectURL(srcFileObj?.originFileObj as File)
                    : null
                )
              }
            >
              Отображать исходник
            </Checkbox>
          </Flex>
        </Flex>
        <Flex gap={10} style={{ width: "100%", marginLeft: "10px", alignItems: "top" }}>
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
                setMaketFile(
                  URL.createObjectURL(info.file.originFileObj as File)
                );
                setMaketFileObj(info.file);
                setPos({ x: 0, y: 0, scale: 1 });
              }
            }}
          >
            <Button disabled={!srcFile}>Макет из типографии</Button>
          </Upload>
          <Flex
            gap={10}
            style={{
              alignItems: "center",
              position: "absolute",
              left: "575px",
              top: "6px",
            }}
          >
            <Checkbox
              style={{ width: "200px" }}
              disabled={maketFile === undefined}
              defaultChecked={true}
              onChange={e =>
                setMaketFile(
                  e.target.checked
                    ? URL.createObjectURL(maketFileObj?.originFileObj as File)
                    : null
                )
              }
            >
              Отображать макет
            </Checkbox>
          </Flex>
        </Flex>
      </Flex>
      <Flex gap={10} style={{ height: "55px" }}>
        <Flex
          gap={10}
          style={{ minWidth: "fit-content", alignItems: "center" }}
        >
          <Button
            disabled={!maketFile || isMoving}
            onClick={() => onRotateMaketImage(-90)}
            title="Повернуть против часовой стрелки на 90 градусов"
            icon={<RotateLeftOutlined />}
          />
          <Button
            disabled={!maketFile || isMoving}
            onClick={() => onRotateMaketImage(90)}
            title="Повернуть по часовой стрелки"
            icon={<RotateRightOutlined />}
          />
          <Flex gap={10} style={{alignItems: "center"}}>
            <label className={!maketFile ? "disabled" : ""}>Масштаб</label>
            <Input disabled={!maketFile} style={{ width: "100px" }} value={maketImageZoom} onChange={e => setMaketImageZoom(Number(e.target.value))}>
          </Input>   
          </Flex>
          <Button
            disabled={!srcFile || !maketFile || isMoving}
            onClick={onReverse}
            title="Поменять местами"
            icon={<InteractionOutlined />}
          />
        </Flex>
        <Flex
          gap={10}
          style={{ width: "100%", marginLeft: "10px", alignItems: "center" }}
        >
          <label className={!maketFile ? "disabled" : ""}>Прозрачность</label>
          <Slider
            disabled={!maketFile || !srcFile || isMoving}
            tooltip={{ formatter: value => `${value}%` }}
            defaultValue={50}
            onChange={value => {
              if (isMoving) {
                return;
              }
              setMaketImageOpacity(value / 100);
            }}
            style={{ width: "100%" }}
          />
        </Flex>
      </Flex>
      {srcFile || maketFile ? (
        <div className="compare-images comparer-background" ref={containerRef}>
          {srcFile && (
            <div
              className="compare-image-wrapper"
              style={{ transform: `translate(0px, 0px) scale(${scale})` }}
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
                top: `${srcFile ? "-500px" : "0px"}`,
                position: "relative",
                opacity: maketImageOpacity,
                transform: `translate(${translateX}px, ${translateY}px) scale(${scale + maketImageZoom/100}) rotate(${maketImageRotateAngle}deg)`,
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
      ) : (
        <Flex className="no-images">
          <h3>Выберите макет</h3>
        </Flex>
      )}
    </Flex>
  );
};
