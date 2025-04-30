import { jsx, Canvas, Chart, Interval, Legend, PieLabel } from '@antv/f2';
const data = [
    {
      name: '长津湖',
      percent: 0.4,
      a: '1',
      amount: 20,
      ratio: 0.1,
      memo: '长津湖',
      const: 'const',
    },
    {
      name: '我和我的父辈',
      percent: 0.2,
      a: '1',
      amount: 20,
      ratio: 0.1,
      memo: '我和我的父辈',
      const: 'const',
    },
    {
      name: '失控玩家',
      percent: 0.18,
      a: '1',
      amount: 20,
      ratio: 0.1,
      memo: '失控玩家',
      const: 'const',
    },
    {
      name: '宝可梦',
      percent: 0.15,
      a: '1',
      amount: 20,
      ratio: 0.1,
      memo: '宝可梦',
      const: 'const',
    },
    {
      name: '峰爆',
      percent: 0.05,
      a: '1',
      amount: 20,
      ratio: 0.1,
      memo: '峰爆',
      const: 'const',
    },
    {
      name: '其他',
      percent: 0.02,
      a: '1',
      amount: 20,
      ratio: 0.1,
      memo: '其他',
      const: 'const',
    },
  ];
  const context = document.getElementById('container').getContext('2d');
  const { props } = (
    <Canvas context={context} pixelRatio={window.devicePixelRatio}>
      <Chart
        data={data}
        coord={{
          radius: 0.8,
          innerRadius: 0.3,
          transposed: true,
          type: 'polar',
        }}
        scale={{}}
      >
        <Interval
          x="a"
          y="percent"
          adjust="stack"
          color={{
            field: 'memo',
            range: [
              '#1890FF',
              '#13C2C2',
              '#2FC25B',
              '#FACC14',
              '#F04864',
              '#8543E0',
            ],
          }}
          selection={{
            selectedStyle: (record) => {
              const { yMax, yMin } = record;
              return {
                // 半径放大 1.1 倍
                r: (yMax - yMin) * 1.1,
              };
            },
          }}
        />
        <Legend position='top' />
        <PieLabel
          label1={(data) => {
            return {
              text: data.memo,
              fill: '#808080',
            }
          }}
          label2={(data) => {
            return {
              fill: '#000000',
              text: '$' + data.amount.toFixed(2),
              fontWeight: 500,
              fontSize: 10,
            }
          }}
          // onClick={(data) => {
          //   console.log(data)
          // }}
        ></PieLabel>
      </Chart>
    </Canvas>
  );

  const chart = new Canvas(props);
  chart.render();
