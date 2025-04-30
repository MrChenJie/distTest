/*
 * PurchaseOrderSearch - 采购订单查询
 * @date: 2020/10/15 20:00
 * @author: lly <liyuan.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { DataSet } from 'choerodon-ui/pro';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

export default () => ({
  autoQuery: false,
  pageSize: 10,
  selection: 'multiple',
  autoLocateFirst: false,
  transport: {
    read: (config) => ({
      url: `${SRM_SPUC}/v1/${organizationId}/po-headerss/queryHeaderList`,
      method: 'GET',
      ...config,
    }),
    destroy: (config) => ({
      url: `${SRM_SPUC}/v1/${organizationId}/po-headerss/delete/excel/poheaders`,
      method: 'POST',
      ...config,
    }),
  },
  events: {
    query: ({ dataSet }) => {
      const { queryDataSet } = dataSet;
      const { current } = queryDataSet;
      current.save();
      return true;
    },
  },
  fields: [
    {
      name: 'poNumber',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.poNumber').d('采购订单编号'),
    },
    {
      name: 'priceEntryNum',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.priceEntryNum').d('报价单号'),
    },
    {
      name: 'poStatusMeaning',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.poStatus').d('采购订单状态'),
      readOnly: 'true',
    },
    {
      name: 'cmiEntityMeaning',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.cmiEntity').d('采购签约主体'),
      readOnly: 'true',
    },
    {
      name: 'requireCode',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.requireCode').d('销售需求单号'),
      readOnly: 'true',
    },
    {
      name: 'originalRequireCode',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.originalRequireCode').d('原始需求单号'),
      readOnly: 'true',
    },
    {
      name: 'circuitNumber',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.circuitNumber').d('客户电路编号'),
      readOnly: 'true',
    },
    {
      name: 'supplierCode',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.supplierCode').d('供应商编号'),
      readOnly: 'true',
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.supplierName').d('供应商名称'),
      readOnly: 'true',
    },
    {
      name: 'vendorNum',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.vendorNum').d('供应商编码'),
      readOnly: 'true',
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.currency').d('币种'),
      readOnly: true,
    },
    {
      name: 'creatorMeaning',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.creator').d('承办人'),
      readOnly: 'true',
    },
    {
      name: 'userDepartmentMeaning',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.userDepartment').d('承办部门'),
      readOnly: 'true',
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sodr.purchase.view.message.creationDate').d('创建日期'),
      readOnly: 'true',
    },
  ],
  queryFields: [
    {
      name: 'poNumber', // 采购订单
      type: 'string',
      label: intl.get('sodr.purchase.view.message.poNumber').d('采购订单编号:'),
    },
    {
      name: 'circuitNumber',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.circuitNumber').d('客户电路编号:'),
    },
    {
      name: 'poStatus',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.poStatus').d('采购订单状态:'),
      lookupCode: 'SPUC.PURCHASE_ORDER_STATUS',
    },
    {
      name: 'createDateBegin',
      type: 'date',
      label: intl.get('sodr.purchase.view.message.createDateBegin').d('创建日期从:'),
    },
    {
      name: 'createDateEnd',
      type: 'date',
      label: intl.get('sodr.purchase.view.message.createDateEnd').d('创建日期至:'),
    },
    {
      name: 'requireCode',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.requireCode').d('销售需求单号:'),
    },
    {
      name: 'userDepartment',
      type: 'object',
      label: intl.get('sodr.purchase.view.message.userDepartment').d('承办部门:'),
      lovCode: 'SPRM.USER_UNIT',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest(value) {
        return (value || {}).unitCode;
      },
      textField: 'unitName',
    },
    {
      name: 'creator',
      type: 'object',
      label: intl.get('sodr.purchase.view.message.creator').d('承办人:'),
      lovCode: 'HPFM.EMPLOYEE',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest(value) {
        return (value || {}).employeeNum;
      },
      textField: 'name',
    },
    {
      name: 'cmiEntity',
      type: 'object',
      label: intl.get('sodr.purchase.view.message.cmiEntity').d('采购签约主体:'),
      lovCode: 'VP.PRICE_CONTRACT_SIGN_ENTITY',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest(value) {
        return (value || {}).value;
      },
      textField: 'meaning',
    },
    {
      name: 'supplierCode',
      type: 'object',
      label: intl.get('sodr.purchase.view.message.supplierName').d('供应商名称:'),
      lovCode: 'SSLM.TENANT_SUPPLIER_LIST',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest(value) {
        return (value || {}).supplierCompanyNum;
      },
      textField: 'supplierCompanyName',
    },
    {
      name: 'currencyCode',
      type: 'object',
      label: intl.get('sodr.purchase.view.message.currency').d('币种'),
      lovCode: 'HPFM.CURRENCY',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest(value) {
        return (value || {}).currencyCode;
      },
      textField: 'currencyCode',
    },
    {
      name: 'priceEntryNum',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.priceEntryNum').d('报价单号'),
    },
    {
      name: 'poType',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.poType').d('订单类型'),
      lookupCode: 'SPUC.BUSINESS_TYPE',
    },
    {
      name: 'originalRequireCode',
      type: 'string',
      label: intl.get('sodr.purchase.view.message.originalRequireCode').d('原始需求单号'),
    },
  ],
});
