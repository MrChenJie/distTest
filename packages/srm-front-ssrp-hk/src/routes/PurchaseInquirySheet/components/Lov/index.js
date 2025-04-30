import React from 'react';
import { Modal, Input, Icon, Button } from 'hzero-ui';
import { isFunction, omit, isNil } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';

import intl from 'utils/intl';
import './index.less';

const defaultRowKey = 'key';
export default class Lov extends React.Component {
  // 选中记录
  record;

  static displayName = 'Lov';

  loading = false;

  constructor(props) {
    super(props);
    this.state = {
      text: props.isInput ? props.value : props.textValue,
      textField: props.textField,
      lov: {},
      loading: false,
    };
  }

  getTextField() {
    const { form } = this.props;
    const { textField } = this.state;
    if (form && textField) {
      form.registerField(textField);
    }
    return textField;
  }

  selectRecord(record) {
    const { isInput, lovOptions = {} } = this.props;
    const { valueField: rowkey = defaultRowKey, displayField: displayName } = lovOptions;

    // TODO: 值为 0 -0 '' 等的判断

    this.setState(
      {
        text: this.parseField(record, displayName),
      },
      () => {
        const { form } = this.props;
        const textField = this.getTextField();
        if (form && textField) {
          form.setFieldsValue({
            [textField]: this.parseField(record, displayName),
          });
        }
        // 设置额外表单值
        if (form && this.props.extSetMap) {
          this.setExtMapToForm(record, this.props.extSetMap, form);
        }

        if (this.props.onChange) {
          const valueField = isInput ? displayName : rowkey;
          this.props.onChange(this.parseField(record, valueField), record);
        }
        if (isFunction(this.props.onOk)) {
          this.props.onOk(record);
        }
      }
    );
  }

  /**
   * 设置额外表单值
   * @param {Object} record 数据对象
   * @param {String} extSetMap 额外字段映射, 可以有多个, 以逗号分隔 bankId,bankName->bankDescription
   * @param {表单对象} form 表单对象
   */
  setExtMapToForm(record, extSetMap, form) {
    const dataSet = {};
    extSetMap.split(/\s*,\s*/g).forEach((entryStr) => {
      const [recordField, formFieldTmp] = entryStr.split('->');
      const formField = formFieldTmp || recordField;
      form.getFieldDecorator(formField);
      dataSet[formField] = record[recordField];
    });
    form.setFieldsValue(dataSet);
  }

  @Bind()
  onCancel() {
    const { onCancel = (e) => e } = this.props;
    this.setState({
      modalVisible: false,
    });
    if (isFunction(onCancel)) {
      onCancel();
    }
    this.record = null;
  }

  @Bind()
  onSearchBtnClick() {
    const { disabled, onBefore = () => true } = this.props;
    if (disabled) {
      return false;
    }
    if (!onBefore()) {
      return false;
    }
    this.setState({
      modalVisible: true,
    });
  }

  searchButton() {
    if (this.state.loading) {
      return <Icon key="search" type="loading" />;
    }
    return (
      <Icon
        key="search"
        type="search"
        onClick={this.onSearchBtnClick}
        style={{ cursor: 'pointer', color: '#666' }}
      />
    );
  }

  @Bind()
  emitEmpty() {
    const { text, lov } = this.state;
    const { form, onClear = (e) => e, value } = this.props;
    if (this.props.onChange) {
      const record = {};
      this.setState(
        {
          text: '',
        },
        () => {
          this.props.onChange(undefined, record);
          const textField = this.getTextField();
          if (form && textField) {
            form.setFieldsValue({
              [textField]: undefined,
            });
          }
        }
      );
    }
    // TODO: 当初次进入时的情况
    if (isFunction(onClear)) {
      const record = {
        [lov.displayField]: text,
        [lov.valueField]: value,
      };
      onClear(record);
    }
  }

  /**
   * 访问对象由字符串指定的多层属性
   * @param {Object} obj 访问的对象
   * @param {String} str 属性字符串，如 'a.b.c.d'
   */
  @Bind()
  parseField(obj, str) {
    if (/[.]/g.test(str)) {
      const arr = str.split('.');
      const newObj = obj[arr[0]];
      const newStr = arr.slice(1).join('.');
      return this.parseField(newObj, newStr);
    }
    return obj[str];
  }

  /**
   * 同步 Lov 值节流以提高性能
   * @param {String} value - Lov 组件变更值
   */
  @Bind()
  @Throttle(500)
  setValue(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  /**
   * 同步输入值至 Input 及 Lov
   * @param {String} value - 输入框内的值
   */
  @Bind()
  setText(value) {
    const { isInput } = this.props;
    if (isInput) {
      this.setState(
        {
          text: value,
        },
        () => {
          this.setValue(value);
        }
      );
    }
  }

  @Bind()
  handleSave(lines = []) {
    if (lines.length === 0) {
      Modal.warning({
        title: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    }
    this.selectRecord(lines[0]);
    this.setState({
      modalVisible: false,
    });
  }

  render() {
    const { text: stateText } = this.state;
    const {
      form,
      value,
      textValue,
      style,
      isButton,
      isInput,
      className,
      allowClear = true,
      ModalContent,
      modalTitle,
      queryParams,
      ...otherProps
    } = this.props;
    const textField = this.getTextField();
    let text;
    const omitProps = ['onOk', 'onCancel', 'onClick', 'onClear', 'textField', 'lovOptions'];
    if (isInput) {
      text = stateText;
      omitProps.push('onChange');
    } else {
      const texts = textField ? form && form.getFieldValue(textField) : stateText;
      text = isNil(value) ? '' : texts === 0 ? 0 : texts || textValue;
    }
    const inputStyle = isButton
      ? style
      : {
          ...style,
          verticalAlign: 'middle',
          position: 'relative',
          top: -1,
        };
    const isDisabled = this.props.disabled !== undefined && !!this.props.disabled;
    const showSuffix = text && allowClear && !isButton && !isDisabled;
    const suffix = (
      <>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        {this.searchButton()}
      </>
    );

    const lovClassNames = [className, 'lov-input'];
    if (showSuffix) {
      lovClassNames.push('lov-suffix');
    }
    if (isDisabled) {
      lovClassNames.push('lov-disabled');
    }
    const { modalVisible } = this.state;
    const modalProps = {
      title: modalTitle,
      width: 1100,
      destroyOnClose: true,
      wrapClassName: 'lov-modal',
      maskClosable: false,
      // onOk: this.selectAndClose,
      onCancel: this.onCancel,
      style: {
        minWidth: 400,
      },
      visible: modalVisible,
      footer: null,
    };
    return (
      <>
        {isButton ? (
          <Button
            onClick={this.onSearchBtnClick}
            {...otherProps}
            style={style}
            className={lovClassNames.join(' ')}
          />
        ) : (
          <Input
            readOnly={!isInput}
            // addonAfter={this.searchButton()}
            value={text}
            style={inputStyle} // Lov 组件垂直居中样式，作用于 ant-input-group-wrapper
            suffix={suffix}
            onChange={(e) => this.setText(e.target.value)}
            {...omit(otherProps, omitProps)}
            className={lovClassNames.join(' ')}
          />
        )}
        <Modal {...modalProps}>
          {ModalContent && (
            <ModalContent onSave={this.handleSave} {...queryParams} onCancel={this.onCancel} />
          )}
        </Modal>
      </>
    );
  }
}
