import React from 'react';
import { InputNumber } from 'hzero-ui';

class CusInputNumber extends React.Component {
  render() {
    const inputNumberProps = {
      onKeyDown: (e) => {
        if (e.keyCode === 13 && e.target) {
          e.preventDefault();
          const form = e.target.closest('form');
          const submitBtn = form && form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
          }
          return false;
        }
      },
      ...this.props,
    };

    return <InputNumber {...inputNumberProps} />;
  }
}

export default CusInputNumber;
