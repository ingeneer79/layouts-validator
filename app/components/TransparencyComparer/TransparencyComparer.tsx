'use client'

import { Button, Flex, Image, Slider, UploadFile } from "antd";
import Upload from "antd/es/upload/Upload";
import { useState } from "react";
import "./TransparencyComparer.css";

export const TransparencyComparer = () => {
  const [srcFile, setSrcFile] = useState<string | undefined>();
  const [srcFileObj, setSrcFileObj] = useState<UploadFile | undefined>();
  const [maketFile, setMaketFile] = useState<string | null | undefined>();
  const [maketFileObj, setMaketFileObj] = useState<UploadFile | undefined>();
  const [srcImageOpacity, setSrcImageOpacity] = useState(0.5);
  return (
    <Flex vertical gap={10}>
        <Flex gap={10} style={{width: "100%"}}>          
            <Upload
              accept="image/*"
              maxCount={1}
              defaultFileList={srcFileObj ? [srcFileObj] : []}
                multiple={false}
                onChange={info => {
                if (info.file.status === "done") {
                    setSrcFile(URL.createObjectURL(info.file.originFileObj as File));
                    setSrcFileObj(info.file);
                }
              }}
            >
                <Button>Исходник</Button>
            </Upload>
            <Upload
              accept="image/*"
              maxCount={1}
              multiple={false}
              defaultFileList={maketFileObj ? [maketFileObj] : []}
              onChange={info => {
                if (info.file.status === "done") {
                    setMaketFile(URL.createObjectURL(info.file.originFileObj as File));
                    setMaketFileObj(info.file);
                }
              }}
            >
                <Button>Макет из типографии</Button>
            </Upload>

             <Slider defaultValue={50} onChange={(value) => setSrcImageOpacity(value / 100)} disabled={!maketFile || !srcFile} style={{width: "100%"}}/>
      </Flex>
      {srcFile || maketFile ? (
        <div className="compare-images">
          {
            srcFile && (
              <div className="compare-image" >
                <Image className="compare-image" src={srcFile} width="100%" height="100%" alt="" preview={false} />
              </div>
            )
          }
          { maketFile && (
            <div className="compare-image" style={{ position: 'absolute', top: "72px", opacity: srcImageOpacity }}>
              <Image src={maketFile} width="100%" height="100%" alt="" preview={false} />
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
