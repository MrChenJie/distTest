/**
 * 单据权限配置 - index
 *
 * @date    2023-03-23
 * @author  陈深星 <chen.shenxing@hand-china.com>
 */
import uuid from 'uuid/v4';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import moment from 'moment';
import { Form, Input, Select, Collapse, TreeSelect } from 'antd';
import { Icon } from 'hzero-ui';
import dayjs from 'dayjs';
import CusLov from '_cus_components/CusLov';
import CusButton from '_cus_components/CusButton';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusNotification from '_cus_components/CusNotification';
import CusInput from '_cus_components/CusInput';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import SearchForm from './SearchForm';
import DataTable from './DataTable';

import './index.less';

const promptKey = 'spub.docPermissionConfig';
const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['hzero.common', promptKey, 'spub.docPermissionConfig.paymentRequest'],
})
@connect(({ docPermissionConfig, loading }) => ({
  docPermissionConfig,
  loadingQueryList: loading.effects['docPermissionConfig/queryList'],
  loadingbatchUpdate: loading.effects['docPermissionConfig/batchUpdate'],
  loadingQueryLovList: loading.effects['docPermissionConfig/queryLovList'],
  loadingQueryLovData: loading.effects['docPermissionConfig/queryLovData'],
}))
export default class DocPermissionConfig extends Component {
  formRef = React.createRef();

  state = {
    count: 0,
    dynamicColumns: [],
    activeKey: ['form', 'table'],
  };

  /**
   * 数据库字段转驼峰
   * @param {String} source
   * @returns
   */
  transToLowCamel(source = '') {
    return source
      .toLowerCase()
      .replace(/([^_])(?:_+([^_]))/g, ($0, $1, $2) => $1 + $2.toUpperCase());
  }

  /**
   * 值集转换
   * @param {Array} code          值集列表
   * @param {String} params       需转换值
   * @param {String} valueField   值字段
   * @param {String} displayField 描述字段
   */
  getFastCode(code = [], value = '', valueField = 'value', displayField = 'meaning') {
    let result;
    if (!Array.isArray(code)) {
      return value;
    }
    if (value && !isEmpty(code)) {
      const codeList = code.filter((n) => n[valueField] === value);
      if (!isEmpty(codeList)) {
        result = codeList[0][displayField];
      }
    }
    return result || value;
  }

  /**
   * 获取显示值（值集会进行转译）
   * @param {String} val    字段值
   * @param {Object} field  映射字段对象
   * @param {Object} record 数据行对象
   * @returns
   */
  @Bind()
  getVal(val, field = {}, record = {}) {
    const { unitList = [] } = this.props.docPermissionConfig;

    // LOV
    if (field.value.includes('LOV_FIELD')) {
      const [valueField, displayField] = field.tag.split('|');
      // 值集数据集
      const dataList = this.props.docPermissionConfig[`${field.description}`];
      // 匹配到的值集数据（数字转字符串匹配`${}`）
      const lovData = ((dataList || []).filter((item) => `${item[`${valueField}`]}` === `${val}`) ||
        [])[0];
      return !isEmpty(lovData) ? lovData[`${displayField}`] : val;
    }

    // 独立值集
    if (field.value.includes('LOOK_UP_CODE_FIELD')) {
      const [valueField, displayField] = field.tag.split('|');
      const dataList = this.props.docPermissionConfig[field.description];
      return this.getFastCode(dataList, val, valueField, displayField);
    }

    // 部门：特殊组件（树形框）
    if (field.value.includes('TEXT_FIELD1') && field.description.includes('UNIT')) {
      const unitCodeArr = val?.split(',');
      const unitNameArr = (unitCodeArr || []).map((unitCode) => {
        return unitList.find((unit) => unit?.unitCode === unitCode)?.unitName;
      });
      return (unitNameArr || []).join(',');
    }

    return val;
  }

  /**
   * 行数据更新
   * @param {String} fieldName
   * @param {String} value
   */
  handleUpdate = (fieldName, value = undefined) => {
    const docType = this.props?.match?.params?.docType;
    const dataList = this.props.docPermissionConfig[`${docType}-configList`];

    // [0] 数据编号
    // [1] 字段名称
    const [id, name] = fieldName.split('#');
    this.handleUpdateState({
      [`${docType}-configList`]: dataList.map((item) => {
        const temp = item || {};
        if (item.tempId === id) {
          temp[name] = value;
          return temp;
        }
        return temp;
      }),
    });
  };

  /**
   * 获取表单初始值
   * @param {String} val    字段值
   * @param {Object} field 映射字段对象
   * @param {Object} record 数据行对象
   * @returns
   */
  getInitialValue(val, field = {}, record = {}) {
    // 部门：特殊组件（树形框）
    if (field.value.includes('TEXT_FIELD1') && field.description.includes('UNIT')) {
      return val?.split(',');
    }
    return val;
  }

  /**
   * 获取字段组件
   * @param {String} val 字段值
   * @param {Object} field 映射字段对象
   * @param {Object} record 数据行对象
   * @returns
   */
  @Bind()
  getFieldComponent(val, field = {}, record = {}) {
    const { unitTreeList = [] } = this.props.docPermissionConfig;

    const fieldName = this.transToLowCamel(field.value);

    // LOV
    if (field.value.includes('LOV_FIELD')) {
      const [valueField, displayField] = field.tag.split('|');
      return (
        <CusLov
          style={{ minWidth: 120 }}
          code={field.description}
          textValue={this.getVal(val, field, record)}
          lovOptions={{
            valueField,
            displayField,
          }}
          onChange={(val, data) => {
            this.handleUpdate(`${record.tempId}#${fieldName}`, data[`${valueField}`]);
          }}
        />
      );
    }

    // 独立值集
    if (field.value.includes('LOOK_UP_CODE_FIELD')) {
      const [valueField, displayField] = field.tag.split('|');
      const dataList = this.props.docPermissionConfig[field.description];
      return (
        <Select
          popupClassName="customize-select"
          onChange={(val, data) => {
            this.handleUpdate(`${record.tempId}#${fieldName}`, data[`${valueField}`]);
          }}
        >
          {dataList.map((item) => {
            return (
              <Select.Option key={item[valueField]} value={item[valueField]}>
                {item[displayField]}
              </Select.Option>
            );
          })}
        </Select>
      );
    }

    // todo：日期
    // todo：时间

    // 部门：特殊组件（树形框）
    if (field.value.includes('TEXT_FIELD1') && field.description.includes('UNIT')) {
      return (
        <TreeSelect
          allowClear
          dropdownMatchSelectWidth={false}
          multiple
          treeCheckable
          treeData={unitTreeList}
          style={{ width: '100%' }}
          maxTagCount={3}
          showCheckedStrategy={TreeSelect.SHOW_PARENT}
          filterTreeNode={(inputValue, treeNode) => {
            return treeNode.props.title?.includes(inputValue);
          }}
          onChange={(val = [], data) => {
            this.handleUpdate(`${record.tempId}#${fieldName}`, val.join(','));
          }}
          dropdownStyle={{ maxHeight: '300px' }}
          // treeDefaultExpandedKeys={}
        />
      );
    }

    // 备注 （富文本）
    if (field.value.includes('TEXT_FIELD2')) {
      return (
        <CusInput.TextArea
          autoChangeSize
          onChange={(e) => {
            this.handleUpdate(`${record.tempId}#${fieldName}`, e?.target?.value);
          }}
        />
      );
    }

    // 其他
    return <Input />;
  }

  /**
   * 查询列表
   * @param {Object} filterData 查询参数
   * @param {Object} pagination 分页对象（默认为当前页，每页10行；）
   * @param {Object} others     灵活参数
   */
  @Bind()
  handleSearch(filterData = {}, pagination = { page: 0, size: 10 }, others = {}) {
    const docType = this.props?.match?.params?.docType;
    this.props.dispatch({
      type: 'docPermissionConfig/queryList',
      payload: {
        ...filterData,
        ...pagination,
        ...others,
        docType, // 默认都要带上单据类型查询条件
        effectiveDateFrom: dayjs.isDayjs(filterData.effectiveDateFrom)
          ? `${filterData.effectiveDateFrom.format(DEFAULT_DATE_FORMAT)} 00:00:00`
          : undefined,
        effectiveDateTo: dayjs.isDayjs(filterData.effectiveDateTo)
          ? `${filterData.effectiveDateTo.format(DEFAULT_DATE_FORMAT)} 00:00:00`
          : undefined,
        creationDateFrom: dayjs.isDayjs(filterData.creationDateFrom)
          ? `${filterData.creationDateFrom.format(DEFAULT_DATE_FORMAT)} 00:00:00`
          : undefined,
        creationDateTo: dayjs.isDayjs(filterData.creationDateTo)
          ? `${filterData.creationDateTo.format(DEFAULT_DATE_FORMAT)} 00:00:00`
          : undefined,
      },
    });
    this.handleUpdateState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  }

  /**
   * 更新状态
   * @param {Object} newState 新状态对象
   */
  @Bind()
  handleUpdateState(newState = {}) {
    this.props.dispatch({
      type: 'docPermissionConfig/updateState',
      payload: newState,
    });
  }

  /**
   * 跳转通用导入页面
   */
  goToBatchImport() {
    const docType = this.props?.match?.params?.docType;
    const { history, location } = this.props;
    history.push(`${location?.pathname}/batch-import`);
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const docType = this.props?.match?.params?.docType;
    const {
      selectedRows,
      selectedRowKeys,
      [`${docType}-configList`]: dataSource = [],
    } = this.props.docPermissionConfig;

    const deleteList = selectedRows.filter((item) => item._status !== 'create');
    if (isEmpty(deleteList)) {
      // 仅删除未保存的数据，从model中去掉；
      this.handleUpdateState({
        [`${docType}-configList`]: dataSource.filter(
          (item) => !selectedRowKeys.includes(item.tempId)
        ),
      });
    } else {
      // 删除数据中存在已保存的删除，走接口删除，查询刷新即可；
      this.props
        .dispatch({
          type: 'docPermissionConfig/batchDelete',
          payload: selectedRows.filter((item) => item._status !== 'create'),
        })
        .then((res) => {
          this.handleSearch();
        });
    }
  }

  /**
   * 新增
   */
  @Bind()
  handleCreate() {
    const docType = this.props?.match?.params?.docType;
    const dataList = this.props.docPermissionConfig[`${docType}-configList`];
    this.handleUpdateState({
      [`${docType}-configList`]: [
        {
          _status: 'create',
          tempId: uuid(),
          docType,
          tenantId: organizationId,
          effectiveDateFrom: moment(new Date()).format(`${DEFAULT_DATE_FORMAT} 00:00:00`),
        },
        ...dataList,
      ],
    });
  }

  componentDidMount() {
    const docType = this.props?.match?.params?.docType;

    // 查询部门数据
    this.props.dispatch({
      type: 'docPermissionConfig/queryUnitList',
    });

    if (!isEmpty(docType)) {
      this.handleSearch();
      this.props
        .dispatch({
          type: 'docPermissionConfig/queryLovList',
          payload: {
            docTypeList: 'SPUB.DOC_PER_DOC_TYPE',
            authorizedList:
              docType !== 'COST_PAYMENT'
                ? 'SPCM.INVOICE_QUERY_AUTHORITY'
                : 'SPCM.PAYMENT_REUQEST_ASSIGNMENT_AUTHORITY',
          },
        })
        .then((res) => {
          // 字段映射关系值集编码（标记字段）
          const mappingLovCode = (res.docTypeList || []).filter((item) => item.value === docType)[0]
            .tag;
          return this.props.dispatch({
            type: 'docPermissionConfig/queryLovList',
            payload: {
              [`${docType}-mappingList`]: mappingLovCode,
            },
          });
        })
        .then((res) => {
          if (res) {
            /* 获取独立值集的数据集（转set再转list去重） */
            const lovCodeMap = {};
            const lovCodeList = Array.from(
              new Set(
                res[`${docType}-mappingList`]
                  .filter((item) => item.value.includes('LOOK_UP_CODE_FIELD'))
                  .map((item) => {
                    return item.description;
                  })
              )
            );
            lovCodeList.forEach((code) => {
              lovCodeMap[`${code}`] = code;
            });
            this.props.dispatch({
              type: 'docPermissionConfig/queryLovList',
              payload: lovCodeMap,
            });

            /* 获取lov类型的数据集 */
            Promise.all(
              res[`${docType}-mappingList`]
                .filter((item) => item.value.includes('LOV_FIELD'))
                .map((item) => {
                  return this.props.dispatch({
                    type: 'docPermissionConfig/queryLovData',
                    payload: {
                      lovCode: item.description,
                    },
                  });
                })
            ).then((lovDataList) => {
              if (!isEmpty(lovDataList)) {
                (lovDataList || []).forEach((item) => {
                  this.handleUpdateState({
                    [`${Reflect.ownKeys(item)[0]}`]: item[`${Reflect.ownKeys(item)[0]}`],
                  });
                });
              }
              // 设置动态列
              this.setState({
                dynamicColumns: res[`${docType}-mappingList`].map((item) => {
                  const fieldName = this.transToLowCamel(item.value);
                  return {
                    width: [
                      'SPCM.INVOICE_QUERY_BUSINESS_TYPE',
                      'COST_PAYMENT_FIELD_TYPE',
                      'SPRM.USER_UNIT',
                    ].includes(item.description)
                      ? 200
                      : 300,
                    title: item.meaning,
                    orderSeq: item.orderSeq,
                    required: [
                      'UNIT',
                      'COST_PAYMENT_FIELD_TYPE',
                      'AP_FIELD_OU',
                      'SPCM.INVOICE_QUERY_BUSINESS_TYPE',
                    ].includes(item.description),
                    ellipsis: true,
                    dataIndex: fieldName,
                    render: (val, record) =>
                      ['create', 'update'].includes(record._status) ? (
                        <Form.Item
                          name={`${record.tempId}#${fieldName}`}
                          initialValue={this.getInitialValue(val, item, record)}
                        >
                          {this.getFieldComponent(val, item, record)}
                        </Form.Item>
                      ) : (
                        this.getVal(val, item, record)
                      ),
                  };
                }),
              });
            });

            this.props.dispatch({
              type: 'docPermissionConfig/updateState',
              payload: {
                [`${docType}-mappingList`]: (res[`${docType}-mappingList`] || []).map((item) => {
                  return {
                    ...item,
                    // 数据库字段转驼峰
                    fieldName: this.transToLowCamel(item.value),
                  };
                }),
              },
            });
          }
        });
    }
  }

  /**
   * @name: 操作 - 复制
   */
  handleCopy = () => {
    const { selectedRows } = this.props.docPermissionConfig;
    const docType = this.props?.match?.params?.docType;
    const dataList = this.props.docPermissionConfig[`${docType}-configList`];
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      return;
    }
    if (selectedRows.length > 1) {
      CusNotification.error({
        message: intl
          .get(`spub.docPermissionConfig.view.query.only-one-copy`)
          .d('仅能选择一项记录进行复制'),
      });
      return;
    }
    const { _status, textField1, lookUpCodeField1, textField2 } = selectedRows[0];
    if (['create'].includes(_status)) {
      CusNotification.error({
        message: intl
          .get(`spub.docPermissionConfig.view.query.copy-save`)
          .d('请保存当前记录后再复制'),
      });
      return;
    }

    this.handleUpdateState({
      [`${docType}-configList`]: [
        {
          _status: 'create',
          tempId: uuid(),
          docType,
          tenantId: organizationId,
          effectiveDateFrom: moment(new Date()).format(`${DEFAULT_DATE_FORMAT} 00:00:00`),
          textField1,
          lookUpCodeField1,
          textField2,
        },
        ...dataList,
      ],
    });
  };

  render() {
    const docType = this.props?.match?.params?.docType;

    const { activeKey, dynamicColumns = [] } = this.state;
    const {
      loadingQueryList = false,
      loadingbatchUpdate = false,
      loadingQueryLovList = false,
      loadingQueryLovData = false,
      docPermissionConfig,
    } = this.props;
    const {
      filterData,
      unitList = [],
      unitTreeList = [],
      authorizedList = [],
    } = docPermissionConfig;
    const loading =
      loadingQueryList || loadingbatchUpdate || loadingQueryLovList || loadingQueryLovData;

    // 权限判断（不控制管理员）
    if (
      !isEmpty(authorizedList) &&
      ![...authorizedList, { meaning: 'admin' }].some(
        (item) => item.meaning === getCurrentUser()?.loginName
      )
    ) {
      window.location.href = `${process.env.CMI_HOST}/403.html`;
      return (
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#BDBDBD' }}>
          {/* <Icon type="frown-o" style={{ fontSize: '100px' }} />
          <p style={{ fontSize: '20px', marginTop: '1em' }}>
            {intl.get(`${promptKey}.noPermission`).d('暂无查看权限，请授权后重试')}
          </p> */}
        </div>
      );
    } else {
      return (
        <div className={['customize-form']}>
          <Form ref={this.formRef}>
            <PageWrapper loading={loading}>
              <Collapse
                className="customize-collapse"
                defaultActiveKey={activeKey}
                onChange={(collapseKeys) => {
                  this.setState({ activeKey: collapseKeys });
                }}
              >
                {/* 查询区域 */}
                <Collapse.Panel
                  showArrow={false}
                  header={
                    <PanelHeader
                      title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
                      arrowActive={activeKey.includes('form')}
                    />
                  }
                  key="form"
                >
                  {dynamicColumns.length > 0 && <SearchForm parent={this} {...this.props} />}
                </Collapse.Panel>
                {/* 表格区域 */}
                <Collapse.Panel
                  showArrow={false}
                  collapsible="disabled"
                  header={
                    <PanelHeader
                      showArrow={false}
                      title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                      buttons={
                        <>
                          {docType !== 'COST_PAYMENT' && (
                            <CusButton onClick={() => this.goToBatchImport()} mini>
                              {intl.get('hzero.common.button.batchImport').d('批量导入')}
                            </CusButton>
                          )}
                          <CusExcelExport
                            className="customize-button customize-button-primary"
                            downloadType="Blob"
                            fileName={
                              docType === 'AP'
                                ? intl
                                    .get('spub.docPermissionConfig.excel.title')
                                    .d('应付发票权限配置信息导出')
                                : docType === 'COST_PAYMENT'
                                ? intl
                                    .get('spub.docPermissionConfig.paymentRequest.excel.title')
                                    .d('付款申请权限配置信息导出')
                                : 'exportData'
                            }
                            requestUrl={`/spub/v1/${organizationId}/doc-permission-configs/export/${docType
                              ?.replace(/_/g, '-')
                              ?.toLowerCase()}`}
                            otherButtonProps={{
                              icon: null,
                              mini: true,
                            }}
                            buttonText={intl.get('hzero.common.button.export').d('导出')}
                            queryParams={filterData}
                          />
                          <CusButton onClick={() => this.handleDelete()} mini>
                            {intl.get('hzero.common.button.delete').d('删除')}
                          </CusButton>
                          {docType === 'COST_PAYMENT' && (
                            <CusButton mini onClick={this.handleCopy}>
                              {intl.get('hzero.common.button.copy').d('复制')}
                            </CusButton>
                          )}
                          <CusButton type="primary" onClick={() => this.handleCreate()} mini>
                            {intl.get('hzero.common.button.create').d('新建')}
                          </CusButton>
                        </>
                      }
                      arrowActive={activeKey.includes('table')}
                    />
                  }
                  key="table"
                >
                  {dynamicColumns.length > 0 && <DataTable parent={this} {...this.props} />}
                </Collapse.Panel>
              </Collapse>
            </PageWrapper>
          </Form>
        </div>
      );
    }
  }
}
