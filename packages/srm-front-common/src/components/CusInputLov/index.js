import React from 'react';
import { Input, AutoComplete, Tooltip } from 'antd';
import { isEmpty, isFunction, omit, isNil } from 'lodash';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import uuid from 'uuid/v4';
import qs from 'querystring';
import searchIcon from '@/assets/searchIcon.svg';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { getResponse } from '@/utils/utils';
import { queryLov, queryMapIdpValue, queryLovData } from 'services/api';
import Modal from '@/components/CusModal';
import CusNotification from '@/components/CusNotification';
import CusButton from '@/components/CusButton';
import LovModal from './LovModal';
import tipIcon from '@/assets/tips.svg';
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
      currentText: null,
      text: props.isInput ? props.value : props.textValue,
      textField: props.textField,
      lov: {},
      loading: false,
      ldpData: {},
      lovData: [],
      totalElements: 0,
      size: 10,
      searchValue: '',
    };
    // this.modalRef = React.createRef();
    this.inputRef = React.createRef();
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
    // if (nextProps.isInput) {
    //   data = {
    //     ...data,
    //     text: nextProps.value,
    //   };
    // }

    this.setState({
      ...data,
    });
  }

  @Bind()
  onSelect(record) {
    this.record = record;
  }

  @Bind()
  selectAndClose() {
    if (!this.record) {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    }
    this.selectRecord(this.record);
    this.setState({
      modalVisible: false,
    });
    const { focus } = this.inputRef.current;
    focus();
  }

  getTextField() {
    // const { form } = this.props;
    const { textField } = this.state;
    // if (form && textField) {
    //   form.registerField(textField);
    // }
    return textField;
  }

  selectRecord() {
    // const { isInput } = this.props;
    const { valueField: rowkey = defaultRowKey, displayField: displayName } = this.state.lov;

    // TODO: 值为 0 -0 '' 等的判断

    this.setState(
      {
        text: this.parseField(this.record, displayName),
      },
      () => {
        const { form } = this.props;
        const textField = this.getTextField();
        if (form && textField) {
          form.setFieldsValue({
            [textField]: this.parseField(this.record, displayName),
          });
        }
        // 设置额外表单值
        if (form && this.props.extSetMap) {
          this.setExtMapToForm(this.record, this.props.extSetMap, form);
        }

        if (this.props.onChange) {
          // const valueField = isInput ? displayName : rowkey;
          const valueField = rowkey;
          this.props.onChange(this.parseField(this.record, valueField), this.record);
        }
        if (isFunction(this.props.onOk)) {
          this.props.onOk(this.record);
        }
        this.record = null;
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

    this.record = null;
    const { code: viewCode, originTenantId: tenantId } = this.props;
    this.loading = true;
    this.showLoading({
      loading: true,
      modalVisible: true,
      lovModalKey: uuid(),
    });
    this.handleQueryLov(viewCode, tenantId, customValueField, customDisplayField, onClick);
  }

  componentDidMount() {
    const {
      disabled = false,
      lovOptions: { valueField: customValueField, displayField: customDisplayField } = {},
    } = this.props;
    if (disabled || this.loading) return; // 节流

    const { code: viewCode, originTenantId: tenantId } = this.props;
    this.loading = true;
    this.handleQueryLov(viewCode, tenantId, customValueField, customDisplayField);
  }

  handleQueryLov(viewCode, tenantId, customValueField, customDisplayField, onClick) {
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
                if (lovModalVisible && this.modalRef) {
                  this.modalRef.loadOnFirstVisible();
                }
              }
            );
            if (isFunction(onClick)) {
              onClick();
            }
          } else {
            this.hideLoading();
            CusNotification.error({
              message: intl
                .get('hzero.common.components.lov.notification.undefined')
                .d('值集视图未定义!'),
            });
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
      return <img src={searchIcon} alt="searchIcon" />;
    }
    return (
      <img
        src={searchIcon}
        alt="searchIcon"
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
    const { isInput, form } = this.props;
    const { textField } = this.state;
    if (isInput) {
      this.setState({ text: value });
      if (form && textField) {
        form.setFieldsValue({
          [textField]: value,
        });
      }
    }
  }

  @Bind()
  @Debounce(200)
  handleInput(value) {
    const searchValue = value && value.trim();
    if (searchValue) {
      this.queryData({}, searchValue);
    } else {
      this.setState({
        lovData: [],
        totalElements: 0,
        size: 10,
        searchValue: '',
      });
    }
  }

  @Bind()
  queryData(pagination = {}, searchValue) {
    const { lov } = this.state;
    const { queryUrl, pageSize, lovCode, lovTypeCode } = lov;
    const { queryParams = {}, lovOptions = {} } = this.props;
    const { displayField } = lovOptions || 'meaning';

    let nowQueryParams = queryParams || {};
    if (isFunction(nowQueryParams)) {
      nowQueryParams = nowQueryParams();
    }
    const queryIndex = queryUrl.indexOf('?');
    let sourceQueryParams = {};
    if (queryIndex !== -1) {
      sourceQueryParams = qs.parse(queryUrl.substr(queryIndex + 1));
    }

    const sourceParams = {
      page: pagination.current - 1 || 0,
      size: pagination.pageSize || pageSize,
      ...sourceQueryParams,
      ...nowQueryParams,
      [displayField]: searchValue,
    };
    const params =
      lovTypeCode !== 'URL'
        ? Object.assign(sourceParams, {
            lovCode,
          })
        : sourceParams;

    /**
     * 替换查询 Url 中的变量
     * @param {String} url
     * @param {Object} data
     */
    function getUrl(url, data) {
      let ret = url;
      const organizationRe = /\{organizationId\}|\{tenantId\}/g;
      Object.keys(data).map((key) => {
        const re = new RegExp(`{${key}}`, 'g');
        ret = ret.replace(re, data[key]);
        return ret;
      });
      if (organizationRe.test(ret)) {
        ret = ret.replace(organizationRe, getCurrentOrganizationId());
      }
      const index = ret.indexOf('?'); // 查找是否有查询条件
      if (queryIndex !== -1) {
        ret = ret.substr(0, index);
      }
      return ret;
    }

    const url = getUrl(queryUrl, queryParams);

    queryLovData(url, params).then((res) => {
      if (getResponse(res)) {
        const { content = [], totalElements, size } = res;
        this.setState({
          lovData: content,
          totalElements,
          size,
          searchValue,
        });
      }
    });
  }

  @Bind()
  handleBlur() {
    const { value, isInput } = this.props;
    if (isInput) {
      const { lovData, lov, text } = this.state;
      const { valueField } = lov;
      const data = lovData.find((item) => item[valueField] === text);
      if (!data) {
        this.setState({
          text: value,
        });
      }
    }
  }

  @Bind()
  handleChange(value) {
    const { isInput } = this.props;
    if (isInput && !value) {
      this.emitEmpty();
      return false;
    }
    const { lovData, lov } = this.state;
    const { valueField = 'value' } = lov;
    const data = lovData.find((item) => item[valueField] === value);
    if (data && isInput) {
      this.record = data;
      this.selectRecord(this.record);
    } else {
      this.setText(value);
    }
  }

  renderOptions() {
    const { lovData, lov, totalElements, size, searchValue } = this.state;
    const { valueField = 'value', displayField = 'meaning' } = lov;
    const options = lovData.map((item) => (
      <AutoComplete.Option key={item[valueField]} value={item[valueField]}>
        {item[displayField]}
      </AutoComplete.Option>
    ));
    if (size < totalElements) {
      options.push(
        <AutoComplete.Option key="load-more" disabled>
          <a
            onClick={() => {
              this.queryData({ pageSize: size + 10 }, searchValue);
            }}
          >
            {intl.get('hzero.common.button.loadMore').d('加载更多')}
          </a>
        </AutoComplete.Option>
      );
    }
    return options;
  }

  @Bind()
  handleClearLovData() {
    this.setState({
      lovData: [],
      totalElements: 0,
      size: 10,
      searchValue: '',
    });
  }

  render() {
    const { text: stateText, ldpData = {}, lov } = this.state;
    const {
      form,
      value,
      textValue,
      queryParams,
      queryInputProps,
      style,
      isButton,
      isInput,
      className,
      allowClear = true,
      tip,
      ...otherProps
    } = this.props;
    const textField = this.getTextField();
    let text;
    const omitProps = ['onOk', 'onCancel', 'onClick', 'onClear', 'textField', 'lovOptions'];
    if (isInput) {
      text = textField ? form && form.getFieldValue(textField) : stateText;
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
        <div className="cus-lov-clear" onClick={this.emitEmpty} />
        {tip && (
          <Tooltip title={tip} overlayClassName="customize-tooltip">
            <img src={tipIcon} style={{ width: '16px' }} alt="tip" />
          </Tooltip>
        )}
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
    const { title = '', width = 400, modalVisible, loading, lovModalKey } = this.state;
    const modalProps = {
      closable: false,
      title,
      width,
      destroyOnClose: true,
      // wrapClassName: 'lov-modal',
      maskClosable: false,
      onOk: this.selectAndClose,
      // bodyStyle: title ? { padding: '16px' } : { padding: '56px 16px 0' },
      onCancel: this.onCancel,
      style: {
        minWidth: 650,
        maxWidth: 1000,
      },
      visible: modalVisible,
    };
    return (
      <>
        {isButton ? (
          <CusButton
            onClick={this.onSearchBtnClick}
            {...otherProps}
            style={style}
            // className={lovClassNames.join(' ')}
          />
        ) : (
          <div className="antd-lov-modal">
            <>
              <AutoComplete
                onSearch={this.handleInput}
                dataSource={this.renderOptions()}
                onSelect={this.handleClearLovData}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                onFocus={this.handleClearLovData}
                value={text}
                defaultActiveFirstOption={false}
                className="customize-autoComplete"
                popupClassName="customize-select"
                {...omit(otherProps, omitProps)}
              >
                <Input
                  readOnly={!isInput}
                  style={inputStyle} // Lov 组件垂直居中样式，作用于 ant-input-group-wrapper
                  suffix={suffix}
                  // onChange={this.handleChange}
                  {...omit(otherProps, omitProps)}
                  className={lovClassNames.join(' ')}
                  list="lov-data"
                  autoComplete="off"
                  ref={this.inputRef}
                  onKeyDown={(e) => {
                    if (e.keyCode === 13 && e.target) {
                      e.preventDefault();
                      const form = e.target.closest('form');
                      const submitBtn = form && form.querySelector('button[type="submit"]');
                      if (submitBtn) {
                        submitBtn.click();
                      }
                      return false;
                    }
                  }}
                />
              </AutoComplete>
            </>
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
            wrappedComponentRef={(ref) => {
              this.modalRef = ref;
            }}
          />
        </Modal>
      </>
    );
  }
}
