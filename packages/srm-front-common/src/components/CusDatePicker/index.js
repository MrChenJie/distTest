import React from 'react';
import { DatePicker, Tooltip } from 'antd';
import dateIcon from '@/assets/dateIcon.svg';
import tipIcon from '@/assets/tips.svg';
import styled from 'styled-components';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const DateDiv = styled.div`
  position: relative;
  width: 100%;
  .ant-picker {
    .ant-picker-suffix {
      justify-content: flex-end;
      width: ${(props) => props.suffixWidth};
    }
    .ant-picker-clear {
      inset-inline-end: ${(props) => props.paddingRight};
    }
  }
`;

export default class CusDatePicker extends React.Component {
  state = {
    open: false,
    datePickerTopFlag: false,
  };

  render() {
    const { tip, onChange, placeholder = '', showTime, ...other } = this.props;
    const { datePickerTopFlag } = this.state;
    const commonProps = {
      ...other,
      showTime,
      popupClassName: `customize-datepicker-panel ${
        datePickerTopFlag ? 'customize-datepicker-panel-Top' : ''
      }`,
      suffixIcon: <img src={dateIcon} alt="dateIcon" />,
      placeholder,
      clearIcon: <></>,
      // inputReadOnly: true,
      open: this.state.open,
      onKeyDown: (e) => {
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
        }
      },
      onClick: (e) => {
        let flag = false;
        const y = e.pageY;
        const windowHeight = window.innerHeight;
        if (y < 370 && windowHeight - y - 26 < 370) {
          flag = true;
        }
        this.setState({ open: true, datePickerTopFlag: flag });
      },
      onChange: (date) => {
        onChange(date);
        this.setState({
          open: false,
        });
      },
      onBlur: (e) => {
        const date = e.target.value;
        // 移除焦点时，若有值有效，则更新当前日期
        if (date && dayjs(date).isValid()) {
          onChange(dayjs(date));
        }
        this.setState({
          open: false,
        });
      },
      onOk: () => {
        this.setState({
          open: false,
        });
      },
      onSelect: () => {
        if (showTime) {
          return false;
        };
        this.setState({
          open: false,
        });
      },
    };
    return (
      <DateDiv paddingRight={tip ? '47px' : '24px'} suffixWidth={tip ? '40px' : '16px'}>
        <DatePicker {...commonProps} />
        {tip && (
          <Tooltip title={tip} overlayClassName="customize-tooltip">
            <img
              src={tipIcon}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '32px',
                width: '16px',
              }}
              alt="tip"
            />
          </Tooltip>
        )}
      </DateDiv>
    );
  }
}

const DateRangeDiv = styled.div`
  position: relative;
  .ant-picker {
    .ant-picker-suffix {
      justify-content: flex-end;
      width: ${(props) => props.suffixWidth};
    }
    .ant-picker-clear {
      inset-inline-end: ${(props) => props.paddingRight};
    }
    .ant-picker-input {
      input:after {
        content: 'cusRangePicker';
      }
    }
  }
`;

class CusRangePicker extends React.Component {
  state = { datePickerTopFlag: false };

  render() {
    const { tip, onChange, placeholder = '', ...other } = this.props;
    const { datePickerTopFlag } = this.state;
    const commonProps = {
      ...other,
      popupClassName: `customize-datepicker-panel ${
        datePickerTopFlag ? 'customize-datepicker-panel-Top' : ''
      }`,
      suffixIcon: <img src={dateIcon} alt="dateIcon" />,
      placeholder,
      clearIcon: <></>,
      // inputReadOnly: true,
      open: this.state.open,
      onKeyDown: (e) => {
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
        }
      },
      onClick: (e) => {
        let flag = false;
        const y = e.pageY;
        const windowHeight = window.innerHeight;
        if (y < 320 && windowHeight - y - 26 < 320) {
          flag = true;
        }
        this.setState({ open: true, datePickerTopFlag: flag });
      },
      onChange: (date) => {
        onChange(date);
        this.setState({
          open: false,
        });
      },
      onBlur: (e) => {
        if (e.relatedTarget) {
          const computedStyle = window.getComputedStyle(e.relatedTarget, '::after');
          const content = computedStyle.getPropertyValue('content');
          if (content === '"cusRangePicker"') {
            return false;
          }
        }
        this.setState({
          open: false,
        });
      },
    };
    return (
      <DateRangeDiv paddingRight={tip ? '55px' : '32px'} suffixWidth={tip ? '40px' : '16px'}>
        <RangePicker {...commonProps} />
        {tip && (
          <Tooltip title={tip} overlayClassName="customize-tooltip">
            <img
              src={tipIcon}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '32px',
                width: '16px',
              }}
              alt="tip"
            />
          </Tooltip>
        )}
      </DateRangeDiv>
    );
  }
}

CusDatePicker.RangePicker = CusRangePicker;
