
    
    import { Flex, Tabs } from 'antd';
    import type { TabsProps } from 'antd';
    import { TransparencyComparer } from './components/TransparencyComparer/TransparencyComparer';

    export default function HomePage() {

    const items: TabsProps['items'] = [
      {
        key: '1',
        label: 'Проверка наложением макетов',
        children: <TransparencyComparer/>,
      },
      {
        key: '2',
        label: 'Проверка наложением макетов',
        children: 'Under construction',
      },
    ];

      // const [result, setResult] = useState<{
      //   diffClusters?: { x: number; y: number; width: number; height: number }[];
      //   equal?: boolean;
      //   error?: string;
      // } | null>(null);
      // const [loading, setLoading] = useState(false);

      // const handleCompare = async () => {
      //   setLoading(true);
      //   try {
      //     // Assuming you have images in your public directory
      //     const response = await fetch('/api/compare-images', {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({
      //         image1Path: './2-src-1.png',
      //         image2Path: './2-dest-1.png',
      //       }),
      //     });
      //     const data = await response.json();
      //     debugger
      //     setResult(data);
      //   } catch (error) {
      //     console.error('Error:', error);
      //     setResult({ error: 'Failed to compare images.' });
      //   } finally {
      //     setLoading(false);
      //   }
      // };

      return (
        <Flex gap={20} vertical className='main'>
          <h1>Проверка макетов</h1>
          <Flex className='main-tabs' flex={1}>
          <Tabs defaultActiveKey="1" items={items} />

          {/* <button onClick={handleCompare} disabled={loading}>
            {loading ? 'Comparing...' : 'Compare Images'}
          </button>
          {result && (
            <div>
              {result.error && <p style={{ color: 'red' }}>{result.error}</p>}
              {result.equal !== undefined && (
                <p>Images are {result.equal ? 'the same' : 'different'}.</p>
              )}
              {result.diffClusters && result.diffClusters.length > 0 && (
                <div>
                  <h3>Differences found:</h3>
                  <ul>
                    {result.diffClusters.map((cluster, index) => (
                      <li key={index}>
                        Cluster {index + 1}: x={cluster.x}, y={cluster.y}, width={cluster.width}, height={cluster.height}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div> */}
            </Flex>
        </Flex>
      );
    }