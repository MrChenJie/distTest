import React from 'react';
import {
  Col,
  Form,
  Row,
} from 'antd';
import dayjs from 'dayjs';
import { isArray, isEmpty, isFunction, isUndefined } from 'lodash';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import {
  createPagination,
  getCurrentOrganizationId,
  getDateFormat,
  getDateTimeFormat,
  tableScrollWidth,
} from 'utils/utils';
import { getResponse } from '@/utils/utils';
import {
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import { yesOrNoRender, numberRender, dateRender } from 'utils/renderer';
import './index.less';
import { queryLovData } from 'services/api';
import Table from '_cus_components/CusTable';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import Spin from '_cus_components/CusSpin';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import CusInputNumber from '_cus_components/CusInputNumber';

const FormItem = Form.Item;
const defaultRowKey = 'lovId';

class LovModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      list: [],
      treeKeys: [],
      pagination: {},
      loading: false,
      tagLoading: false,
    };
  }

  form = React.createRef();

  setSateData(state) {
    if (this.mounted) {
      this.setState(state);
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.loadOnFirstVisible();
  }

  @Bind()
  loadOnFirstVisible() {
    const {
      lov: { delayLoadFlag, queryFields = [] },
      lovDataList,
      lovDataPagination,
      lovQueryParam = {},
      noCache,
      firstFlag,
      onFirst = (e) => e,
      hasOnlyOne,
      autoQueryData = {},
    } = this.props;
    const { setFieldsValue, resetFields } = this.form?.current || {};
    if (hasOnlyOne) {
      if (this.mounted && !delayLoadFlag && noCache) {
        onFirst(this.queryData);
      } else if (this.mounted && !noCache) {
        if (firstFlag && !delayLoadFlag) {
          onFirst(this.queryData);
        } else {
          this.setSateData({
            list: lovDataList,
            pagination: lovDataPagination,
          });
          const obj = {};
          queryFields.forEach((queryItem) => {
            obj[queryItem.field] = lovQueryParam[queryItem.field];
          });
          setFieldsValue(obj);
        }
      }
    } else {
      resetFields();
      this.dataFilter(autoQueryData);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    // TODO: 支持多选
    const record = selectedRows[0];
    this.props.onSelect(record);
    this.setState({
      selectedRows: [record],
    });
  }

  @Bind()
  handleRowClick(record) {
    this.selectRecord(record);
  }

  selectRecord(record) {
    this.props.onSelect(record);
    this.setState({
      selectedRows: [record],
    });
  }

  @Bind()
  handleRowDoubleClick(record) {
    this.selectRecord(record);
    this.props.onClose();
  }

  hideLoading() {
    this.setState({
      loading: false,
    });
  }

  @Bind()
  queryData(pagination = {}, cb = (e) => e) {
    // const filter = this.props.form.getFieldsValue();
    const filter = this.form?.current?.getFieldsValue() || {};
    const {
      queryUrl = '',
      pageSize,
      lovCode,
      lovTypeCode,
      requestMethod = '',
      queryFields = [],
    } = this.props.lov;
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

    const formatFilter = { ...filter };
    queryFields.forEach((item) => {
      if (item.dataType === 'DATE' || item.dataType === 'DATETIME') {
        if (filter[item.field]) {
          formatFilter[item.field] = dayjs(filter[item.field]).format(
            item.dataType === 'DATETIME' ? DEFAULT_DATETIME_FORMAT : DEFAULT_DATE_FORMAT
          );
        }
      }
    });
    const sourceParams = {
      ...formatFilter,
      page: pagination.current - 1 || 0,
      size: pagination.pageSize || pageSize,
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
            if (getResponse(res)) {
              this.dataFilter(res, formatFilter);
              if (typeof cb === 'function') {
                cb();
              }
            }
            return res;
          })
          .then((r) => {
            const { onSelect } = this.props;
            if (r.content?.length === 1 || r.length === 1) {
              const selectRows = r.content || r;
              this.onSelectChange('', selectRows);
            } else {
              // 还需要将 Lov 的选中数据清空
              onSelect();
              this.setState({
                selectedRows: [],
              });
            }
          })
          .finally(() => {
            this.hideLoading();
          });
      }
    );
  }

  @Bind()
  formReset() {
    // const { configureParams } = getEnvConfig();
    // const lovResetQuery = configureParams?.lovResetQuery || false;
    this.form?.current?.resetFields();
    // if (lovResetQuery) {
    //   this.queryData();
    // }
  }

  /**
   * 树 child 属性更改
   * @param {Array} list 原树结构数据
   * @param {String} childName 要替换的 childName
   */
  @Bind()
  setChildren = (data, childName) =>
    childName
      ? data.map((n) => {
          const item = n;
          if (!isEmpty(n[childName])) {
            this.defineProperty(item, 'children', [{ ...n[childName] }]);
          }
          if (!isEmpty(item.children)) {
            item.children = this.setChildren(item.children);
          }
          return item;
        })
      : data;

  /**
   * 处理返回列表数据
   * @param {Object|Array} data - 返回的列表数据
   */
  @Bind()
  dataFilter(data, formatFilter) {
    const {
      lov: { valueField: rowkey = defaultRowKey, childrenFieldName },
      onQuery = (e) => e,
      noCache,
    } = this.props;
    const isTree = isArray(data);
    const hasParams = !isEmpty(
      Object.values(this.form?.current?.getFieldsValue())?.filter((e) => e !== undefined && e !== '')
    );
    const list = isTree ? this.setChildren(data, childrenFieldName) : data.content;
    const pagination = !isTree && createPagination(data);

    const treeKeys = []; // 树状 key 列表
    if (isTree && hasParams) {
      /**
       * 遍历生成树列表
       * @param {*} treeList - 树列表数据
       */
      const flatKeys = (treeList) => {
        if (isArray(treeList.children) && !isEmpty(treeList.children)) {
          treeKeys.push(treeList[rowkey]);
          treeList.children.forEach((item) => flatKeys(item));
        } else {
          treeKeys.push(treeList[rowkey]);
        }
      };

      list.forEach((item) => flatKeys(item)); // 遍历生成 key 列表
    }

    if (!noCache) {
      onQuery(list, pagination, formatFilter);
    }

    this.setSateData({
      list,
      treeKeys,
      pagination,
    });
  }

  @Bind()
  defineProperty(obj, property, value) {
    Object.defineProperty(obj, property, {
      value,
      writable: true,
      enumerable: false,
      configurable: true,
    });
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

  @Bind
  toggleForm() {
    const { expandFlag } = this.state;
    this.setState({
      expandFlag: !expandFlag,
    });
  }

  @Bind
  formatTableFields(tableFields){
    return tableFields.map((item) => {
      const { dataType, ...rest } = item;
      let updatedItem = { ...rest, ellipsis: true };

      switch (dataType) {
        case 'SWITCH':
          updatedItem.render = yesOrNoRender;
          break;
        case 'AMOUNT':
          updatedItem.render = (text) => (
            <div style={{ textAlign: 'right' }}>{numberRender(text, 2)}</div>
          );
          break;
        case 'DATE':
          updatedItem.render = dateRender;
          break;
        case 'RIGHT':
          updatedItem.render = (text) => (
            <div style={{ textAlign: 'right' }}>{text}</div>
          );
          break;
        default:
          break;
      }

      return updatedItem;
    });
  }

  render() {
    const {
      lov: {
        valueField: rowkey = defaultRowKey,
        // displayField,
        tableFields = [],
        queryFields = [],
        height,
      },
      ldpData = {},
      lovLoadLoading,
      width,
      queryInputProps = {},
      isDbc2Sbc = false,
      description,
      descriptionColor = '#1f2329',
    } = this.props;
    const { getFieldValue, setFieldsValue } = this.form?.current || {};
    if (lovLoadLoading) {
      return <div />;
    };
    const { list = [], selectedRows, loading, pagination, treeKeys, expandFlag } = this.state;
    const isTree = isArray(list);
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: selectedRows.map((n) => this.parseField(n, rowkey)),
      onChange: this.onSelectChange,
    };
    const tableProps = {
      // loading,
      rowSelection,
      pagination,
      dataSource: list,
      columns: this.formatTableFields(tableFields),
      scroll: {
        x: tableScrollWidth(tableFields),
        // eslint-disable-next-line no-nested-ternary
        // y: isUndefined(height) ? 'calc(100vh - 401px)' : height > 498 ? height - 98 : 400,
      },
      bodyStyle: {
        // eslint-disable-next-line no-nested-ternary
        maxHeight: isUndefined(height) ? 'calc(100vh - 280px)' : height > 498 ? height - 98 : 400,
      },
      onRow: (record, index) => ({
        onDoubleClick: () => this.handleRowDoubleClick(record, index),
        onClick: () => this.handleRowClick(record, index),
      }),
      onChange: this.queryData,
    };
    const treeProps = isTree
      ? {
          uncontrolled: true,
          expandedRowKeys: treeKeys,
        }
      : {};

    // 查询条件表单
    const span = 12;
    const formItemLayout = {
      wrapperCol: { span: 24 }
    };
    let queryInput = queryFields.map((queryItem = {}) => {
      const valueListData = ldpData[queryItem.sourceCode] || [];
      switch (queryItem.dataType) {
        case 'INT':
        case 'AMOUNT':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label} name={queryItem.field}>
                <CusInputNumber
                  style={{ width: '100%' }}
                  parser={(input = '') => {
                    let val = input.replace(new RegExp(`[^0-9.]+`, 'g'), '');
                    const value = val.split('.');
                    if (value.length > 2) {
                      val = `${value.shift()}.${value.join('')}`;
                    }
                    const isNegative = /^-/.test(input);
                    if (isNegative) {
                      val = `-${val}`;
                    }
                    return val;
                  }}
                  onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                      e.preventDefault();
                      e.stopPropagation();
                      const value = getFieldValue(queryItem.field);
                      if (
                        value &&
                        (value.toString().indexOf('.') === value.toString().length - 1 ||
                          value.toString().indexOf('-') === value.toString().length - 1)
                      ) {
                        setFieldsValue({ [queryItem.field]: '' });
                      }
                      this.queryData();
                    }
                  }}
                />
              </FormItem>
            </Col>
          );
        case 'DATE':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label} name={queryItem.field}>
                <CusDatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateFormat()}
                />
              </FormItem>
            </Col>
          );
        case 'DATETIME':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label} name={queryItem.field}>
                <CusDatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  showTime={{ format: DEFAULT_DATETIME_FORMAT }}
                  format={getDateTimeFormat()}
                />
              </FormItem>
            </Col>
          );
        case 'SELECT':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label} name={queryItem.field}>
                <CusSelect
                  popupClassName="customize-select"
                  allowClear style={{ width: '100%' }}
                  options={valueListData}
                />
              </FormItem>
            </Col>
          );
        case 'LOV_CODE':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label} name={queryItem.field}>
                <CusLov code={`${queryItem.sourceCode}`} />
              </FormItem>
            </Col>
          );
        default:
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label} name={queryItem.field}>
                <CusInput dbc2sbc={isDbc2Sbc ? isDbc2Sbc : undefined} {...queryInputProps} />
              </FormItem>
            </Col>
          );
      }
    });

    return (
      <Spin spinning={this.state.tagLoading || loading}>
        {description && (
          <div style={{ fontSize: '14px', marginBottom: '16px', color: descriptionColor }}>
            {description}
          </div>
        )}
        <div className='customize-form'>
          <Form ref={this.form}>
            {queryFields.length > 0 ? (
              <Row>
                {queryInput.map((item, index) => {
                  if (index < 3) {
                    return item;
                  } else {
                    return (
                      <div style={{ display: expandFlag ? 'block' : 'none' }}>
                        {item}
                      </div>
                    )
                  }
                })}
                <Col span={12} style={{ float: 'right' }}>
                  <CusQueryButtons
                    onQuery={this.queryData}
                    onReset={this.formReset}
                    onShowMore={this.toggleForm}
                    isShowMore={expandFlag}
                    isShowMoreButton={queryInput.length > 3}
                  />
                </Col>
              </Row>
            ) : null}
          </Form>
        </div>
        <div style={{ marginBottom: `${queryFields.length > 0 ? 20 : 16}px` }} />
        <Table
          rowKey={(record) => this.parseField(record, rowkey)}
          paddingLeft={0}
          {...tableProps}
          // {...treeProps}
        />
      </Spin>
    );
  }
}

export default LovModal;
