/**
 * index.js - 招标文件
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { createPagination, tableScrollWidth, getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { downloadFile } from 'services/api';
import styles from './index.less';

const hcommon = 'hzero.common';
const milcommon = 'bid.milestonecommon';
const organizationId = getCurrentOrganizationId();

export default class TenderDocuments extends React.Component {
  constructor(props) {
    super(props);
    const {

    } = this.props;
    this.state = {};
  }
  componentDidMount() {
    this.fetchTenderList(); // 查询数据
  }
  /**
   * fetchTenderList - 查询招标文件表格信息
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchTenderList(page = {}) {
    const { dispatch, match, jsFileFlag } = this.props;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractJudgesCusSorce/getTenderList',
      payload: {
        page,
        proId: match.params.proId,
        state: 0, //jsFileFlag
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
        }));
        dispatch({
          type: 'contractJudgesCusSorce/updateState',
          payload: {
            tenderSource: newDataSource,
            tenderPagination: createPagination(res),
          },
        });
      }
    });
  }

  // 打开附件弹框
  @Bind()
  showFile() {
    this.setState({
      fileModel: true
    })
    // this.getFileList()
  }
  /**
   * 获取附件弹框的表格数据
  */
  getFileList() {

  }
  handleOk() {
    this.setState({
      fileModel: false
    })
  }
  handleCancel() {
    this.setState({
      fileModel: false
    })
  }

  @Bind
  handlePageChange(page) {
    const { onPageChange = (e) => e } = this.props;
    onPageChange(page);
  }

  // 单独下载
  @Bind
  handleDownload(record) {
    const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?url=${record.fileUrl}`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: 'bidding' },
        { name: 'url', value: encodeURIComponent(record.fileUrl) },
      ],
    });
  };


  // 单独预览
  @Bind
  handlePreview(record) {
    const { OOS_HOST } = process.env;
    const downUrl = encodeURIComponent(
      `${HZERO_FILE}/v1/${organizationId}/files/download?access_token=${getAccessToken()}&bucketName=bidding&url=${record.fileUrl
      }`
    );
    const url = `${OOS_HOST}?file=${downUrl}`;
    window.open(url);
  }

  render() {
    const {
      contractJudgesCusSorce: {
        tenderSource = [],
        tenderPagination = {},
      },
    } = this.props;
    const {
      selectedRows = [],
      selectedRowKeys = [],
    } = this.state;
    const columns = [
      {
        key: 'name',
        dataIndex: 'name',
        width: 900,
        title: intl.get(`${hcommon}.uploadFile.view.fileName`).d('文件名'),
        render: (val, record) => (
          <span className={styles.fileFontColor}
            onClick={() => this.handlePreview(record)}
          >
            {val}
          </span>
        )
      },
      {
        key: 'fileUrl',
        dataIndex: 'fileUrl',
        title: intl.get(`${milcommon}.view.title.operation`).d('操作'),
        width: 63,
        render: (val, record) => {
          return (
            <a onClick={() => this.handleDownload(record)}>{intl.get(`${hcommon}.button.download`).d('下载')}</a>
          )
        }
      }
    ];
    const listProps = {
      dataSource: tenderSource,
      columns,
      pagination: tenderPagination,
      selectedRows,
      selectedRowKeys,
      resizable: true,
      onChange: this.fetchTenderList
    };
    return (
      // <div className={styles['HeaderButton']}>
        // <CusButton onClick={this.downLoadAll}>
        //   {intl.get(`${bidcommon}.view.button.downloadall`).d('全部下载')}
        // </CusButton>
        <CusTable {...listProps} scroll={{ x: tableScrollWidth(columns) }} />
      // </div>
    );
  }
}
