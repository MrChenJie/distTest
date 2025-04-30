import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Col, Row } from 'hzero-ui';
import { compact } from 'lodash';
import intl from 'utils/intl';
import CusButton from '_cus_components/CusButton';
import { largeScreenWidth } from '_cus_utils/constants';

/**
 *
 * @param props
 *  isPackUp: 是否需要 收起/展示 功能
 *  defaultPackUp: 默认true收起
 *  screenWidth: 临界屏幕大小 默认为1560
 *  showLine: 默认显示行数
 * @returns {*}
 * @constructor
 */
const GenerateFormGrid = forwardRef((props, ref) => {
  const { isPackUp = true, defaultPackUp = true, screenWidth = largeScreenWidth, showLine = 2 } = props;
  const [chunkSize, setChunkSize] = useState(window.innerWidth >= screenWidth ? 3 : 2);
  const [packUp, setPackUp] = useState(defaultPackUp);

  useEffect(() => {
    window.addEventListener('resize', computeChunkSize);
    return () => {
      window.removeEventListener('resize', computeChunkSize);
    };
  }, [chunkSize]);


  useImperativeHandle(ref, () => ({
    updatePackUp: (flag) => {
      setPackUp(flag);
    }
  }));

  const computeChunkSize = () => {
    const newChunkSize = window.innerWidth >= screenWidth ? 3 : 2;
    if (chunkSize !== newChunkSize) {
      setChunkSize(newChunkSize);
    }
  };

  const Items = compact(props.children);
  let currentGroup = [];
  let currentTotal = 0;
  const groups = Items.reduce((acc, item) => {
    const screen = window.innerWidth >= screenWidth ? 'xxl' : 'xl'
    const span = item.props[screen] || item.props.span;

    if (currentTotal + span <= 24) {
      currentGroup.push(item);
      currentTotal += span;
    } else {
      acc.push(currentGroup);

      currentGroup = [item];
      currentTotal = span;
    }
    return acc;
  }, []);
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return (
    <>
      {groups?.map((item, index) => {
        if (index < showLine) {
          return <Row key={index}>{item}</Row>;
        }
        return (
          <Row style={{ display: packUp && isPackUp ? 'none' : 'block' }} key={index}>
            {item}
          </Row>
        );
      })}
      {isPackUp && Items.length > showLine && (
        <Col span={24}>
          <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px', marginRight: '-4px' }}>
            <CusButton type="plain" onClick={() => setPackUp(!packUp)}>
              {packUp
                ? intl.get('hzero.common.button.unfold').d('展开')
                : intl.get('hzero.common.button.packUp').d('收起')}
            </CusButton>
          </div>
        </Col>
      )}
    </>
  );
})

export default GenerateFormGrid;
