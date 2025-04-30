import React, { ReactElement, ChangeEvent } from 'react';
import { Input, Tooltip } from 'antd';
import { isEmpty, isFunction, omit, isNil, pick } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import qs from 'querystring';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { getResponse } from '@/utils/utils';
import { queryLov, queryLovData, queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import Modal from '@/components/CusModal';
import CusNotification from '@/components/CusNotification';
import CusButton from '@/components/CusButton';
import LovModal from './LovModal';
import searchIcon from '@/assets/searchIcon.svg';
import './index.less';
import tipIcon from '@/assets/tips.svg';

const defaultRowKey = 'key';

export interface LovProps {
  value?: any;
  isInput?: boolean;
  disabled?: boolean;
  lovOptions?: any;
  extSetMap?: any;
  form?: any;
  originTenantId?: number;
  code?: string;
  textValue?: string;
  queryParams?: any;
  queryInputProps?: any;
  style?: React.CSSProperties;
  isButton?: boolean;
  isParentButton?: boolean;
  className?: string;
  allowClear?: boolean;
  onOk?: any;
  onChange?: any;
  onClear?: any;
  onClick?: any;
  onCancel?: any;
  isDbc2Sbc?: boolean;
  placeholder?: string;
  publicMode?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  noCache?: boolean;
  noInit?: boolean;
  autoSelectSingle?: boolean;
  afterAutoSelect?: any;
  showLatestRecord?: boolean;
  submitCheck?: any;
}

export default class Lov extends React.Component<LovProps, any> {
  // 选中记录
  record: any = undefined;

  static displayName = 'Lov';

  loading = false;

  modalRef: React.RefObject<any> = { current: null };
  inputRef: React.RefObject<any> = { current: null };

  cacheValue;

  config;

  constructor(props) {
    super(props);
    this.state = {
      text: props.isInput ? props.value : props.textValue,
      textField: props.textField,
      lov: {},
      code: '',
      loading: false,
      firstFlag: true,
      ldpData: {},
      lovDataList: [],
      lovDataPagination: {},
      lovQueryParam: {},
      topList: [],
    };
    // this.config = getEnvConfig();
    this.modalRef = React.createRef();
    this.inputRef = React.createRef();
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { text, code } = this.state;
    let data: any = {
      text: nextProps.value !== this.cacheValue ? undefined : text,
    };

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

    if (nextProps.code !== code) {
      data = {
        ...data,
        code: nextProps.code,
        lov: {},
        lovDataList: [],
        lovDataPagination: {},
        lovQueryParam: {},
        firstFlag: true,
      };
    }

    this.setState({
      ...data,
    });
  }

  @Bind()
  queryData(cb) {
    const { queryUrl = '', pageSize, lovCode, lovTypeCode, requestMethod = '' } = this.state.lov;
    if (!queryUrl) {
      return;
    }
    const { queryParams = {} } = this.props;
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
      page: 0,
      size: pageSize,
      ...sourceQueryParams,
      ...nowQueryParams,
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
    const method = lovTypeCode === 'URL' ? requestMethod : '';

    this.setState(
      {
        loading: true,
      },
      () => {
        queryLovData(url, params, method)
          .then((res) => {
            if (getResponse(res) && (res.content.length === 1 || res.length === 1)) {
              this.onSelect(res.content?.[0] || res[0]);
              if (this.record) {
                this.setState({ hasOnlyOne: true }, () => {
                  this.selectRecord(cb);
                });
              }
            } else if (getResponse(res) && typeof cb === 'function') {
              this.setState({ hasOnlyOne: false, autoQueryData: res }, cb);
            }
          })
          .catch(() => {
            if (typeof cb === 'function') {
              this.setState({ hasOnlyOne: false }, cb);
            }
          })
          .finally(() => {
            this.hideLoading();
          });
      }
    );
  }

  @Bind()
  onSelect(record) {
    this.record = record;
  }

  @Bind()
  selectAndClose() {
    const { submitCheck } = this.props;
    if (!this.record) {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    } else {
      if (!submitCheck || (submitCheck && submitCheck(this.record))) {
        this.selectRecord();
        this.setState({ modalVisible: false });
        this.inputRef.current?.focus();
      }
    }
  }

  @Bind()
  upDateData(lovDataList, lovDataPagination, lovQueryParam) {
    this.setState({
      lovDataList,
      lovDataPagination,
      lovQueryParam,
    });
  }

  getTextField() {
    // const { form } = this.props;
    const { textField } = this.state;
    // if (form && textField) {
    //   form.registerField(textField);
    // }
    return textField;
  }

  selectRecord(cb?: any) {
    const { isInput } = this.props;
    const { valueField: rowkey = defaultRowKey, displayField: displayName } = this.state.lov;
    this.cacheValue = this.parseField(this.record, rowkey); // 记录lov变更时对应props中的value， 一旦此value改变，便说明此时、state中的text无效
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
          const valueField = isInput ? displayName : rowkey;
          this.props.onChange(this.parseField(this.record, valueField), this.record);
        }
        if (isFunction(this.props.onOk)) {
          this.props.onOk(this.record);
        }
        if (typeof cb === 'function') {
          cb();
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

  showLoading(partialState = {}, cb = (e) => e) {
    this.setState(
      {
        loading: true,
        ...partialState,
      },
      () => {
        if (isFunction(cb)) {
          cb();
        }
      }
    );
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
  initLov(cb = () => {}, cb2 = () => {}): void {
    const {
      lovOptions: { valueField: customValueField, displayField: customDisplayField } = {} as any,
      publicMode = false,
      isInitQuery = true,
    } = this.props;

    this.record = null;
    const { code: viewCode, originTenantId: tenantId } = this.props;
    this.loading = true;
    this.showLoading({
      loading: true,
    });
    queryLov({ viewCode, tenantId, publicMode })
      .catch(() => {
        if (typeof cb2 === 'function') {
          cb();
        }
      })
      .then((oriLov) => {
        const lov = { ...oriLov };
        if (customValueField) {
          lov.valueField = customValueField;
        }
        if (customDisplayField) {
          lov.displayField = customDisplayField;
        }
        if (!isEmpty(getResponse(lov))) {
          const { viewCode: hasCode, title = '', tableFields } = lov;
          // 获取独立值集编码
          const valueList = lov.queryFields?.filter((item) => item.dataType === 'SELECT') || [];
          if (valueList.length > 0) {
            const valueCode = {};
            valueList.forEach(({ sourceCode }) => {
              if (sourceCode) {
                valueCode[sourceCode] = sourceCode;
              }
            });

            const keys = Object.keys(valueCode);
            Promise.all(
              keys.map((i) => {
                return queryUnifyIdpValue(valueCode[i], {}, publicMode);
              })
            ).then((res) => {
              if (getResponse(res)) {
                const ldpData = {};
                keys.forEach((i, index) => {
                  ldpData[i] = res?.[index];
                });
                this.setState({ ldpData });
              }
            });
          }

          if (hasCode) {
            const width = this.modalWidth(tableFields);
            this.setState(
              {
                lov,
                width,
                title,
                topList: lov.topList || [],
              },
              () => {
                if (isInitQuery) {
                  cb();
                }
              }
            );
          } else {
            this.hideLoading();
          }
        }
      })
      .finally(() => {
        this.hideLoading();
        this.loading = false;
      });
  }

  @Bind()
  onFirst(cb = () => {}, cb2 = () => {}): void {
    const { firstFlag } = this.state;
    if (firstFlag) {
      this.initLov(cb, cb2);
    } else {
      cb();
    }
  }

  @Bind()
  afterAutoSelect(flag = false): void {
    const { onClick = (e) => e, afterAutoSelect = (e) => e } = this.props;
    const { firstFlag, hasOnlyOne } = this.state;
    if (hasOnlyOne) {
      this.loading = false;
      afterAutoSelect();
    } else {
      this.record = null;
      this.loading = true;
      this.showLoading(
        {
          modalVisible: true,
          lovModalKey: uuid(),
        },
        () => {
          const { lov } = this.state;
          const { viewCode: hasCode } = lov;
          if (!hasCode && !firstFlag) {
            CusNotification.error({
              message: intl
                .get('hzero.common.components.lov.notification.undefined')
                .d('值集视图未定义!'),
            });
          }

          if (isFunction(onClick)) {
            onClick();
          }
          this.hideLoading();
          this.loading = false;
        }
      );
    }
  }

  @Bind()
  onSearchBtnClick(): void {
    const { disabled = false, onClick = (e) => e } = this.props;
    const { firstFlag } = this.state;
    if (disabled || this.loading) return; // 节流
    this.record = null;
    this.loading = true;
    this.showLoading(
      {
        loading: false,
        modalVisible: true,
        lovModalKey: uuid(),
      },
      () => {
        const { lov } = this.state;
        const { viewCode: hasCode } = lov;
        if (!hasCode && !firstFlag) {
          CusNotification.error({
            message: intl
              .get('hzero.common.components.lov.notification.undefined')
              .d('值集视图未定义!'),
          });
        }

        if (isFunction(onClick)) {
          onClick();
        }
        this.hideLoading();
        this.loading = false;
      }
    );
  }

  searchButton(): ReactElement {
    if (this.state.loading) {
      return <img src={searchIcon} alt="searchIcon" />;
    }
    return (
      <img
        src={searchIcon}
        alt="searchIcon"
        onClick={this.onSearchBtnClick as any}
        style={{ cursor: 'pointer', color: '#666' }}
      />
    );
  }

  @Bind()
  emitEmpty() {
    const { text, lov } = this.state;
    const { form, onClear = (e) => e, value, onChange } = this.props;
    if (onChange) {
      const record = {};
      this.setState(
        {
          text: '',
        },
        () => {
          onChange(undefined, record);
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

  render() {
    // const { configureParams } = this.config;
    const { text: stateText, ldpData = {}, topList = [] } = this.state;
    const {
      form,
      value,
      textValue,
      queryParams,
      queryInputProps,
      style,
      isButton,
      isParentButton,
      isInput,
      className,
      isDbc2Sbc,
      mask = true,
      allowClear = true,
      maskClosable = true,
      noCache = true,
      tip,
      description,
      descriptionColor,
      hyperlinks,
      isInitVal = false,
      // showLatestRecord = configureParams?.lovShowLatestRecord || false,
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
      // eslint-disable-next-line no-nested-ternary
      text = isNil(value) ? '' : texts === 0 ? 0 : texts || textValue;
    }
    const inputStyle: React.CSSProperties | undefined = isButton
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
    const {
      title = '',
      width = 400,
      lov = {},
      modalVisible,
      loading,
      lovModalKey,
      lovDataList,
      lovDataPagination,
      lovQueryParam = {},
      firstFlag,
      hasOnlyOne = true,
      autoQueryData,
    } = this.state;
    const modalProps = {
      closable: false,
      title,
      width,
      destroyOnClose: true,
      // wrapClassName: 'lov-modal',
      mask,
      maskClosable,
      onOk: this.selectAndClose,
      // bodyStyle: title ? { padding: '16px 0 16px' } : { padding: '24px 0px 16px' },
      onCancel: this.onCancel,
      style: {
        minWidth: 650,
        maxWidth: 1000,
      },
      visible: modalVisible,
    };
    const { disabled, onChange, placeholder } = this.props;
    const inputProps = {
      disabled,
      onChange,
      placeholder,
      // onClick,
    };
    const buttonProps = ['children', 'mini', 'type', 'size', 'tooltipTitle'];
    return (
      <>
        {isButton ? (
          <CusButton
            onClick={this.onSearchBtnClick as any}
            disabled={this.props.disabled}
            {...pick(otherProps, buttonProps)}
            style={style}
            // className={lovClassNames.join(' ')}
          />
        ) : isParentButton ? (
          this.props?.buttonRender(this.onSearchBtnClick)
        ) : (
          // ts-ignore
          <div className="antd-lov-modal">
            <Input
              readOnly={!isInput}
              // addonAfter={this.searchButton()}
              value={text}
              style={inputStyle} // Lov 组件垂直居中样式，作用于 ant-input-group-wrapper
              suffix={suffix}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                this.setText(e.target.value);
              }}
              {...omit(inputProps, omitProps)}
              className={lovClassNames.join(' ')}
              onClick={this.onSearchBtnClick as any}
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
            onQuery={this.upDateData}
            onFirst={this.onFirst}
            lovLoadLoading={loading}
            wrappedComponentRef={this.modalRef}
            isDbc2Sbc={isDbc2Sbc}
            lovDataList={lovDataList}
            lovDataPagination={lovDataPagination}
            lovQueryParam={lovQueryParam}
            noCache={noCache}
            firstFlag={firstFlag}
            hasOnlyOne={hasOnlyOne}
            autoQueryData={autoQueryData}
            // showLatestRecord={showLatestRecord}
            topList={topList}
            description={description}
            descriptionColor={descriptionColor}
            hyperlinks={hyperlinks}
            isInitVal={isInitVal}
          />
        </Modal>
      </>
    );
  }
}
