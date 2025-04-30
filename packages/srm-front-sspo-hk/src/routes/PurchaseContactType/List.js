/**
 * index.js - 协议类型管理
 * @date: 2019-05-14
 * @author: zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import intl from 'utils/intl';
import UploadModal from 'components/Upload';
import { yesOrNoRender } from 'utils/renderer';
import warning from '@/assets/warning.svg';

const commonPrompt = 'spcm.purchaseContractType.model';

export default class List extends React.Component {
  /**
   * protocolType - 协议类型编码render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  protocolType(text, record) {
    const { redirectDetail = e => e } = this.props;
    return <a onClick={() => redirectDetail(record.pcTypeId)}>{text}</a>;
  }

  /**
   * 查询公司
   */
  @Bind()
  handleQueryCompany(_, record) {
    const { handleCompany = e => e } = this.props;
    if (record.dataFlag) {
      return (
        <span>
          <a onClick={() => handleCompany(record)}>
            {intl.get(`spcm.common.model.companyList`).d('公司列表')}
          </a>
        </span>
      );
    } else {
      return (
        <Tooltip
          title={intl.get(`spcm.common.view.title.assignedCompany`).d('您尚未未分配任何公司')}
        >
          <img src={warning} alt="img" />
        </Tooltip>
      );
    }
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

  render() {
    const { loading, dataSource, onSearch, pagination } = this.props;
    const tableProps = {
      columns: [
        {
          title: intl.get(`${commonPrompt}.pcTypeCode`).d('协议类型编码'),
          dataIndex: 'pcTypeCode',
          width: 200,
          render: this.protocolType,
        },
        {
          title: intl.get(`${commonPrompt}.pcTypeName`).d('协议类型名称'),
          dataIndex: 'pcTypeName',
        },
        {
          title: intl.get(`entity.item.applyCompany`).d('适用公司'),
          dataIndex: 'companyName',
          width: 400,
          render: this.handleQueryCompany,
        },
        {
          title: intl.get(`hzero.common.status.enable`).d('启用'),
          dataIndex: 'enabledFlag',
          width: 80,
          render: yesOrNoRender,
        },
      ],
      loading,
      dataSource,
      bordered: true,
      rowKey: 'pcTypeId',
      onChange: page => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) + 300 };

    return (
      <React.Fragment>
        <EditTable {...tableProps} />
      </React.Fragment>
    );
  }
}
