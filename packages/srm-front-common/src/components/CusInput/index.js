import React from 'react';
import { Input, Tooltip } from 'antd';
import { getStringBytes, interceptString } from '@/utils/utils';
import tipIcon from '@/assets/tips.svg';
const { TextArea } = Input;
import { css, cx } from '@emotion/css';

/**
 * CusInput
 * trim: 是否删除前后空格，默认为 true
 * trimAll: 是否删除所有空格，默认为 false
 * inputChinese: 是否允许输入中文，默认为 true
 * typeCase: 组件的大小写输入限制
 *    upper: 自动转大写
 *    lower: 自动转小写
 * showCharacter(true | false): 是否需要显示剩余字符数
 * maxLength(number): 最大能输入的字符数
 */
export default class CusInput extends React.Component {
  state = {
    currentBytes: 0,
  };

  componentDidMount() {
    if (this.props.value && this.props.showCharacter) {
      this.setState({
        currentBytes: getStringBytes(this.props.value),
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      const { currentBytes } = this.state;
      // 在异步数据value变化的情况下，初始化剩余字符
      if(currentBytes === 0 && this.props.showCharacter){
        this.setState({
          currentBytes: getStringBytes(this.props.value),
        });
      }
    }
  }

  handleBlur = (e) => {
    const { trim = true, trimAll = false, onChange, onBlur } = this.props;
    let changeValue = e.target.value;
    if (trim) {
      changeValue = changeValue.trim();
    }
    if (trimAll) {
      changeValue = changeValue.replace(/\s/g, '');
    }
    if (onChange) {
      onChange(changeValue);
    }
    if(onBlur){
      onBlur(e)
    }
  };

  handleChange = (e) => {
    const { inputChinese = true, onChange } = this.props;
    let changeValue = e.target.value;
    if (!inputChinese) {
      changeValue = changeValue.replace(/[\u4E00-\u9FA5]/g, '');
    }
    if (onChange) {
      onChange(changeValue, e.target);
    }
  };

  render() {
    const {
      trim = true,
      trimAll = false,
      inputChinese = true,
      typeCase,
      style = {},
      tip,
      suffix,
      showCharacter = false,
      maxLength,
      allowClear,
      className,
      tagFlex,
      ...rest
    } = this.props;
    const { currentBytes } = this.state;
    if (typeCase === 'upper') {
      style['textTransform'] = 'uppercase';
    } else if (typeCase === 'lower') {
      style['textTransform'] = 'lowercase';
    }

    let paddingLeft = 0;
    if (suffix) {
      paddingLeft += 24;
    }
    if (tip) {
      paddingLeft += 24;
    }
    if (allowClear) {
      paddingLeft += 24;
    }
    if (showCharacter) {
      paddingLeft += 46;
    }
    const customClassName = css`
      .ant-input {
        padding-right: ${paddingLeft}px !important;
       }
      `;
    const mergedClassName = cx(customClassName, className);
    const inputProps = {
      ...rest,
      allowClear,
      style: style,
      className: mergedClassName,
      onBlur: this.handleBlur,
      onChange: this.handleChange,
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
      suffix: (suffix || showCharacter || tip) && (
        <>
          {suffix}
          {showCharacter && (
            <span className="ant-input-character">
              {currentBytes}/{maxLength}
            </span>
          )}
          {tip && (
            <Tooltip title={tip} overlayClassName="customize-tooltip">
              <img src={tipIcon} alt="tip" />
            </Tooltip>
          )}
        </>
      ),
    };

    if (showCharacter) {
      inputProps.onInput = (e) => {
        const { nativeEvent } = e;
        const { value } = nativeEvent.target;
        const currentBytes = getStringBytes(value);
        if (currentBytes > maxLength) {
          nativeEvent.target.value = interceptString(value, maxLength);
          this.setState({ currentBytes: maxLength })
        } else {
          this.setState({ currentBytes });
        }
      };
    }
    return <Input {...inputProps} />;
  }
}

/**
 * CusInput.TextArea
 * autoChangeSize(true | false): 在聚焦时，是否自动改变行数为4行，失去焦点时，变为1行
 * showCharacter(true | false): 是否需要显示剩余字符数
 * maxLength(number): 最大能输入的字符数
 */
class CusTextArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      minRows: 1, // 默认最小行数
      maxRows: 1, // 默认最大行数
      currentBytes: 0, // 当前字符数
    };
  }

  componentDidMount() {
    if (this.props.value && this.props.showCharacter) {
      this.setState({
        currentBytes: getStringBytes(this.props.value),
      });
    }
  }

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   return (
  //     this.props.value !== nextProps.value ||
  //     this.state.currentBytes !== nextState.currentBytes ||
  //     this.state.rows !== nextState.rows
  //   );
  // }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      const { currentBytes } = this.state;
      // 在异步数据value变化的情况下，初始化剩余字符
      if(currentBytes === 0 && this.props.showCharacter){
        this.setState({
          currentBytes: getStringBytes(this.props.value),
        });
      }
    }
  }

  handleChange = (e) => {
    const { inputChinese = true, onChange } = this.props;
    let changeValue = e.target.value;
    if (!inputChinese) {
      changeValue = changeValue.replace(/[\u4E00-\u9FA5]/g, '');
    }
    if (onChange) {
      onChange(e, changeValue, e.target);
    }
  };

  render() {
    const { autoChangeSize = false, showCharacter = false, maxLength, tagFlex = false, ...other } = this.props;
    const { minRows, maxRows, currentBytes } = this.state;
    const cusProps = {
      onChange: this.handleChange,
    };
    if (autoChangeSize) {
      cusProps.autoSize = { minRows, maxRows };
      const { onBlur, onFocus } = this.props;
      cusProps.onFocus = (e) => {
        this.setState({
          minRows: 1,
          maxRows: 4,
        });
        if(onFocus){
          onFocus(e)
        }
      };
      cusProps.onBlur = (e) => {
        this.setState({
          minRows: 1,
          maxRows: 1,
        });
        if(onBlur){
          onBlur(e)
        }
      };
    }
    if (showCharacter) {
      cusProps.onInput = (e) => {
        const { nativeEvent } = e;
        const { value } = nativeEvent.target;
        const currentBytes = getStringBytes(value);
        if (currentBytes > maxLength) {
          nativeEvent.target.value = interceptString(value, maxLength);
          this.setState({ currentBytes: maxLength });
        } else {
          this.setState({ currentBytes });
        }
      };
    }
    return (
      <div style={{ position: 'relative', width: '100%'}} className={tagFlex ? "tag-input-flex" : ""}>
        <TextArea {...other} {...cusProps} />
        {showCharacter && (
          <span className={tagFlex ? "textarea-currentBytes" : "ant-input-textarea-character"}>
            {currentBytes}/{maxLength}
          </span>
        )}
      </div>
    );
  }
}

CusInput.TextArea = CusTextArea;
