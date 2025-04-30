import React from 'react';
import { Tooltip, Badge } from 'antd';
import tipIcon from '@/assets/tips.svg';
import './index.less';
import intl from 'utils/intl';

const statusMap = ['error', 'success'];

export function labelTip({ label, tip }) {
  if (tip) {
    return (
      <span className='_cus_tooltip_wrap'>
        <div className='_cus_tooltip'>
          <div title={label}>{label}</div>
          <Tooltip
            title={tip}
            overlayClassName="customize-tooltip"
            color={'#646A73'}
            trigger='hover'
          >
            <img src={tipIcon} alt="tip" className='_cus_tooltip_img' />
          </Tooltip>
        </div>
      </span>
    );
  } else {
    return label;
  }
}

/**
 * 用于纯文本的 键值 数据展示
 * @param data
 * @returns {*}
 * @constructor
 */
export function TextItem(data = []) {
  return (
    <div style={{ display: 'flex', height: '22px', marginBottom: '16px', color: '#1F2329' }}>
      {data.map((item) => {
        return (
          <div style={{ marginRight: '32px' }}>
            {item.label && <span style={{ marginRight: '8px' }}>{item.label}</span>}
            {item.value && <span>{item.value}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function tooltipRender(text) {
  return (
    <Tooltip
      placement="top"
      title={text}
      overlayClassName="customize-tooltip"
      color={'#646A73'}
    >
      <span className="customize-tooltip-text">
        {text}
      </span>
    </Tooltip>
  );
}


/**
 * 返回 是/否 多语言 并加上对应的状态
 * @param {1|any} v 值
 * @return 1 -> yes(多语言), other -> no(多语言)
 */
export function yesOrNoRender(v) {

  return (
    <Badge
      status={statusMap[v]}
      text={
        +v === 1
          ? intl.get('hzero.common.status.yes').d('是')
          : intl.get('hzero.common.status.no').d('否')
      }
    />
  );
}

/**
 * 返回 启用/禁用 对应的多语言 并加上状态
 * @param {0|1} v 启用状态
 * @param enableText 启用(多语言)
 * @param disabledText 禁用(多语言)
 * return 1 ? enable(多语言) : disabled(多语言)
 */
export function enableRender(v, enableText, disabledText) {
  return (
    <Badge
      status={statusMap[v]}
      text={
        +v === 1
          ? enableText || intl.get('hzero.common.status.enable').d('启用')
          : disabledText || intl.get('hzero.common.status.disable').d('禁用')
      }
    />
  );
}

/**
 * 标签，error，warn，success
 * @param status 状态
 * @param statusList 状态对应数组
 * @param text 文本（可选）
 * @returns {string|*}
 */
export function tagRender(status, statusList = [], text = '') {
  if (status === '' || status === undefined || status === null) return '';
  const currentStatus =
    statusList.find(item => item.status === status) ||
    { color: 'error' };
  const colorList = {
    error: {
      backgroundColor: '#FDDBDA',
      color: '#F54A45'
    },
    warn: {
      backgroundColor: '#FFE3AF',
      color: '#FF7B00',
    },
    success: {
      backgroundColor: '#eaf9e9',
      color: '#34C724',
    }
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <span style={{
          display: 'block',
          padding: '4px',
          lineHeight: '12px',
          height: '20px',
          backgroundColor: `${colorList[currentStatus.color].backgroundColor}`,
          color: `${colorList[currentStatus.color].color}`,
          fontSize: '10px',
          borderRadius: '2px',
        }}>
          {text || currentStatus.text}
        </span>
    </div>
  )
}
