import React from 'react';
import {
  Col,
  Form,
  Row,
} from 'antd';
import dayjs from 'dayjs';
import { uniq, uniqBy, isArray, isEmpty, isFunction, pullAllBy } from 'lodash';
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
import { queryLovData } from 'services/api';
import { isUndefined, isString } from 'util';
import Table from '@/components/CusTable';
import CusQueryButtons from '@/components/CusButton/CusQueryButtons';
import CusSelect from '@/components/CusSelect';
import CusLov from '@/components/CusLov';
import Spin from '@/components/CusSpin';
import './index.less';
import CusDatePicker from '@/components/CusDatePicker';
import PanelHeader from '@/components/CusCollapse';
import CusButton from '@/components/CusButton';
import CusInput from '@/components/CusInput';
import CusInputNumber from '@/components/CusInputNumber';

const FormItem = Form.Item;
const defaultRowKey = 'lovId';

class LovModal extends React.Component {
  constructor(props) {
    super(props);
    const { wrappedComponentRef } = props;
    wrappedComponentRef && wrappedComponentRef(this);
    this.state = {
      selectedRows: [],
      list: [],
      treeKeys: [],
      pagination: {},
      loading: false,
      isShowAllSelect: false,
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
  }

  @Bind()
  loadOnFirstVisible() {
    const { delayLoadFlag } = this.props.lov;
    if (this.mounted && !delayLoadFlag) {
      this.queryData({}, true);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  @Bind()
  handleRowClick(record) {
    this.selectRecord(record);
  }

  selectRecord(record) {
    const { selectedRows = [] } = this.state;
    this.props.onSelect(uniq([...selectedRows, record]));
    this.setState({
      selectedRows: uniq([...selectedRows, record]),
    });
  }

  @Bind()
  handleRowDoubleClick(record) {
    this.selectRecord(record);
  }

  hideLoading() {
    this.setState({
      loading: false,
    });
  }

  @Bind()
  queryData(pagination = {}, isInit = false) {
    const filter = this.form?.current?.getFieldsValue() || {};
    const { queryUrl, pageSize, lovCode, lovTypeCode, queryFields = [] } = this.props.lov;
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

    this.setState(
      {
        loading: true,
        isShowAllSelect: false,
      },
      () => {
        queryLovData(url, params)
          .then((res) => {
            if (getResponse(res)) {
              this.dataFilter(res, isInit);
            }
          })
          .then(() => {
            // 还需要将 Lov 的选中数据清空
            // const { onSelect } = this.props;
            // onSelect();
            // this.setState({
            //   selectedRows: [],
            // });
          })
          .finally(() => {
            this.hideLoading();
          });
      }
    );
  }

  @Bind()
  formReset() {
    this.form?.current?.resetFields();
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
  dataFilter(data, isInit) {
    const {
      lov: { valueField: rowkey = defaultRowKey, displayField, childrenFieldName },
      initValue = [],
      preTextValue = [],
      onSelect = (e) => e,
      noCache,
    } = this.props;
    const { selectedRows = [] }  = this.state;
    const isTree = isArray(data);
    const hasParams = !isEmpty(
      Object.values(this.form?.current?.getFieldsValue()).filter((e) => e !== undefined && e !== '')
    );
    let textValue = [];
    if (isArray(preTextValue)) {
      textValue = preTextValue;
    } else if (isString(preTextValue)) {
      textValue = preTextValue.split(',');
    }
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
    const initValueObj = {};
    if (!noCache && isArray(initValue) && isInit) {
      initValue.forEach((item) => {
        initValueObj[item] = item;
      });
      const listFilter = list.filter((item) => !isUndefined(initValueObj[item[rowkey]]));
      // if()
      const listFormat = initValue.map((item, index) => {
        const obj = {};
        obj[displayField] = textValue[index];
        obj[rowkey] = item;
        return obj;
      });
      const newSelectedRows = uniqBy([...listFilter, ...listFormat, ...selectedRows], rowkey);
      onSelect(newSelectedRows);
      this.setState({ selectedRows: newSelectedRows });
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

  /**
   * 选择/取消选择某列的回调
   */
  @Bind()
  onSelectTable(record, selected) {
    const { selectedRows } = this.state;
    const {
      lov: { valueField = defaultRowKey },
      onSelect = (e) => e,
    } = this.props;
    let list = [];
    if (selected) {
      // 选中
      list = [...selectedRows, record];
    } else {
      // 取消选中
      list = selectedRows.filter((item) => item[valueField] !== record[valueField]);
    }
    this.setState({
      selectedRows: list,
    });
    onSelect(list);
  }

  @Bind()
  onSelectAllTable(selected, newselectedRows, changeRows) {
    const {
      lov: { valueField = defaultRowKey },
      onSelect = (e) => e,
    } = this.props;
    const { selectedRows } = this.state;
    let list = [];
    if (selected) {
      list = uniqBy([...selectedRows, ...changeRows], valueField);
    } else {
      list = pullAllBy(selectedRows, changeRows, valueField);
    }
    this.setState({
      selectedRows: list,
    });
    onSelect(list);
  }

  @Bind
  toggleForm() {
    const { expandFlag } = this.state;
    this.setState({
      expandFlag: !expandFlag,
    });
  }

  handleShowAllSelect = () => {
    const { selectedRows = [] } = this.state;
    this.setState({
      list: [...selectedRows],
      pagination: {
        current: 1,
        pageSize: 10,
        total: selectedRows?.length,
      },
      isShowAllSelect: true,
    })
  }

  handleClearChecked = () => {
    const { onSelect } = this.props;
    this.setState({
      selectedRows: [],
    }, () => {
      onSelect([]);
      this.queryData();
    });
  }

  render() {
    const {
      lov: { valueField: rowkey = defaultRowKey, tableFields = [], queryFields = [] },
      ldpData = {},
      lovLoadLoading,
      width,
      queryInputProps = {},
      isDbc2Sbc = false,
      showCheckedButtons = false, // 是否有勾选按钮
      tableTitle = '', // 表格标题
    } = this.props;
    const { getFieldValue, setFieldsValue } = this.form?.current || {};
    if (lovLoadLoading) {
      return <div />;
    };
    const { list = [], selectedRows, loading, pagination, treeKeys, expandFlag, isShowAllSelect = false } = this.state;
    const isTree = isArray(list);
    const rowSelection = {
      type: 'checkbox',
      selectedRowKeys: selectedRows.map((n) => this.parseField(n, rowkey)),

      // onChange: this.onSelectChange,
      onSelect: this.onSelectTable,
      onSelectAll: this.onSelectAllTable,
    };
    const tableProps = {
      // loading,
      rowSelection,
      pagination,
      dataSource: list,
      columns: tableFields.map((item) => {
        const { dataType, ...rest } = item;
        return dataType === 'SWITCH'
          ? {
            ...rest,
            render: yesOrNoRender,
            ellipsis: true,
          }
          : item.dataType === 'AMOUNT'
            ? {
              ...rest,
              ellipsis: true,
              render: (text) =>
                <div style={{ textAlign: 'right' }}>
                  {numberRender(text, 2)}
                </div>,
            }
            : item.dataType === 'DATE'
              ? {
                ...rest,
                ellipsis: true,
                render: dateRender,
              }
              : { ...rest, ellipsis: true };
      }),
      scroll: { x: tableScrollWidth(tableFields) },
      onRow: (record, index) => ({
        onDoubleClick: () => this.handleRowDoubleClick(record, index),
        onClick: () => this.handleRowClick(record, index),
      }),
      onChange: !isShowAllSelect && this.queryData,
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
      <Spin spinning={loading}>
        <div className='customize-form'>
          <Form ref={this.form}>
            {queryFields.length > 0 ? (
              <Row>
                {queryInput.map((item, index) => {
                  if (index < 4) {
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
                    isShowMoreButton={queryInput.length > 4}
                  />
                </Col>
              </Row>
            ) : null}
          </Form>
        </div>
        <div style={{ marginBottom: `${queryFields.length > 0 ? 20 : 16}px` }} />
        {showCheckedButtons && (
          <>
            <hr
              style={{ border: 'none', borderBottom: '1px solid #DEE0E3', margin: 0 }}
            />
            <PanelHeader
              showArrow={false}
              title={tableTitle}
              verticalLine={!!tableTitle}
              buttons={(
                <>
                  <CusButton
                    mini
                    onClick={this.handleClearChecked}
                  >
                    {intl.get(`hzero.common.button.clearChecked`).d('清除已勾选')}
                  </CusButton>
                  <CusButton
                    mini
                    type="primary"
                    onClick={this.handleShowAllSelect}
                  >
                    {intl.get('hzero.common.button.showChecked').d('显示已勾选')}
                  </CusButton>
                </>
              )}
            />
          </>
        )}
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
