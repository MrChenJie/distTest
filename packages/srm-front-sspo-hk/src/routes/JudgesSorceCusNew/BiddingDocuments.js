/**
 * index.js - 投标文件
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Tag } from 'antd';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusUpload from '../../components/CusUpload';
import { tooltipRender } from '_cus_utils/render';
import { dateTimeRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import UploadFile from './UploadFile';
import styles from './index.less';

const prompt = 'bid.bidcommon';
const dashPrompt = 'bid.biddashbord';
const milcommon = 'bid.milestonecommon';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

export default class BiddingDocuments extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {};
  }
  componentDidMount() {
    this.getMilestones(); // 查询投标文件和轮次信息
  }

  tbAndBjForm = React.createRef();

  getMilestones = (stateMilestoneId, page = {}) => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getDiddingRound',
      payload: {
        page: page,
        proId: match.params.proId,
        milestoneId: stateMilestoneId ? stateMilestoneId : -1,
      },
    }).then((res) => {
      if (res) {
        this.setState({ stateRound: res.milestoneId });
      }
    });
  };

  @Bind()
  downloadAll(e, record) {
    const { dispatch, match } = this.props;
    const { stateRound } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/downLoadBidFilesZip',
      payload: {
        supplierId: record.supplierId,
        milestoneId: stateRound,
        proId: match.params.proId,
      },
    }).then((res) => {
      // 创建下载的链接
      const url = window.URL.createObjectURL(
        new Blob(
          [res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        )
      );
      const location = document.createElement('a');
      location.style.display = 'none';
      const fileName = record.supplierName + '.zip';
      location.download = fileName;
      location.href = url;
      document.body.appendChild(location);
      location.click();
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(location.href);
      document.body.removeChild(location);
    });
  }

  render() {
    const {
      contractJudgesCusSorce: { fileSourceT = [], biddingpPagination = {}, milestonesTb },
      getMilestones = (e) => e,
      biddingMilestoneId,
      basicInfo,
    } = this.props;
    const fileSorce = [
      {
        key: 'supplierName',
        dataIndex: 'supplierName',
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        width: getCurrentLanguage() === 'zh_CN' ? 300 : 400,
        render: tooltipRender,
      },
      {
        key: 'technicalDocUuid',
        dataIndex: 'technicalDocUuid',
        title: intl.get('HKPC.commom.view.title.TechnicalDoc').d('Technical Document'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.technicalDocUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.technicalDocUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      {
        key: 'coveringLetterUuid',
        dataIndex: 'coveringLetterUuid',
        title: intl.get('HKPC.commom.view.title.CoveringLetter').d('Covering Letter'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.coveringLetterUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.coveringLetterUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      {
        key: 'executiveSumUuid',
        dataIndex: 'executiveSumUuid',
        title: intl.get('HKPC.commom.view.title.ExecutiveSum').d('Executive Summary'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.executiveSumUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.executiveSumUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      {
        key: 'projectProposalUuid',
        dataIndex: 'projectProposalUuid',
        title: intl.get('HKPC.commom.view.title.ProjectProposal').d('Project Proposal'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.projectProposalUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.projectProposalUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      {
        key: 'tendererQualificationsUuid',
        dataIndex: 'tendererQualificationsUuid',
        title: intl
          .get('HKPC.commom.view.title.TendererQualifications')
          .d('Tenderer Qualifications'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.tendererQualificationsUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.tendererQualificationsUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      {
        key: 'confidentAgreeUuid',
        dataIndex: 'confidentAgreeUuid',
        title: intl.get('HKPC.commom.view.title.ConfidentAgree').d('Confidentiality Agreement'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.confidentAgreeUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.confidentAgreeUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      {
        key: 'acknowledgementLetterUuid',
        dataIndex: 'acknowledgementLetterUuid',
        title: intl
          .get('HKPC.commom.view.title.AcknowledgementLetter')
          .d('Anti-Collusion Acknowledgement Letter'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.acknowledgementLetterUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.acknowledgementLetterUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      {
        key: 'brcertificateUuid',
        dataIndex: 'brcertificateUuid',
        title: intl.get('HKPC.commom.view.title.brcertificate').d('商业登记证明'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.brcertificateUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.brcertificateUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      {
        key: 'othersUuid',
        dataIndex: 'othersUuid',
        title: intl.get('HKPC.commom.view.title.Others').d('Others'),
        width: getCurrentLanguage() === 'zh_CN' ? 115 : 121,
        render: (val, record) => {
          return record.othersUuid === null ? (
            'N/A'
          ) : (
            <CusUpload
              bucketName="bidding"
              attachmentUUID={record.othersUuid}
              tenantId={getCurrentOrganizationId()}
              viewOnly={true}
            />
          );
        },
      },
      // {
      //   key: 'orderSeq',
      //   dataIndex: 'orderSeq',
      //   title: intl.get(`${dashPrompt}.model.title.status`).d('状态'),
      //   width: getCurrentLanguage() === 'zh_CN' ? 77 : 112,
      //   render: (val, record) => (
      //     <Tag
      //       key={record.state}
      //       color={record.state === 'N' ? 'red' : 'green'}
      //       className={styles.tagClassStyle}
      //     >
      //       <span className={styles.tagStyle}>
      //         {record.state === 'N'
      //           ? basicInfo.proInfoWording
      //             ? intl.get(`${prompt}.view.title.unstate`).d('未投标')
      //             : intl.get(`${prompt}.view.title.unstatenew`).d('未应答')
      //           : basicInfo.proInfoWording
      //           ? intl.get(`${prompt}.view.title.state`).d('已投标')
      //           : intl.get(`${prompt}.view.title.statenew`).d('已应答')}
      //       </span>
      //     </Tag>
      //   ),
      // },
      {
        key: 'lineNum',
        dataIndex: 'lineNum',
        title: basicInfo.proInfoWording
          ? intl.get(`${prompt}.view.title.biddingdate`).d('投标时间')
          : intl.get(`${prompt}.view.title.biddingdatenew`).d('应答时间'),
        width: 172,
        render: (val, record) => (record.bidDate === null ? 'N/A' : dateTimeRender(record.bidDate)),
      },
      {
        title: intl.get(`${milcommon}.view.title.operation`).d('操作'),
        dataIndex: 'operator',
        width: getCurrentLanguage() === 'zh_CN' ? 85 : 120,
        render: (row, record) => {
          return (
            <CusButton type="plain" onClick={(e) => this.downloadAll(e, record)}>
              {intl.get(`${prompt}.view.button.downloadall`).d('全部下载')}
            </CusButton>
          );
        },
      },
    ];
    const listProps = {
      dataSource: fileSourceT,
      columns: fileSorce,
      pagination: false,
      resizable: true,
      onChange: (page) => getMilestones(biddingMilestoneId ? biddingMilestoneId : -1, page),
    };
    return (
      <Form ref={this.tbAndBjForm}>
        <div className={styles['HeaderButton']}>
          <CusTable {...listProps} scroll={{ x: tableScrollWidth(fileSorce) }} />
        </div>
      </Form>
    );
  }
}
