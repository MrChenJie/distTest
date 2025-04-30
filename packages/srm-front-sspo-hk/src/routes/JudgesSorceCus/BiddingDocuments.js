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
import CusSelect from '_cus_components/CusSelect';
import { tooltipRender } from '_cus_utils/render';
import { dateTimeRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
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
    }).then(res => {
      if (res) {
        this.setState({ stateRound: res.milestoneId })
      }
    })
  }

  @Bind()
  downloadAll(e, record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/downLoadBidFilesZip',
      payload: { supplierId: record.supplierId },
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
      contractJudgesCusSorce: {
        fileSourceT = [],
        biddingpPagination = {},
        milestonesTb,
      },
      getMilestones = (e) => e,
      biddingMilestoneId,
      basicInfo,
    } = this.props;
    const fileSorce = [
      {
        key: 'supplierName',
        dataIndex: 'supplierName',
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        width: 200,
        ellipsis: true,
        render: tooltipRender,
      },
      {
        key: 'tenFileUrls',
        dataIndex: 'tenFileUrls',
        title: intl.get(`${prompt}.bid.title.TechnicalDocuments`).d('技术文件'),
        width: 200,
        render: (val, record) => {
          return (
            record.tenFileUrls === null ? 'N/A' :
              <UploadFile
                onUploadSuccess={(item) => onUploadSuccess(item, record)}
                onDeleteSuccess={() => onDeleteSuccess(record)}
                tableName="SPUC_PO_CON_ATTACH"
                parentId={record.tenFileUrls}
                value={record.tenFileUrls}
                disabled
              />
          )
        }
      },
      {
        key: 'busiFileUrls',
        dataIndex: 'busiFileUrls',
        title: intl.get(`${prompt}.bid.title.BusinessDocuments`).d('商务文件'),
        width: 200,
        render: (val, record, index) => {
          return (
            record.busiFileUrls === null ? 'N/A' :
              <UploadFile
                onUploadSuccess={(item) => onUploadSuccess(item, record)}
                onDeleteSuccess={() => onDeleteSuccess(record)}
                tableName="SPUC_PO_CON_ATTACH"
                parentId={record.busiFileUrls}
                value={record.busiFileUrls}
                disabled
              />
          )
        }
      },
      {
        key: 'answerFileUrls',
        dataIndex: 'answerFileUrls',
        title: intl.get(`${prompt}.bid.title.TechnicalAndCommercialResponseDocuments`).d('技术、商务应答表'),
        width: 250,
        render: (val, record) => {
          return (
            record.answerFileUrls === null ? 'N/A' :
              <UploadFile
                onUploadSuccess={(item) => onUploadSuccess(item, record)}
                onDeleteSuccess={() => onDeleteSuccess(record)}
                tableName="SPUC_PO_CON_ATTACH"
                parentId={record.answerFileUrls}
                value={record.answerFileUrls}
                disabled
              />
          )
        }
      },
      {
        key: 'state',
        dataIndex: 'state',
        title: intl.get(`${dashPrompt}.model.title.status`).d('状态'),
        width: 110,
        render: (val) => (
          <Tag
            key={val}
            color={val === 'N' ? 'red' : 'green'}
            className={styles.tagClassStyle}
          >
            <span className={styles.tagStyle} >
              {val === 'N' ? 
                (basicInfo.proInfoWording ? intl.get(`${prompt}.view.title.unstate`).d('未投标') : intl.get(`${prompt}.view.title.unstatenew`).d('未应答')) :
                (basicInfo.proInfoWording ? intl.get(`${prompt}.view.title.state`).d('已投标') : intl.get(`${prompt}.view.title.statenew`).d('已应答'))
              }
            </span>
          </Tag>
        ),
      },
      {
        key: 'bidDate',
        dataIndex: 'bidDate',
        title: basicInfo.proInfoWording ? intl.get(`${prompt}.view.title.biddingdate`).d('投标时间')
          : intl.get(`${prompt}.view.title.biddingdatenew`).d('应答时间'),
        width: 200,
        render: (val, record) => (
          record.bidDate === null ? 'N/A' : dateTimeRender(val)
        )
      },
      {
        title: intl.get(`${milcommon}.view.title.operation`).d('操作'),
        width: 90,
        render: (row, record) => {
          return (
            <a onClick={(e) => this.downloadAll(e, record)}>
              {intl.get(`${prompt}.view.button.downloadall`).d('全部下载')}
            </a>
          )
        }
      },
    ];
    const listProps = {
      dataSource: fileSourceT,
      columns: fileSorce,
      pagination: biddingpPagination,
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
