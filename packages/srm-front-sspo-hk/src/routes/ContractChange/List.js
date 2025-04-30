/*
 * @Description: List - 协议变更列表
 * @author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-11-12 11:14:15
 */
import React, { Component } from 'react';
import { Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';

export default class List extends Component {
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

  /*
   * editorPreview - 操作记录
   */
  @Bind()
  editorPreview(record) {
    const { handleModalVisibleList } = this.props;
    return (
      <a
        onClick={() =>
          handleModalVisibleList('operationRecordVisible', true, {
            pcHeaderId: record.pcHeaderId,
          })
        }
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </a>
    );
  }

  render() {
    const columns = [
      {
        title: intl.get(`spcm.contractChapter.model.common.pcStatusCode`).d('状态'),
        dataIndex: 'pcStatusCodeMeaning',
        width: 85,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 160,
        render: this.changeSkip,
        fixed: 'left',
      },

      {
        title: intl.get(`spcm.common.model.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 130,
        render: (val, record) => <Tooltip title={record.pcName}>{record.pcName}</Tooltip>,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`spcm.contractChapter.model.common.pcType`).d('协议类型'),
        dataIndex: 'pcTypeName',
        width: 120,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
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
        title: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
        dataIndex: 'templateName',
        width: 100,
      },
      {
        title: intl.get(`spcm.contractChapter.model.common.releaseData`).d('创建人'),
        dataIndex: 'createByRealName',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.getDate`).d('生效日期'),
        dataIndex: 'confirmedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
        dataIndex: 'pcSourceCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
        dataIndex: 'mainPcNum',
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
    const {
      loading,
      onSearch,
      pagination,
      dataSource,
      selectedRowKeys,
      onRowSelectChange,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };

    const tableProps = {
      loading,
      dataSource,
      pagination,
      rowSelection,
      columns,
      bordered: true,
      rowKey: 'pcHeaderId',
      onChange: onSearch,
      scroll: { x: sum(columns.map(n => n.width)) + 200 },
    };

    return <EditTable {...tableProps} />;
  }
}
