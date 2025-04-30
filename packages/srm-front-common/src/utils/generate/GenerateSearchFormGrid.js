import React, { useEffect, useState } from 'react';
import { Col, Row } from 'hzero-ui';
import { compact } from 'lodash';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import { mediumScreenWidth } from '_cus_utils/constants';
/**
 * 查询页面Form表单布局
 * @param props
 *  defaultPackUp: 默认true收起
 *  screenWidth: 临界屏幕大小 默认为1000
 *  showLine: 默认显示行数
 * @returns {*}
 * @constructor
 */
const GenerateSearchFormGrid = (props) => {
  const {
    defaultPackUp = true,
    screenWidth = mediumScreenWidth,
    showLine = 2,
    onQuery = (e) => e,
    onReset = (e) => e,
  } = props;
  const [chunkSize, setChunkSize] = useState(window.innerWidth >= screenWidth ? 3 : 2);
  const [packUp, setPackUp] = useState(defaultPackUp);

  useEffect(() => {
    window.addEventListener('resize', computeChunkSize);
    return () => {
      window.removeEventListener('resize', computeChunkSize);
    };
  }, [chunkSize]);

  const computeChunkSize = () => {
    const newChunkSize = window.innerWidth >= screenWidth ? 3 : 2;
    if (chunkSize !== newChunkSize) {
      setChunkSize(newChunkSize);
    }
  };

  const Items = compact(props.children);
  const threshold = chunkSize * showLine;
  return (
    <Row>
      {Items.splice(0, Items.length > threshold ? threshold - 1 : threshold)}
      {Items.length > 0 && <div style={{ display: packUp ? 'none' : 'block' }}>{Items}</div>}
      <Col span={8} style={{ float: 'right' }}>
        <CusQueryButtons
          onQuery={onQuery}
          onReset={onReset}
          onShowMore={() => {
            setPackUp(!packUp);
          }}
          isShowMore={!packUp}
          isShowMoreButton={Items.length > 0}
        />
      </Col>
    </Row>
  );
};

export default GenerateSearchFormGrid;
