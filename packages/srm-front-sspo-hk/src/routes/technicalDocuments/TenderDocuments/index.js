/**
 * index.js - 招标文件
 * @date: 2022-05-06
 * @author:  <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import UploadFile from './UploadFile';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
  fetchSourceList: loading.effects['contractJudgesSorce/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractJudgesSorce/fetchEnum'],
  contractJudgesSorce,
}))

export default class TenderDocuments extends Component {
  constructor(props) {
    super(props);
    const {

    } = this.props;
    this.state = {
      dataSource: [],
    };
  }
  componentDidMount() {
    //  this.setState({
    //      dataSource: [],
    //  })
    this.fetchTenderList(); // 查询数据
  }
  /**
   * fetchTenderList - 查询招标/投标文件表格信息
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchTenderList(page = {}) {
    const { dispatch, match, jsFileFlag } = this.props;
    //  this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractJudgesSorce/getDocumentList',
      payload: {
        //  page,
        proId: match.params.proId, // match.params.proId
        milestoneId: match.params.milestoneId,
        //  state: 0, //jsFileFlag
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(n => ({
            ...n,
            _status: 'update',
          })),
        })
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

  render() {
    const {
      fetchSourceList,
      contractJudgesSorce,
      // jsFileFlag,
      pagination,
      proInfoWording,
    } = this.props;
    //  const { dataSource = [] } = contractJudgesSorce;

    const {
      selectedRows = [],
      selectedRowKeys = [],
      // jsFileFlag，
      dataSource,
    } = this.state;
    const listFile = [{
      name: intl.get(`bid.bidcommon.bid.title.TechnicalDocuments`).d('技术文件'),
      fileId: 1,
      fileUrl: '12'
    }, {
      name: intl.get(`bid.bidcommon.bid.title.BusinessDocuments`).d('商务文件'),
      fileId: 2,
      fileUrl: '23'
    }, {
      name: intl.get(`bid.bidcommon.bid.title.TechnicalAndCommercialResponseDocuments`).d('技术、商务应答表'),
      fileId: 3,
      fileUrl: '34'
    }]
    const columns = [
      {
        title: proInfoWording ? intl.get(`bid.bidcommon.view.title.biddingdocumenttb`).d('投标文件')
          : intl.get(`bid.bidcommon.view.title.biddingdocumenttbnew`).d('应答文件'),
        dataIndex: 'name',
      },
      {
        title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
        dataIndex: 'fileUrl',
        render: (val, _, index) => {
          if (dataSource.length > 0) {
            return (
              <UploadFile
                tableName="SPUC_PO_CON_ATTACH"
                //  parentId={index}
                value={val}
                index={index}
                //  onShowList={this.fetchTenderList}
                dataSource={dataSource}
                parentId={dataSource}
                disabled
              />
            )
          }
        }
      }
    ];
    const listProps = {
      dataSource: listFile,
      columns,
      pagination: false,
      selectedRows,
      selectedRowKeys,
      contractJudgesSorce,
      loading: fetchSourceList
    };
    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        <Content >
          <Table bordered {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
