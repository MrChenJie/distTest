import React from 'react';
import { Tabs, Avatar } from 'antd';
import CusButton from '_cus_components/CusButton';
import './index.less'
import downPng from '../../../../../srm-front-common/src/assets/arrow.svg';

export default class CusTabs extends React.Component {
  constructor(props) {
    super(props);
  }
  tabsRef = React.createRef();

  componentDidMount() {
    // if (this.tabsRef && this.tabsRef.current) {
    //   const antTabsNav =  this.tabsRef.current.getElementsByClassName('ant-tabs-nav');
    //   if (this.props?.items?.length <= 4) {
    //     const antOperations = antTabsNav[0]?.getElementsByClassName('ant-tabs-nav-operations');
    //     // antTabsNav[0].removeChild(antOperations[0]);
    //   }
    // }
  }

  render() {
    const { items = [], isNumber = false, onAdd = (e) => e, isDisable, subcontracteLoading, ...otherProps } = this.props;
    const nowItems = items?.map((item, index) => {
      return {
        ...item,
        label: (
          <span className='ant-tabs-label'>
            {isNumber && (
              <div className='ant-tabs-label-circle'>
                <span className='ant-tabs-label-circle-number'>
                  {index + 1}
                </span>
              </div>
            )}
            <p className='ant-tabs-label-text'>{item.label}</p>
          </span>
        )
      }
    })
    const tabsProps = {
      moreIcon: nowItems.length>4?(<CusButton type='plain'>{intl.get(`hzero.common.button.expand`).d('展开')}</CusButton>) : false,
      addIcon: <CusButton  style={(isDisable || subcontracteLoading)?{display: 'none'}:nowItems.length > 11 ?{} : {position: 'absolute', top: 0, right: 0}} onClick={onAdd} type='plain' disabled={isDisable || subcontracteLoading}>{intl.get(`bid.bidcommon.bid.button.Split`).d('分标包')}</CusButton>,
      ...otherProps,
      items: nowItems,
      popupClassName: "customize-tabs-more",
    };

    return (
      <div ref={this.tabsRef} className={`${items.length > 5 ? '' : 'ant-tabs-nav-wrap-dispaly'} customize-tabs customize-new-tabs`}>
        <Tabs
          className='newTab'
          {...tabsProps} />
      </div>
    )
  }
}
