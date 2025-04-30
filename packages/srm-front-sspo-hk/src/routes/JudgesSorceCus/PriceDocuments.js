/**
 * index.js - 报价文件
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Tag } from 'antd';
import CusSelect from '_cus_components/CusSelect';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import { dateTimeRender } from 'utils/renderer';
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

export default class PriceDocuments extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {};
  }
  componentDidMount() {
    this.getMilestones(); // 查询报价文件和轮次信息
  }

  tbAndBjForm = React.createRef();

  getMilestones = (stateMilestoneId, page = {}) => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getPriceRound',
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

  // 当前行的全部下载
  downloadAll = (e, record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/downLoadPriceFilesZip',
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
        priceFiles = [],
        pricePagination = {},
        milestonesBj
      },
      getPriceMilestones = (e) => e,
      priceMilestoneId,
      basicInfo,
    } = this.props;
    const fileSorce = [
      {
        key: 'supplierName',
        dataIndex: 'supplierName',
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商'),
        width: 400,
        ellipsis: true,
        render: tooltipRender,
      },
      {
        key: 'priceFile',
        dataIndex: 'priceFile',
        title: intl.get(`${milcommon}.view.title.quotationdocument`).d('报价文件'),
        width: 200,
        render: (val, record) => {
          return (
            record.priceFile === null ? 'N/A' :
              <UploadFile
                onUploadSuccess={(item) => onUploadSuccess(item, record)}
                tableName="SPUC_PO_CON_ATTACH"
                parentId={record.priceFile}
                value={record.priceFile}
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
      dataSource: priceFiles,
      columns: fileSorce,
      pagination: pricePagination,
      resizable: true,
      onChange: (page) => getPriceMilestones(priceMilestoneId ? priceMilestoneId : -1, page),
    };
    return (
      <Form ref={this.tbAndBjForm}>
        <CusTable {...listProps} scroll={{ x: tableScrollWidth(fileSorce) }} />
      </Form>
    );
  }
}
