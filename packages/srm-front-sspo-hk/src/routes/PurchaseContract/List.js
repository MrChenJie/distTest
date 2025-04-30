/**
 * index.js - 协议拟制列表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { sum } from 'lodash';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { dateRender, dateTimeRender, numberRender, yesOrNoRender } from 'utils/renderer';

export default class List extends React.Component {
  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const columnArray = [
      {
        title: intl.get(`spcm.common.model.prNum`).d('申请编号'),
        dataIndex: 'prNum',
        width: 160,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 160,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        fixed: 'left',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 160,
        render: val => numberRender(val, 2),
      },
      {
        title: intl.get(`spcm.common.model.common.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 160,
        // render: val => numberRender(val, 2),
      },
      {
        title: intl.get(`spcm.common.model.common.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 160,
        render: val => numberRender(val, 2),
      },
      {
        title: intl.get(`spcm.common.model.common.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.unit`).d('单位'),
        dataIndex: 'jointUomName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
        dataIndex: 'availableQuantity',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.executionStatusCode`).d('执行状态'),
        dataIndex: 'executionStatusCodeMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.reqTypeCode`).d('申请类型'),
        dataIndex: 'reqTypeCode',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 160,
        render: (_, record) => <span>{record.supplierCode || record.supplierCompanyCode}</span>,
      },
      {
        title: intl.get(`spcm.common.model.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
        render: (_, record) => <span>{record.supplierName || record.supplierCompanyName}</span>,
      },
      {
        title: intl.get(`spcm.common.model.companyName`).d('公司'),
        dataIndex: 'companyName',
        width: 160,
      },
      // {
      //   title: intl.get('spcm.purchaseContractType.model.pcFlag').d('是否全局协议'),
      //   dataIndex: 'globalFlag',
      //   width: 150,
      //   render: val => yesOrNoRender(val),
      // },
      {
        title: intl.get(`spcm.common.model.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.purchaseOrgGroupName`).d('采购组'),
        dataIndex: 'agentName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.catalogName`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.prRequestedName`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.telNum`).d('联系电话'),
        dataIndex: 'contactTelNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.invoiceAddress`).d('收货方地址'),
        dataIndex: 'invoiceAddress',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 160,
        render: val => dateRender(val, 2),
      },
      {
        title: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
        dataIndex: 'companyOrgName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
        dataIndex: 'costAnchDepDesc',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.expBearDep`).d('费用承担部门'),
        dataIndex: 'expBearDep',
        width: 160,
      },
      // {
      //   title: intl.get(`spcm.common.model.itemAtrMeaning`).d('属性'),
      //   dataIndex: 'itemAtrMeaning',
      //   width: 160,
      // },
      // {
      //   title: intl.get(`spcm.common.model.agentName`).d('采购员'),
      //   dataIndex: 'agentName',
      //   width: 160,
      // },
      // {
      //   title: intl.get(`spcm.common.model.keeperUserName`).d('保管人'),
      //   dataIndex: 'keeperUserName',
      //   width: 160,
      // },
      // {
      //   title: intl.get(`spcm.common.model.accepterUserName`).d('验收人'),
      //   dataIndex: 'accepterUserName',
      //   width: 160,
      // },
      {
        title: intl.get(`spcm.common.model.location`).d('地点'),
        dataIndex: 'locationMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.projectCode`).d('项目编码'),
        dataIndex: 'projectNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.projectName`).d('项目名称'),
        dataIndex: 'projectName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.prSourcePlatformMeaning`).d('来源平台'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 160,
        render: val => yesOrNoRender(val),
      },
      {
        title: intl.get(`spcm.common.model.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        render: val => dateTimeRender(val, 2),
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRowKeys,
      // selectedPurchaseContracts,
      onRowSelectChange = e => e,
    } = this.props;
    // const selectedPurchaseContractKeys = selectedPurchaseContracts.map(item => item.prLineId);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
      // type: 'radio',
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'prLineId',
      onChange: page => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) + 300 };

    return <EditTable {...tableProps} />;
  }
}
