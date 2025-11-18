import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Сравнение макетов",
  description: "Сравнение макетов",
};

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AntdRegistry>{children}</AntdRegistry>
            </body>
        </html>
    );
}

