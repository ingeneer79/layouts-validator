// src/stores/counter-store.ts
import { UploadFile } from 'antd';
import { createStore } from 'zustand/vanilla'

export type SourceFilesState = {
  srcFile: string | undefined | null;
  srcFileObj: UploadFile | undefined;
  maketFile: string | null | undefined;
  maketFileObj: UploadFile | undefined;
  srcImageOpacity: number;
  pos: { x: number; y: number; scale: number };
}

export type SourceFilesActions = {
  setSrcFile: (file: string | undefined | null) => void;
  setSrcFileObj: (file: UploadFile | undefined) => void;
  setMaketFile: (file: string | null | undefined) => void;
  setMaketFileObj: (file: UploadFile | undefined) => void;
  setSrcImageOpacity: (opacity: number) => void;
  setPos: (pos: { x: number; y: number; scale: number }) => void;
}

export type SourceFilesStore = SourceFilesState & SourceFilesActions


export const defaultInitState: SourceFilesState = {
  srcFile: undefined,
  srcFileObj: undefined,
  maketFile: null,
  maketFileObj: undefined,
  srcImageOpacity: 0.5,
  pos: { x: 0, y: 0, scale: 1 },
}

export const initSourceFilesStore = (): SourceFilesState => {
  return { ...defaultInitState }
}

export const createSourceFilesStore = (
  initState: SourceFilesState = defaultInitState,
) => {
  return createStore<SourceFilesStore>()((set) => ({
    ...initState,
    setSrcFile: (file) => set({ srcFile: file }), 
    setSrcFileObj: (file) => set({ srcFileObj: file }),
    setMaketFile: (file) => set({ maketFile: file }),
    setMaketFileObj: (file) => set({ maketFileObj: file }),
    setSrcImageOpacity: (opacity) => set({ srcImageOpacity: opacity }),
    setPos: (pos) => set({ pos }),
  }))
}
