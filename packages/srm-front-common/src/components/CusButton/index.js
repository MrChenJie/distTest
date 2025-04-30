import React from 'react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames/bind';
import styles from './index.less';
import tipIcon from '@/assets/tips.svg';

let cx = classNames.bind(styles);
const sizeNum = {
  small: '24px',
  middle: '32px',
  large: '36px',
  bigLarge: '40px',
};

/**
 * 客制化按钮
 * @param props
 *  type：按钮类型【primary，danger, normal, plain】
 *  mini: 小按钮
 *  size: 按钮大小【small，middle，large，bigLarge】
 * @returns {*}
 */
export default (props) => {
  const { type = 'normal', mini = false, size = 'middle', tooltipTitle, ...others } = props;
  let names = cx({
    mini: mini,
    normal: !mini,
    'customize-button-primary': type === 'primary',
    'customize-button-normal': type === 'normal',
    'customize-button-danger': type === 'danger',
    'customize-button-plain': type === 'plain',
  });
  return (
    <Button style={{ height: sizeNum[size] }} className={names} {...others}>
      {props.children}
      {tooltipTitle && (
        <span className={styles['tooltip-poinent']}>
          <Tooltip
            title={tooltipTitle}
            overlayClassName="customize-tooltip"
            color={'#646A73'}
            trigger="hover"
          >
            <img src={tipIcon} alt="tip" className={styles['_cus_tooltip_img']} />
          </Tooltip>
        </span>
      )}
    </Button>
  );
};
