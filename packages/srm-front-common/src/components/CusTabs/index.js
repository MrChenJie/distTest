import React from 'react';
import { Tabs, Avatar } from 'antd';
import downPng from '@/assets/arrow.svg';
import { tooltipRender } from '_cus_utils/render';
import { css, cx } from '@emotion/css';
import BigNumber from 'bignumber.js';

export default class CusTabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabWidth: 180,
    };
  }
  tabsRef = React.createRef();
  resizeObserver;

  componentDidMount() {
    this.init();
    this.handleResize();
  }

  componentDidUpdate(prevProps) {
    const { items } = prevProps;
    const clearFalse = (list) => {
      return list?.filter(item => !!item) || [];
    };
    if (clearFalse(items)?.length !== clearFalse(this.props.items)?.length) {
      this.handleResize();
    };
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  init = () => {
    const { isInit = true } = this.props;
    if(isInit) {
      const antTabsNavLists = this.tabsRef.current.getElementsByClassName('ant-tabs-nav-list');
      const antTabsInkBar = antTabsNavLists[0]?.getElementsByClassName('ant-tabs-ink-bar');
      antTabsNavLists[0]?.removeChild(antTabsInkBar[0]);
    }
  }

  handleResize = () => {
    const { items = [] } = this.props;
    const nowItems = items?.filter(item => !!item) || [];
    // 每个一个tabs均分宽度
    if (this.tabsRef && this.tabsRef.current) {
      const antTabsNavs = this.tabsRef.current.getElementsByClassName('ant-tabs-nav');
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          // 处理元素宽度变化的逻辑
          const width = entry.contentRect.width;
          const tabWidth = new BigNumber(width).dividedBy(nowItems.length).dp(2).toNumber();
          this.setState({
            tabWidth,
          }, () => {
            const antTabsNav =  this.tabsRef.current.getElementsByClassName('ant-tabs-nav');
            const antOperations = antTabsNav[0]?.getElementsByClassName('ant-tabs-nav-operations');
            if (tabWidth >= 180) {
              antOperations[0].style.display = 'none';
            } else {
              antOperations[0].style.display = 'block';
            }
          });
        });
      });
      this.resizeObserver.observe(antTabsNavs[0]);
    }
  }

  render() {
    const { items = [], isNumber = false, ...otherProps } = this.props;
    const { tabWidth } = this.state;
    const nowItems = items
      ?.filter(item => !!item)
      ?.map((item, index) => {
        return {
          ...item,
          label: (
            <div className='ant-tabs-tab-btn-layout'>
              <span className='ant-tabs-interval' />
              <span className='ant-tabs-label'>
                {isNumber && (
                  <div className='ant-tabs-label-circle'>
                    <span className='ant-tabs-label-circle-number'>
                      {index + 1}
                    </span>
                  </div>
                )}
                <div className='ant-tabs-label-text'>
                  {tooltipRender(item.label)}
                </div>
              </span>
            </div>
          )
        }
      });
    const tabsProps = {
      moreIcon: (<Avatar size="small" src={downPng} />),
      ...otherProps,
      items: nowItems,
      popupClassName: "customize-tabs-more",
    };
    const customClassName = css`
      .ant-tabs-tab {
        width: ${tabWidth}px;
       }
      `;

    return (
      <div ref={this.tabsRef} className={cx(`customize-tabs`, customClassName)}>
        <Tabs { ...tabsProps } />
      </div>
    )
  }
}
