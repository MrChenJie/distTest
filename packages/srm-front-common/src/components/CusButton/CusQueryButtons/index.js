import CusButton from '@/components/CusButton';
import arrow from '@/assets/arrow.svg';
import React from 'react';
import intl from 'utils/intl';
import './index.less';

/**
 *  查询页面 - 客制化按钮组
 * @param props
 *  onQuery：查询按钮回调
 *  onQuery：重置按钮回调
 *  onShowMore：箭头回调
 *  isShowMore：箭头方向：true-向上， false-向下
 * @returns {*}
 */
export default (props) => {
  const {
    onQuery = (e) => e,
    onReset = (e) => e,
    onShowMore = (e) => e,
    isShowMore = false,
    isShowMoreButton = true
  } = props;
  return (
    <div className="cus-query-buttons-wrap">
      <CusButton onClick={onReset}>{intl.get('hzero.common.cusButton.reset').d('重置')}</CusButton>
      <CusButton onClick={onQuery} type="primary" htmlType="submit">
        {intl.get('hzero.common.cusButton.query').d('查询')}
      </CusButton>
      {isShowMoreButton && (
        <div className="button-arrow-wrap" onClick={onShowMore}>
          <img alt="arrow" src={arrow} style={{
            transform:  isShowMore ? 'rotate(-180deg)' : 'none',
            transition: 'transform 0.3s ease-out',
          }} />
        </div>
      )}
    </div>
  );
};
