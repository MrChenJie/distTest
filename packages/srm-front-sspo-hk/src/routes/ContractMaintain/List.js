/**
 * index.js - 协议拟制列表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
// import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum } from 'lodash';
import { Tooltip } from 'hzero-ui';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import UploadModal from 'components/Upload';
import { dateRender, yesOrNoRender } from 'utils/renderer';

// const FormItem = Form.Item;
const commonPrompt = 'spcm.contractMaintain.model';
const common = 'spcm.common.model';

export default class List extends React.Component {
  /**
   * editorPreview - 操作记录
   */
  @Bind()
  editorPreview(record) {
    const { handleModalVisibleList = e => e } = this.props;
    return (
      <a
        onClick={() =>
          handleModalVisibleList('operationRecordVisible', true, { pcHeaderId: record.pcHeaderId })
        }
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </a>
    );
  }

  /**
   * changeSkip - 协议类型编码render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */

  @Bind()
  changeSkip(text, record) {
    const { redirectDetail = e => e } = this.props;
    return <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>;
  }

  /**
   * upTemplate - 上传文件render方法
   * @param {object} record - 行数据
   */
  @Bind()
  upTemplate(text, record) {
    const { afterOpenLineUploadModal = e => e } = this.props;
    const uploadModalProps = {
      showFilesNumber: false,
      icon: false,
      templateFileURL: record.templateFileUrl,
      bucketName: 'private-bucket',
      bucketDirectory: 'sodr-order',
      afterOpenUploadModal: uuid => afterOpenLineUploadModal(uuid, record),
    };
    return <UploadModal {...uploadModalProps} />;
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.pcStatusCode`).d('状态'),
        dataIndex: 'pcStatusCodeMeaning',
        width: 85,
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 160,
        render: this.changeSkip,
      },

      {
        title: intl.get(`${common}.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        render: (val, record) => <Tooltip title={record.pcName}>{record.pcName}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.supplierCompanyId`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 170,
      },
      {
        title: intl.get(`${common}.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`spcm.purchaseContractType.model.pcType`).d('协议类型'),
        dataIndex: 'pcTypeName',
        width: 120,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get('spcm.purchaseContractType.model.pcFlag').d('是否全局协议'),
        dataIndex: 'globalFlag',
        width: 150,
        render: val => yesOrNoRender(val),
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.agentName').d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get(`${common}.pcTemplateId`).d('协议模板'),
        dataIndex: 'templateName',
        width: 120,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createByRealName',
        width: 140,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${common}.agreementSource`).d('协议来源'),
        dataIndex: 'pcSourceCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${common}.mainAgreementCode`).d('主协议编码'),
        dataIndex: 'mainPcNum',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.archiveCode`).d('归档码'),
        dataIndex: 'archiveCode',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        render: this.editorPreview,
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
      selectedRows,
      onRowSelectChange = e => e,
    } = this.props;
    const selectedRowKeys = selectedRows.map(item => item.pcHeaderId);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'pcHeaderId',
      onChange: page => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) + 300 };

    return <EditTable {...tableProps} />;
  }
}
