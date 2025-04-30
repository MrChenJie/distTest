/**
 * index.js - 协议审签署列表
 * @date: 2019-05-22
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
// import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { sum } from 'lodash';
import { Tooltip } from 'hzero-ui';

import excpedited from '@/assets/icon-expedited.svg';

const commonPrompt = 'spcm.contractSign.model.common';
const common = 'spcm.common.model';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRowKeys: [],
      //   invOrganizationName: undefined,
    };
  }

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
    return (
      <span>
        <a onClick={() => redirectDetail(record.pcHeaderId, record.supplierCompanyId)}>{text}</a>
        {record.pcStatusCode === 'TERMINATION_CONFIRM' ? (
          <Tooltip title={intl.get(`spcm.common.model.common.overSure`).d('终止确认')}>
            <img src={excpedited} alt="img" />
          </Tooltip>
        ) : null}
      </span>
    );
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
        width: 200,
        render: this.changeSkip,
      },
      {
        title: intl.get(`${commonPrompt}.electricSignFlag`).d('是否电签'),
        dataIndex: 'electricSignFlag',
        width: 100,
        render: (text, record) =>
          record.electricSignFlag === 1
            ? intl.get(`${commonPrompt}.yes`).d('是')
            : intl.get(`${commonPrompt}.no`).d('否'),
      },
      {
        title: intl.get(`${common}.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        render: (val, record) => <Tooltip title={record.pcName}>{record.pcName}</Tooltip>,
      },
      {
        title: intl.get(`${common}.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`${common}.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.customerName`).d('客户名称'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`spcm.contractChapter.model..globalFlag`).d('是否全局协议'),
        dataIndex: 'globalFlag',
        width: 150,
        render: yesOrNoRender,
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
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createByRealName',
        width: 170,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`${commonPrompt}.releaseData`).d('发布日期'),
        dataIndex: 'approvedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`${common}.pcType`).d('协议类型'),
        dataIndex: 'pcTypeName',
        width: 100,
      },
      {
        title: intl.get(`${common}.pcTemplateId`).d('协议模板'),
        dataIndex: 'templateName',
        width: 100,
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
      // selectedRowKeys = [],
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
