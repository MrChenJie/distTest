/**
 * index.js - 招标文件
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
import intl from 'utils/intl';
import { createPagination } from 'hzero-front/lib/utils/utils';
import UploadFile from '../UploadFile';
import styles from '../index.less';
import formatterCollections from 'utils/intl/formatterCollections';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
    fetchSourceList: loading.effects['contractJudgesSorce/getTenderList'],
    contractJudgesSorce,
}))
@formatterCollections({
    code: ['bid.bidcommon']
})

export default class TenderDocuments extends Component {
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
            type: 'contractJudgesSorce/getTenderList',
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
                    type: 'contractJudgesSorce/updateState',
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

    render() {
        const {
            fetchSourceList,
            contractJudgesSorce,
        } = this.props;
        const { tenderSource = [], tenderPagination = {} } = contractJudgesSorce;
        const {
            selectedRows = [],
            selectedRowKeys = [],
        } = this.state;
        const columns = [
            // {
            //     title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
            //     dataIndex: 'name',
            //     onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            // },
            {
                title: intl.get(`bid.bidcommon.view.title.documentcategory`).d('文件类别'),
                dataIndex: 'name',
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            },
            // {
            //     title: intl.get(`bid.bidcommon.view.title.uploadtime`).d('上传时间'),
            //     dataIndex: 'time',
            //     onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            // },
            {
                title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
                dataIndex: 'fileUrl',
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (val, record) => {
                    return (
                        <UploadFile
                            onUploadSuccess={(item) => onUploadSuccess(item, record)}
                            onDeleteSuccess={() => onDeleteSuccess(record)}
                            tableName="SPUC_PO_CON_ATTACH"
                            parentId={record.fileUrl}
                            value={record.fileUrl}
                            disabled
                        />
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
            contractJudgesSorce,
            loading: fetchSourceList,
            onChange: this.fetchTenderList
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
