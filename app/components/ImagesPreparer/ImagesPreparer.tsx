"use client";

import { Button, Checkbox, Flex, Slider } from "antd";
import Upload from "antd/es/upload/Upload";
import "./ImagesPreparer.css";
import { usePanAndZoom } from "./hooks/usePanAndZoom";
import { useSourceFilesStore } from "@/app/providers/source-files-store-provider";
import { useEffect, useState } from "react";
import { FileExcelOutlined, InteractionOutlined, RotateLeftOutlined, ScissorOutlined } from "@ant-design/icons";
import { RotateRightOutlined } from "@ant-design/icons";
import Input from "antd/es/input/Input";
import { ImagesCanvas } from "../ImagesCanvas/ImagesCanvas";

export const ImagesPreparer = () => {
  // Импорт PDF.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const [srcFileVisible, setSrcFileVisible] = useState(true);
  const [layoutFileVisible, setLayoutFileVisible] = useState(true);
  const [cutMode, setCutMode] = useState(false);

  const {
    srcFile,
    srcFileObj,
    layoutFile,
    layoutFileObj,
    layoutImageRotateAngle,
    layoutImageZoom,
    setSrcFile,
    setSrcFileObj,
    setLayoutFile,
    setLayoutFileObj,
    setLayoutImageOpacity,
    setLayoutImageRotateAngle,
    setLayoutImageZoom,
    setLayoutImageTranslateX,
    setLayoutImageTranslateY,
    resetLayoutImage,
  } = useSourceFilesStore(state => state);

  const {
    isMoving,
    onMouseDown,
    onWheel,
    translateX,
    translateY,
    scale,
    containerRef,
  } = usePanAndZoom();

  useEffect(() => {
    setLayoutImageTranslateX(translateX);
    setLayoutImageTranslateY(translateY);
  }, [
    translateX,
    translateY,
    setLayoutImageTranslateX,
    setLayoutImageTranslateY,
  ]);

  const onReverse = () => {
    setSrcFile(layoutFile);
    setSrcFileObj(layoutFileObj);
    setLayoutFile(srcFile);
    setLayoutFileObj(srcFileObj);
  };

  const onRotateLayoutImage = (angle: number) => {
    if (layoutFile) {
      let newAngle = layoutImageRotateAngle + angle;
      if (newAngle % 360 === 0) {
        newAngle = 0;
      }
      setLayoutImageRotateAngle(newAngle);
    }
  };

  const readPDF = (uploadedFile: Blob): Promise<string> => {
    const result = new Promise<string>(resolve => {
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
                      // setSrcFileObj(imageDataUrl);
                      setLayoutImageRotateAngle(0);
                    }
                  );
                } else {
                  setSrcFile(
                    URL.createObjectURL(info.file.originFileObj as File)
                  );
                  setSrcFileObj(info.file);
                }
                setLayoutImageRotateAngle(0);
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
              onChange={e => setSrcFileVisible(e.target.checked)}
            >
              Отображать исходник
            </Checkbox>
          </Flex>
        </Flex>
        <Flex
          gap={10}
          style={{ width: "100%", marginLeft: "10px", alignItems: "top" }}
        >
          <Upload
            accept="image/*"
            maxCount={1}
            multiple={false}
            onChange={info => {
              if (info.file.status === "removed") {
                setLayoutFile(undefined);
                setLayoutFileObj(undefined);
                return;
              }
              if (info.file.status === "done") {
                setLayoutFile(
                  URL.createObjectURL(info.file.originFileObj as File)
                );
                setLayoutFileObj(info.file);
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
              disabled={layoutFile === undefined}
              defaultChecked={true}
              onChange={e => setLayoutFileVisible(e.target.checked)}
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
            disabled={!layoutFile || isMoving}
            onClick={() => onRotateLayoutImage(-90)}
            title="Повернуть против часовой стрелки на 90 градусов"
            icon={<RotateLeftOutlined />}
          />
          <Button
            disabled={!layoutFile || isMoving}
            onClick={() => onRotateLayoutImage(90)}
            title="Повернуть по часовой стрелки"
            icon={<RotateRightOutlined />}
          />
          <Button
            disabled={!layoutFile || isMoving}
            onClick={() => resetLayoutImage()}
            title="Сбросить"
            icon={<FileExcelOutlined />}
          />

          <Button
            disabled={!layoutFile || isMoving}
            onClick={() => {
              setCutMode(!cutMode)
            }}
            title="Вырезать"
            style={{backgroundColor: cutMode ? "gray" : ""}}
            icon={<ScissorOutlined />}
          />

          <Flex gap={10} style={{ alignItems: "center" }}>
            <label className={!layoutFile ? "disabled" : ""}>Масштаб</label>
            <Input
              type="number"
              disabled={!layoutFile}
              style={{ width: "70px" }}
              value={layoutImageZoom}
              onChange={e => setLayoutImageZoom(Number(e.target.value))}
            ></Input>
          </Flex>
          <Button
            disabled={!srcFile || !layoutFile || isMoving}
            onClick={onReverse}
            title="Поменять местами"
            icon={<InteractionOutlined />}
          />
        </Flex>
        <Flex
          gap={10}
          style={{ width: "100%", marginLeft: "10px", alignItems: "center" }}
        >
          <label className={!layoutFile ? "disabled" : ""}>Прозрачность</label>
          <Slider
            disabled={!layoutFile || !srcFile || isMoving}
            tooltip={{ formatter: value => `${value}%` }}
            defaultValue={50}
            onChange={value => {
              if (isMoving) {
                return;
              }
              setLayoutImageOpacity(value / 100);
            }}
            style={{ width: "100%" }}
          />
        </Flex>
      </Flex>
      {srcFile || layoutFile ? (
        <div style={{ cursor: cutMode ? "crosshair" : "default"}}>
        <ImagesCanvas
          srcFileVisible={srcFileVisible}
          layoutFileVisible={layoutFileVisible}
          containerRef={containerRef}
          onMouseDown={!cutMode ? onMouseDown : undefined}
          onWheel={onWheel}
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
