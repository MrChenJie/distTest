/**
 * index.js - 投标文件
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
// import { Link } from 'dva/router';
import intl from 'utils/intl';
import UploadFile from './UploadFile';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
    fetchSourceList: loading.effects['contractJudgesSorce/fetchSourceList'],
    fetchEnumLoading: loading.effects['contractJudgesSorce/fetchEnum'],
    contractJudgesSorce,
}))

export default class BiddingDocuments extends Component {
    constructor(props) {
        super(props);
        const {

        } = this.props;
        this.state = {
            fileModel: false,
        };
    }
    componentDidMount() {
        this.fetchBiddingList(); // 查询数据
    }
    /**
     * fetchBiddingList - 查询投标文件表格信息
     * @param {object} params - 查询条件
     */
    @Bind()
    fetchBiddingList(page = {}) {
        const { dispatch, jsFileFlag } = this.props;
        this.setState({ selectedRows: [], selectedRowKeys: [] });
        dispatch({
            type: 'contractJudgesSorce/getDiddingList',
            payload: {
                page,
                proId: 3, // match.params.proId
                state: 1,
            },
        });
    }

    // 打开附件弹框
    @Bind()
    showFile() {
        this.setState({
            fileModel: true
        })
        // setTimeout(() => {
        this.getFileList()
        // },100)
    }

    /**
     * 获取附件弹框的表格数据
    */
    @Bind()
    getFileList() {
        const { dispatch, jsFileFlag } = this.props;
        this.setState({ selectedRows: [], selectedRowKeys: [] });
        dispatch({
            type: 'contractJudgesSorce/getEnclosureList',
            payload: {
                page,
                proId: 20, // match.params.proId
                supplierId: 25,
            },
        });
    }
    @Bind()
    handleOk() {
        this.setState({
            fileModel: false
        })
    }
    @Bind()
    handleCancel() {
        this.setState({
            fileModel: false
        })
    }

    render() {
        const {
            fetchSourceList,
            contractJudgesSorce,
            jsFileFlag,
            pagination,
        } = this.props;
        const { fileSourceT = [], fileSource = [] } = contractJudgesSorce;
        console.log('fileSource', fileSourceT, fileSource)
        const {
            selectedRows = [],
            selectedRowKeys = [],
        } = this.state;
        const columns = [
            {
                title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyNum`).d('供应商'),
                dataIndex: 'name',
                with: 200
            },
            {
                title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('附件'),
                dataIndex: '',
                with: 80,
                render: (row, record) => {
                    // if (row.fileUrl !== null || row.fileUrl !== '') {
                    return (
                        <UploadFile
                            onUploadSuccess={(item) => onUploadSuccess(item, record)}
                            onDeleteSuccess={() => onDeleteSuccess(record)}
                            tableName="SPUC_PO_CON_ATTACH"
                            parentId={record.qaId}
                            value={row}
                            disabled
                        />
                        // <Button type='text' onClick={this.showFile}>查看附件</Button>
                    )
                    // }
                }
            },
        ];
        const fileColumns = [
            {
                title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyNum`).d('轮次'),
                dataIndex: 'round',
                render: (text, row) => {
                    return (
                        <p>
                            {intl.get('bid.bidcommon.view.title.the').d('第')}
                            {row.round}
                            {intl.get('bid.bidcommon.view.title.turn').d('轮')}
                        </p>
                    )
                }
            },
            {
                title: intl.get(`bid.bidcommon.bid.title.TechnicalDocuments`).d('技术文件'),
                dataIndex: 'tenFileUrls',
            },
            {
                title: intl.get(`bid.bidcommon.bid.title.BusinessDocuments`).d('商务文件'),
                dataIndex: 'busiFileUrls',
            }, ,
            {
                title: intl.get(`bid.bidcommon.bid.title.TechnicalAndCommercialResponseDocuments`).d('技术、商务应答表'),
                dataIndex: 'answerFileUrls',
            }
        ];
        const listProps = {
            dataSource: fileSourceT,
            columns,
            pagination,
            selectedRows,
            selectedRowKeys,
            contractJudgesSorce,
            loading: fetchSourceList
        };
        const fileListProps = {
            dataSource: fileSource,
            columns: fileColumns,
            pagination,
            selectedRows,
            selectedRowKeys,
            contractJudgesSorce,
            loading: fetchSourceList
        };
        listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
        fileListProps.scroll = { x: sum(fileListProps.columns.map((n) => n.width)) + 300 };
        return (
            <Fragment>
                <Content>
                    <Table bordered {...listProps} />
                    {/* <Modal
                        title="附件查看"
                        visible={this.state.fileModel}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        width="40%"
                    >
                        <Table bordered {...fileListProps} />
                    </Modal> */}
                </Content>
            </Fragment>
        );
    }
}
