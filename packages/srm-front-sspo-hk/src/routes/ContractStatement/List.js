/*
 * @Description: index.js - 协议用章列表
 * @Author: MJQ <jiaqi.mao@hand-china.com>
 * @Date: 2019-08-23 11:14:15
 * @LastEditTime: 2019-08-26 16:13:53
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { sum, isEmpty } from 'lodash';

import { Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';

const common = 'spcm.common.model';
const commonPrompt = 'spcm.contractChapter.model.common';

export default class List extends Component {
  /**
   * changeSkip - 协议类型编码render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  changeSkip(text, record) {
    const { redirectDetail = e => e } = this.props;
    return <a onClick={() => redirectDetail(record.pcHeaderId, record.companyId)}>{text}</a>;
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
          handleModalVisibleList('operationRecordVisible', true, {
            pcHeaderId: record.pcHeaderId,
          })
        }
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </a>
    );
  }

  @Bind()
  getColumns(pcTermDetailDTOList) {
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.pcStatusCode`).d('状态'),
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
        title: intl.get(`${common}.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 150,
        render: (val, record) => <Tooltip title={record.pcName}>{record.pcName}</Tooltip>,
        fixed: 'left',
      },
      {
        title: intl.get(`${common}.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`${common}.legalRepName`).d('法人'),
        dataIndex: 'legalRepName',
        width: 150,
      },
      {
        title: intl.get(`${common}.telNum`).d('联系方式'),
        dataIndex: 'telNum',
        width: 150,
      },
      {
        title: intl.get(`${common}.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.pcType`).d('协议类型'),
        dataIndex: 'pcTypeName',
        width: 100,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
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
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.releaseData`).d('创建人'),
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
        title: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
        dataIndex: 'signDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.getDate`).d('生效日期'),
        dataIndex: 'startDateActive',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.endDateActive`).d('失效日期'),
        dataIndex: 'endDateActive',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
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
    ];
    const editorPreview = [
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        render: this.editorPreview,
      },
    ];
    const columns = pcTermDetailDTOList.map(item => {
      if (item.termType === 'DATE') {
        return {
          title: item.termTypeName,
          dataIndex: item.termTypeCode,
          render: dateRender,
        };
      }
      return {
        title: item.termTypeName,
        dataIndex: item.termTypeCode,
        width: 100,
        // render: (val, record) => record.termContent,
      };
    });
    return columnArray.concat(columns, editorPreview);
  }

  render() {
    const {
      selectedRowKeys,
      loading,
      onSearch,
      pagination,
      dataSource = [],
      onRowSelectChange = e => e,
    } = this.props;
    const { pcTermDetailDTOList } = isEmpty(dataSource)
      ? { pcTermDetailDTOList: [] }
      : dataSource[0];
    const newDate = dataSource.map(ele => {
      let date = {};
      ele.pcTermDetailDTOList.forEach(item => {
        const { termTypeCode, termContent } = item;
        date = { ...date, [termTypeCode]: termContent };
      });
      return { ...ele, ...date };
    });
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };

    const tableProps = {
      loading,
      dataSource: newDate,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'pcHeaderId',
      columns: this.getColumns(pcTermDetailDTOList),
      onChange: onSearch,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) };

    return <EditTable {...tableProps} />;
  }
}
