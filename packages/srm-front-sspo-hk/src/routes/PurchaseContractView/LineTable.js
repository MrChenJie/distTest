/**
 * index.js - 我发起的协议列表
 * @date: 2019-05-23
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
// import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import { Tooltip, Form } from 'hzero-ui';

import EditTable from 'components/EditTable';
import UploadModal from 'components/Upload/index';

import intl from 'utils/intl';
// import UploadModal from 'components/Upload';
import { dateRender, yesOrNoRender, numberRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

const FormItem = Form.Item;
const commonPrompt = 'spcm.common.model.common';
const modelPrompt = 'spcm.purchaseContractView.model';

@connect(({ purchaseContractView = {} }) => ({
  purchaseContractView,
}))
export default class LineTable extends React.Component {
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
    const { handleModalVisibleList } = this.props;
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
   * protocolType - 预览编辑render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  protocolType(text, record) {
    const { overdueRemindFlag } = record;
    const { redirectDetail = e => e } = this.props;
    // return <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>;
    if (overdueRemindFlag === 1) {
      return (
        <a style={{ color: 'red' }} onClick={() => redirectDetail(record.pcHeaderId)}>
          {text}
        </a>
      );
    } else {
      return <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>;
    }
  }

  @Bind()
  handleUpdateRecord(record, archiveAttachmentUuid) {
    const { dataSource, dispatch } = this.props;
    const newDataSource = dataSource.map(item => {
      if (item.pcHeaderId === record.pcHeaderId) {
        return {
          ...item,
          archiveAttachmentUuid,
        };
      }
      return item;
    });
    // this.setState({
    //   dataSource: newDataSource,
    // });
    dispatch({
      type: 'purchaseContractView/updateState',
      payload: { dataSource: newDataSource },
    });
  }

  @Bind()
  afterOpenLineUploadModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/uploads',
      payload: {
        pcHeaderId: record.pcHeaderId,
        archiveAttachmentUuid: record.archiveAttachmentUuid,
      },
    });
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { onControlStageModal } = this.props;
    const uploadProps = {
      icon: false,
      // btnText: intl.get('entity.attachment.upload').d('附件上传'),
      showFilesNumber: false,
      bucketName: 'private-bucket',
      bucketDirectory: 'spcm-supplier',
    };

    const columnArray = [
      {
        title: intl.get(`${modelPrompt}.pcStatusCode`).d('状态'),
        dataIndex: 'pcStatusCodeMeaning',
        width: 85,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgreementNum`).d('采购协议编号'),
        dataIndex: 'pcNum',
        width: 160,
        fixed: 'left',
        render: this.protocolType,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgreementName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 200,
        fixed: 'left',
        render: (val, record) => <Tooltip title={record.pcName}>{record.pcName}</Tooltip>,
      },
      {
        title: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
        dataIndex: 'supplierCompanyName',
        width: 165,
      },
      {
        title: intl.get(`${commonPrompt}.pcKindCode`).d('协议性质'),
        dataIndex: 'pcKindCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.pcType`).d('协议类型'),
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
        title: intl.get('spcm.common.view.message.title.contractStage').d('协议阶段'),
        dataIndex: 'contractStage',
        width: 100,
        render: (_, record) => (
          <a onClick={() => onControlStageModal(record.pcHeaderId)}>协议阶段</a>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.amount`).d('协议总额'),
        dataIndex: 'taxIncludeAmount',
        width: 150,
        render: val => numberRender(val, 2),
      },
      {
        title: intl.get(`${commonPrompt}.executedAmount`).d('已执行金额'),
        dataIndex: 'executedAmount',
        width: 150,
        render: val => numberRender(val, 2),
      },
      {
        title: intl.get(`${commonPrompt}.toExecuteAmount`).d('待执行金额'),
        dataIndex: 'toExecuteAmount',
        width: 150,
        render: val => numberRender(val, 2),
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
        title: intl.get(`${commonPrompt}.pcTemplateId`).d('协议模板'),
        dataIndex: 'templateName',
        width: 120,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createByRealName',
        width: 140,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
        dataIndex: 'signDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.startDateActive`).d('生效日期'),
        dataIndex: 'startDateActive',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.endDateActive`).d('失效日期'),
        dataIndex: 'endDateActive',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
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
        width: 100,
      },
      {
        title: intl.get(`spcm.common.archiveCode`).d('归档码'),
        dataIndex: 'archiveCode',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
        dataIndex: 'archiveAttachmentUuid',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`archiveAttachmentUuid`, {
              initialValue: record.archiveAttachmentUuid,
            })(
              <UploadModal
                viewOnly={record.enabledArchiveFlag !== 1}
                btnText={
                  record.archivedFlag === 1
                    ? intl.get('entity.attachment.upload').d('附件上传')
                    : null
                }
                attachmentUUID={record.archiveAttachmentUuid}
                afterOpenUploadModal={archiveAttachmentUuid =>
                  this.handleUpdateRecord(record, archiveAttachmentUuid)
                }
                onUploadSuccess={() => this.afterOpenLineUploadModal(record)}
                {...uploadProps}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        // width: 100,
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
    const scrollX = tableScrollWidth(columns, 100);
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'pcHeaderId',
      onChange: page => onSearch(page),
      pagination,
      scroll: { x: scrollX },
    };

    return <EditTable {...tableProps} />;
  }
}
