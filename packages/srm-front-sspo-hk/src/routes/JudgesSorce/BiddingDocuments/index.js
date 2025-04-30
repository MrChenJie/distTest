/**
 * index.js - 投标文件
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Table, Modal } from 'hzero-ui';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import { createPagination } from 'hzero-front/lib/utils/utils';
import UploadFile from '../UploadFile';
import styles from '../index.less';
import formatterCollections from 'utils/intl/formatterCollections';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
    fetchSourceList: loading.effects['contractJudgesSorce/getDiddingList'],
    fetchSourceTList: loading.effects['contractJudgesSorce/getEnclosureList'],
    contractJudgesSorce,
}))
@formatterCollections({
    code: ['bid.bidcommon']
})

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
        const { dispatch, match } = this.props;
        dispatch({
            type: 'contractJudgesSorce/getDiddingList',
            payload: {
                page,
                proId: match.params.proId,
                state: 1,
            },
        }).then((res) => {
            if (res) {
                const { content = [] } = res;
                const newDataSource = content.map((item) => ({
                    ...item,
                    _status: 'update',
                }));
                dispatch({
                    type: 'contractJudgesSorce/updateState',
                    payload: {
                        fileSourceT: newDataSource,
                        biddingpPagination: createPagination(res),
                    },
                });
            }
        });
    }

    // 打开附件弹框
    @Bind()
    showFile(e, record) {
        this.setState({
            fileModel: true
        })
        // setTimeout(() => {
        this.getFileList(record)
        // },100)
    }

    /**
     * 获取附件弹框的表格数据
    */
    @Bind()
    getFileList(record, page = {}) {
        const { dispatch, match } = this.props;
        dispatch({
            type: 'contractJudgesSorce/getEnclosureList',
            payload: {
                page,
                proId: match.params.proId,
                supplierId: record.supplierId,
            },
        }).then((res) => {
            if (res) {
                const { content = [] } = res;
                const newDataSource = content.map((item) => ({
                    ...item,
                    _status: 'update',
                }));
                dispatch({
                    type: 'contractJudgesSorce/updateState',
                    payload: {
                        fileSource: newDataSource,
                        bidPagination: createPagination(res),
                    },
                });
            }
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
            fetchSourceTList,
            contractJudgesSorce,
        } = this.props;
        const { fileSourceT = [], fileSource = [], biddingpPagination = {}, bidPagination = {} } = contractJudgesSorce;
        const {
            fileModel,
        } = this.state;
        const fileSorce = [
            {
                title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
                dataIndex: 'name',
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                with: 200
            },
            {
                title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
                dataIndex: '',
                with: 80,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (row, record) => {
                    return (
                        <a onClick={(e) => this.showFile(e, record)}>
                            {intl.get(`bid.bidcommon.view.title.viewdocument`).d('查看文件')}
                        </a>
                    )
                }
            },
        ];
        const fileColumns = [
            {
                title: intl.get(`bid.bidcommon.view.title.round`).d('轮次'),
                dataIndex: 'round',
                width: 120,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (text, row) => {
                    return (
                        <span>
                            {intl.get('bid.bidcommon.view.title.the').d('第')}
                            {row.round}
                            {intl.get('bid.bidcommon.view.title.turn').d('轮')}
                        </span>
                    )
                }
            },
            {
                title: intl.get(`bid.bidcommon.bid.title.TechnicalDocuments`).d('技术文件'),
                dataIndex: 'tenFileName',
                width: 200,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (val, record) => {
                    return (
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
                title: intl.get(`bid.bidcommon.bid.title.BusinessDocuments`).d('商务文件'),
                dataIndex: 'busiFileName',
                width: 200,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (val, record, index) => {
                    return (
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
                title: intl.get(`bid.bidcommon.bid.title.TechnicalAndCommercialResponseDocuments`).d('技术、商务应答表'),
                dataIndex: 'answerFileName',
                width: 200,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (val, record) => {
                    return (
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
            }
        ];
        const listProps = {
            dataSource: fileSourceT,
            columns: fileSorce,
            pagination: biddingpPagination,
            loading: fetchSourceList,
            onChange: this.fetchBiddingList,
        };
        const fileProps = {
            dataSource: fileSource,
            columns: fileColumns,
            pagination: bidPagination,
            loading: fetchSourceTList,
            onChange: this.getFileList,
        };
        listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
        fileProps.scroll = { x: sum(fileProps.columns.map((n) => n.width)) + 300 };
        return (
            <Fragment>
                <Content>
                    <Table bordered {...listProps} />
                    <Modal
                        title={intl.get(`bid.bidcommon.view.title.viewdocument`).d('查看文件')}
                        visible={fileModel}
                        cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
                        okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                        onOk={this.handleOk}
                        width={800}
                        onCancel={this.handleCancel}
                    >
                        <Table bordered {...fileProps} />
                    </Modal>
                </Content>
            </Fragment>
        );
    }
}
