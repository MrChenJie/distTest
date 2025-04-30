import React from 'react';
import { css, cx } from '@emotion/css';
import { getCurrentLanguage } from 'utils/utils';
import './index.less';

const isEn = getCurrentLanguage() === 'en_US';

const CusInfoItem = (props) => {
  const { label, value } = props;
  const maxWidth = isEn ? 144 : 108;
  const width = isEn ? 120 : 84;
  const customClassName = css`
    .cus-info-item-label {
      maxWidth: ${maxWidth}px;
      & > span {
        width: ${width}px;
      }
    }
  `;

  return (
    <div className={cx('cus-info-item', customClassName)}>
      <div
        className='cus-info-item-label'
        title={label}
      >
        <span>{label}</span>
      </div>
      <div className='cus-info-item-value'>
        <span>
          {value}
        </span>
      </div>
    </div>
  );
};

export default CusInfoItem;
