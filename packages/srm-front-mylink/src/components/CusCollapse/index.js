import React from 'react';
import blodArrow from './blodArrow.svg';
import './index.less';

/**
 * 客制化面板Header
 * 使用需要在外层collapse添加"customize-collapse"样式
 * @param props
 *  title：标题名称
 *  verticalLine: 否展示左边竖线，true， false
 *  showArrow： 是否展示右边箭头
 *  arrowActive：箭头的方面： true-向下， false：向右
 *  buttons：操作按钮组
 *  在有按钮的情况下，设置padding为16px，在收缩的时候需要固定为12px, 并隐藏操作按钮
 * @returns {*}
 * @constructor
 */
export default function PanelHeader(props) {
  const {
    title = '',
    verticalLine = true,
    showArrow = true,
    arrowActive = true,
    buttons,
    style = {},
  } = props;
  return (
    <div
      className={`customize-panel-header ${verticalLine ? 'cus-vertical-line' : ''}`}
      style={{
        paddingTop: buttons && arrowActive ? '16px' : '12px',
        paddingBottom: arrowActive ? '16px' : '12px',
        ...style,
      }}
    >
      <div className="customize-panel-header-wrap">
        <span className="title">{title}</span>
        {arrowActive && (
          <div
            className="cus-operations"
            onClick={(e) => {
              if (e && e.stopPropagation()) {
                e.stopPropagation();
              } else {
                window.event.cancelBubble = true;
              }
            }}
          >
            {buttons}
          </div>
        )}
        {showArrow && (
          <img
            alt="arrow"
            src={blodArrow}
            style={{
              transform: arrowActive ? '' : 'rotate(-90deg)',
              transition: 'transform 0.15s ease-out',
              marginLeft: '16px',
            }}
          />
        )}
      </div>
    </div>
  );
}
