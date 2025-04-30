/**
 * index.js - 报价文件
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
import UploadFile from '../../TechnicalMerit/UploadFile';
import styles from '../index.less';
import formatterCollections from 'utils/intl/formatterCollections';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
    fetchSourceList: loading.effects['contractJudgesSorce/getPriceFileList'],
    contractJudgesSorce,
}))
@formatterCollections({
    code: ['bid.bidcommon']
})

export default class PriceDocuments extends Component {
    constructor(props) {
        super(props);
        const { } = this.props;
        this.state = { };
    }
    componentDidMount() {
        this.fetchPriceList(); // 查询数据
    }
    /**
     * fetchPriceList - 查询报价文件表格信息
     * @param {object} params - 查询条件
     */
    @Bind()
    fetchPriceList(page = {}) {
        const { dispatch, match } = this.props;
        dispatch({
            type: 'contractJudgesSorce/getPriceFileList',
            payload: {
                page,
                proId: match.params.proId,
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
                        priceFiles: newDataSource,
                        pricePagination: createPagination(res),
                    },
                });
            }
        });
    }

    render() {
        const {
            fetchSourceList,
            contractJudgesSorce,
        } = this.props;
        const { priceFiles = [], pricePagination = {} } = contractJudgesSorce;
        const fileSorce = [
            {
                title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
                dataIndex: 'supplierName',
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
                        <UploadFile
                            onUploadSuccess={(item) => onUploadSuccess(item, record)}
                            tableName="SPUC_PO_CON_ATTACH"
                            parentId={record.gatherFileDTOS}
                            value={record.gatherFileDTOS}
                            disabled
                        />
                    )
                }
            },
        ];
        const listProps = {
            dataSource: priceFiles,
            columns: fileSorce,
            pagination: pricePagination,
            loading: fetchSourceList,
            onChange: this.fetchPriceList,
        };
        listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
        return (
            <Fragment>
                <Content>
                    <Table bordered {...listProps} />
                </Content>
            </Fragment>
        );
    }
}
