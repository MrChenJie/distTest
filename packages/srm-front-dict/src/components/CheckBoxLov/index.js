import React from 'react';
import { Modal, Input, Icon, Button, message, Tag } from 'hzero-ui';
import { isEmpty, isArray, isFunction, omit, isNil } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { queryLov, queryMapIdpValue } from 'services/api';
import './index.less';
// import { LovFieldType } from 'choerodon-ui/pro/lib/lov/enum';
import LovModal from './LovModal';

const defaultRowKey = 'value';
export default class Lov extends React.Component {
  // 选中记录
  record;

  // 缓存选中记录
  cacheRecord;

  static displayName = 'Lov';

  loading = false;

  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      currentText: null,
      text: props.isInput ? props.value : props.textValue,
      textField: props.textField,
      lov: {
        ...props.lovOptions,
      },
      loading: false,
      ldpData: {},
    };
    this.record = (props.value || []).map((item) => {
      return {
        [props.lovOptions.valueField]: item,
      };
    });
    this.cacheRecord = this.record;
    this.modalRef = React.createRef();
    this.tagBoxRef = React.createRef();
    this.checkBoxLovRef = React.createRef();
  }

  componentDidMount() {
    this.handleTagBoxHeight();
    window.addEventListener('resize', this.handleTagBoxHeight);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleTagBoxHeight);
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentText, text } = this.state;
    let data = {
      currentText: nextProps.textValue === currentText ? currentText : nextProps.textValue,
    };

    if (currentText && currentText !== nextProps.textValue) {
      data = {
        ...data,
        text: nextProps.textValue,
      };
    }
    if (!text && nextProps.textValue) {
      data = {
        ...data,
        text: nextProps.textValue,
      };
    }
    if (nextProps.value === null || nextProps.value === undefined) {
      data = {
        ...data,
        text: null,
      };
    }
    if (nextProps.isInput) {
      data = {
        ...data,
        text: nextProps.value,
      };
    }

    this.setState({
      ...data,
    });
  }

  @Bind()
  onSelect(record) {
    // this.record = record;
    this.cacheRecord = record;
  }

  @Bind()
  selectAndClose() {
    this.record = this.cacheRecord;
    if (!this.record) {
      Modal.warning({
        title: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    }
    this.selectRecord(this.record);
    this.setState({
      modalVisible: false,
    });
  }

  getTextField() {
    const { form } = this.props;
    const { textField } = this.state;
    if (form && textField) {
      form.registerField(textField);
    }
    return textField;
  }

  selectRecord() {
    const { isInput } = this.props;
    const {
      valueField: rowkey = defaultRowKey,
      displayField: displayName,
    } = this.state.lov;

    // TODO: 值为 0 -0 '' 等的判断

    this.setState(
      {
        text: this.parseMulField(this.record, displayName),
      },
      () => {
        const { form } = this.props;
        const textField = this.getTextField();
        if (form && textField) {
          form.setFieldsValue({
            [textField]: this.parseMulField(this.record, displayName),
          });
        }
        // 设置额外表单值
        if (form && this.props.extSetMap) {
          this.setExtMapToForm(this.record, this.props.extSetMap, form);
        }

        if (this.props.onChange) {
          const valueField = isInput ? displayName : rowkey;
          this.props.onChange(this.parseMulField(this.record, valueField), this.record);
        }
        if (isFunction(this.props.onOk)) {
          this.props.onOk(this.record);
        }
        // this.record = null;
        // this.forceUpdate();
        // if (this.cacheRecord && this.record && isEmpty(this.record) && isEmpty(this.cacheRecord)) {
        //   this.record = null;
        //   this.cacheRecord = null;
        // }
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
    // this.record = null;
  }

  showLoading(partialState = {}) {
    this.setState({
      loading: true,
      ...partialState,
    });
  }

  hideLoading() {
    this.setState({
      loading: false,
    });
  }

  @Bind()
  modalWidth(tableFields) {
    let width = 100;
    tableFields.forEach((n) => {
      width += n.width;
    });
    return width;
  }

  @Bind()
  onSearchBtnClick() {
    const {
      disabled = false,
      onClick = (e) => e,
      lovOptions: { valueField: customValueField, displayField: customDisplayField } = {},
    } = this.props;
    if (disabled || this.loading) return; // 节流

    // this.record = null;
    const { code: viewCode, originTenantId: tenantId } = this.props;
    this.loading = true;
    this.showLoading({
      loading: true,
      modalVisible: true,
      lovModalKey: uuid(),
    });
    queryLov({ viewCode, tenantId })
      .then((oriLov) => {
        const lov = { ...oriLov };
        if (customValueField) {
          lov.valueField = customValueField;
        }
        if (customDisplayField) {
          lov.displayField = customDisplayField;
        }
        if (!isEmpty(lov)) {
          const { viewCode: hasCode, title = '', tableFields } = lov;
          // 获取独立值集编码
          const valueList = lov.queryFields.filter((item) => item.dataType === 'SELECT');
          if (valueList.length > 0) {
            const valueCode = {};
            valueList.forEach(({ sourceCode }) => {
              if (sourceCode) {
                valueCode[sourceCode] = sourceCode;
              }
            });
            queryMapIdpValue(valueCode).then((res) => {
              if (getResponse(res)) {
                this.setState({ ldpData: res });
              }
            });
          }

          if (hasCode) {
            const width = this.modalWidth(tableFields);
            this.setState(
              {
                lov,
                title,
                width,
              },
              () => {
                const { modalVisible: lovModalVisible } = this.state;
                if (lovModalVisible && this.modalRef.current) {
                  this.modalRef.current.loadOnFirstVisible();
                }
              }
            );
            if (isFunction(onClick)) {
              onClick();
            }
          } else {
            this.hideLoading();
            message.error(
              intl.get('hzero.common.components.lov.notification.undefined').d('值集视图未定义!')
            );
          }
        }
      })
      .finally(() => {
        this.hideLoading();
        this.loading = false;
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
          this.record = null;
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

  @Bind()
  parseMulField(arr = [], str) {
    const values = [];
    arr.forEach((item) => {
      values.push(item[str]);
    });
    return values;
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.handleTagBoxHeight();
  }

  @Bind()
  handleTagOnClose(event, recordKey) {
    event.preventDefault();
    const { tagOnClose = (e) => e } = this.props;
    const {
      valueField: rowkey = defaultRowKey,
      displayField: displayName,
    } = this.state.lov;
    if (rowkey === displayName) {
      this.record = this.record.filter((item) => item[rowkey] !== recordKey);
      this.cacheRecord = this.cacheRecord.filter((item) => item[rowkey] !== recordKey);
    } else {
      const realValue = this.record.find((item) => item[displayName] === recordKey)[rowkey];
      this.record = this.record.filter((item) => item[rowkey] !== realValue);
      this.cacheRecord = this.cacheRecord.filter((item) => item[rowkey] !== realValue);
    }
    if (this.record) {
      this.selectRecord();
    }
    this.handleTagBoxHeight();
    if (isFunction(tagOnClose)) {
      tagOnClose();
    }
  }

  @Bind()
  handleTagBoxHeight() {
    const {clientHeight} = this.tagBoxRef.current;
    const tagBoxHeight = clientHeight || 28;
    if (tagBoxHeight > 141) {
      this.checkBoxLovRef.current.style.height = `140px`;
      this.checkBoxLovRef.current.style.overflow = 'auto';
    } else {
      this.checkBoxLovRef.current.style.height = `${tagBoxHeight}px`;
    }
  }

  render() {
    const { text: stateText, ldpData = {} } = this.state;
    const {
      form,
      value = {},
      textValue,
      queryParams,
      queryInputProps,
      style,
      isButton,
      isInput,
      className,
      allowClear = true,
      isDelete = false,
      isSelect = false,
      isDbc2Sbc,
      lovOptions,
      ...otherProps
    } = this.props;

    const { valueField: rowkey = defaultRowKey } = this.state.lov;
    const textField = this.getTextField();
    let text;
    const omitProps = ['onOk', 'onCancel', 'onClick', 'onClear', 'textField', 'lovOptions'];

    if (isInput) {
      text = stateText;
      omitProps.push('onChange');
    } else {
      const texts = textField
        ? form && form.getFieldValue(textField)
        : this.record?.map((item) => item[rowkey]);
      text = isNil(value) ? '' : texts === 0 ? 0 : texts;
    }
    const inputStyle = isButton
      ? style
      : {
          ...style,
          verticalAlign: 'middle',
          position: 'relative',
          // top: -1,
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
    const { title = '', width = 400, lov = {}, modalVisible, loading, lovModalKey } = this.state;
    const modalProps = {
      title,
      width,
      destroyOnClose: false,
      wrapClassName: 'lov-modal',
      maskClosable: false,
      onOk: this.selectAndClose,
      bodyStyle: title ? { padding: '16px' } : { padding: '56px 16px 0' },
      onCancel: this.onCancel,
      style: {
        minWidth: 400,
      },
      visible: modalVisible,
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
          <div className="checkBoxLov-input-wrapper-spfm" ref={this.checkBoxLovRef}>
            <Input
              readOnly={!isInput}
              // addonAfter={this.searchButton()}
              // value={text}
              style={inputStyle} // Lov 组件垂直居中样式，作用于 ant-input-group-wrapper
              suffix={suffix}
              onChange={(e) => this.setText(e.target.value)}
              {...omit(otherProps, omitProps)}
              className={lovClassNames.join(' ')}
            />
            <div id="tagBox" ref={this.tagBoxRef}>
              {isArray(text) &&
                text.map((item, index) => {
                  if (index < 2) {
                    return (
                      <Tag
                        closable={isDelete}
                        onClose={(event) => this.handleTagOnClose(event, item)}
                      >
                        {item}
                      </Tag>
                    );
                  } else if (index === 2) {
                    return <Tag onClick={this.onSearchBtnClick}>{`+ ${text.length - 2} ...`}</Tag>;
                  }
                })}
            </div>
          </div>
        )}
        <Modal {...modalProps}>
          <LovModal
            key={lovModalKey}
            lov={lov}
            ldpData={ldpData}
            queryParams={queryParams}
            queryInputProps={queryInputProps}
            onSelect={this.onSelect}
            onClose={this.selectAndClose}
            lovLoadLoading={loading}
            wrappedComponentRef={this.modalRef}
            isDbc2Sbc={isDbc2Sbc}
            selectedData={this.record}
            isSelect={isSelect}
            // lovLoadLoading={loading}
          />
        </Modal>
      </>
    );
  }
}
