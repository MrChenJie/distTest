import React, { Component } from 'react';
import { withRouter } from 'dva/router';
import { split, isString, isFunction } from 'lodash';
import intl from 'utils/intl';
import backIcon from '@/assets/back.svg';
import CusModal from '@/components/CusModal';
import './index.less';

@withRouter
export default class PageHeader extends Component {
  onBackBtnClick = () => {
    const { backPath, history, isChange, onBack } = this.props;
    if (isString(backPath)) {
      if (isChange) {
        CusModal.confirm({
          content: intl
            .get('hzero.common.message.confirm.giveUpTip')
            .d('你有修改未保存，是否确认离开？'),
          onOk: () => {
            this.linkToChange(this.props.backPath);
            if (isFunction(onBack)) {
              onBack();
            }
          },
        });
      } else {
        this.linkToChange(this.props.backPath);
        if (isFunction(onBack)) {
          onBack();
        }
      }
    } else {
      history.goBack();
    }
  };

  linkToChange = url => {
    const { history } = this.props;;
    const [pathname, search] = split(url, '?');
    history.push({
      pathname,
      search,
      state: {
        _back: -1,
      },
    });
  };

  render() {
    const {
      title = intl.get('hzero.common.status.back').d('返回'),
      backPath,
      children,
      style,
    } = this.props;
    let backBtn = '';
    let titleText = '';
    if (backPath) {
      backBtn = (
        <img src={backIcon} alt="back" onClick={this.onBackBtnClick} />
      );
      titleText = (
        <span onClick={this.onBackBtnClick} key="cus-page-head-title" className="cus-page-head-title">
          {title}
        </span>
      )
    }
    return (
      <div className="cus-page-head" style={{ ...style }}>
        {backBtn}
        {titleText}
        <div key="cus-page-head-operator" className="cus-page-head-operator">
          {children}
        </div>
      </div>
    );
  }
}
