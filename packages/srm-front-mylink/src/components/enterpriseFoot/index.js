import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import intl from 'utils/intl';

class EnterpriseFoot extends Component {
  render() {
    const {
      onPrevious = (e) => e,
      onNext = (e) => e,
      previousBtn = true,
      nextBtn = true,
      // previousStyle,
      nextStyle,
      previousDisable = false,
      nextLDisable = false,
      previousLoading = false,
      nextLoading = false,
      previousButtonText = intl.get('hzero.common.button.previous').d('上一步'),
      nextButtonText = intl.get('hzero.common.button.next').d('下一步'),
    } = this.props;
    return (
      <>
        {previousBtn && (
          <Button
            // style={previousStyle}
            // type="primary"
            onClick={onPrevious}
            loading={previousLoading}
            // className="portal-button-success"
            disabled={previousDisable}
          >
            {previousButtonText}
          </Button>
        )}
        {nextBtn && (
          <Button
            style={nextStyle}
            onClick={onNext}
            loading={nextLoading}
            className="portal-button-success"
            disabled={nextLDisable}
          >
            {nextButtonText}
          </Button>
        )}
      </>
    );
  }
}

export default EnterpriseFoot;
