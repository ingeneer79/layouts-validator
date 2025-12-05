// src/stores/counter-store.ts
import { UploadFile } from 'antd';
import { createStore } from 'zustand/vanilla'

export type SourceFilesState = {
  srcFile: string | undefined | null;
  srcFileObj: UploadFile | undefined;
  layoutFile: string | null | undefined;
  layoutFileObj: UploadFile | undefined;
  layoutImageOpacity: number;
  layoutImageRotateAngle: number;
  layoutImageTranslateX: number;
  layoutImageTranslateY: number;
  layoutImageZoom: number;
  pos: { x: number; y: number; scale: number };
}

export type SourceFilesActions = {
  setSrcFile: (file: string | undefined | null) => void;
  setSrcFileObj: (file: UploadFile | undefined) => void;
  setLayoutFile: (file: string | null | undefined) => void;
  setLayoutFileObj: (file: UploadFile | undefined) => void;
  setLayoutImageOpacity: (opacity: number) => void;
  setLayoutImageZoom: (opacity: number) => void;
  setLayoutImageTranslateX: (value: number) => void;
  setLayoutImageTranslateY: (value: number) => void;
  setLayoutImageRotateAngle: (angle: number) => void;
  resetLayoutImage(): void
}

export type SourceFilesStore = SourceFilesState & SourceFilesActions


export const defaultInitState: SourceFilesState = {
  srcFile: undefined,
  srcFileObj: undefined,
  layoutFile: undefined,
  layoutFileObj: undefined,
  layoutImageOpacity: 0.5,
  layoutImageRotateAngle: 0,
  layoutImageZoom: 100,
  layoutImageTranslateX: 0,
  layoutImageTranslateY: 0,
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
    setLayoutFile: (file) => set({ layoutFile: file }),
    setLayoutFileObj: (file) => set({ layoutFileObj: file }),
    setLayoutImageOpacity: (opacity) => set({ layoutImageOpacity: opacity }),
    setLayoutImageRotateAngle: (angle) => set({ layoutImageRotateAngle: angle }),
    setLayoutImageZoom: (zoom) => set({ layoutImageZoom: zoom }),
    setLayoutImageTranslateX: (value) => set({ layoutImageTranslateX: value }),
    setLayoutImageTranslateY: (value) => set({ layoutImageTranslateY: value }),
    resetLayoutImage: () => set({
      layoutImageRotateAngle: 0,
      layoutImageZoom: 100,
    }),
  }))
}
