    import looksSame from 'looks-same';
    import { promises as fs } from 'fs';
    import path from 'path';

    export async function POST(req: Request) {
      try {
        const { image1Path, image2Path } = await req.json();

        // Ensure paths are absolute or correctly resolved
        const absolutePath1 = path.resolve(process.cwd(), 'public', image1Path);
        const absolutePath2 = path.resolve(process.cwd(), 'public', image2Path);

        // Read image buffers
        const image1Buffer = await fs.readFile(absolutePath1);
        const image2Buffer = await fs.readFile(absolutePath2);

        const { equal, diffClusters } = await looksSame(image1Buffer, image2Buffer, {
          strict: false,
          createDiffImage: true,
        });

        console.log('Image comparison result:', { equal, diffClusters });

        return new Response(JSON.stringify({ equal, diffClusters }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error comparing images:', error);
        return new Response(JSON.stringify({ error: 'Failed to compare images' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }