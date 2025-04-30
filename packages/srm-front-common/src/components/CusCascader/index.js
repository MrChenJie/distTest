import React from 'react';
import { Cascader } from 'antd';

export default class CusCascader extends React.Component {
  state = {
    open: false,
  };

  render() {
    const { ...other } = this.props;
    const commonProps = {
      ...other,
      popupClassName: 'customize-cascader',
      notFoundContent: intl.get('hzero.common.components.noticeIcon.null').d('暂无数据'),
      expandTrigger: 'hover',
      open: this.state.open,
      onKeyDown: (e) => {
        if (e.keyCode === 9) return false;
        if (e.keyCode === 13 && e.target) {
          e.preventDefault();
          this.setState({
            open: false,
          });
          const form = e.target.closest('form');
          const submitBtn = form && form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
          }
          return false;
        } else {
          this.setState({
            open: true,
          });
        }
      },
      onClick: () => {
        this.setState({
          open: !this.state.open,
        });
      },
      onBlur: () => {
        this.setState({
          open: false,
        });
      },
    };
    return (
      <div style={{ width: '100%' }}>
        <Cascader {...commonProps} />
      </div>
    );
  }
}
