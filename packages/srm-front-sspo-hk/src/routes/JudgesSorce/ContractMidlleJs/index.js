/**
 * index.js - 技术应答表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Table, Form, Select, Tooltip } from 'hzero-ui';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import { createPagination } from 'hzero-front/lib/utils/utils';
import styles from '../index.less';
import formatterCollections from 'utils/intl/formatterCollections';

let newAnswerSource = [];

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
    fetchSourceList: loading.effects['contractJudgesSorce/getAnswerListJs'],
    contractJudgesSorce,
}))
@formatterCollections({
    code: ['bid.bidcommon', 'bid.biddashbord']
})
@Form.create({ fieldNameProp: null })

export default class ContractMidlleJs extends Component {
    constructor(props) {
        super(props);
        const { } = this.props;
        this.state = {
            milestoneId: '',
        };
    }
    componentDidMount() {
        this.getAnswerTable(); // 查询数据
    }

    /**
     * getAnswerTable - 技术应答表
     */
    @Bind()
    getAnswerTable(milestoneId, page = {}) {
        const { dispatch, match } = this.props;
        dispatch({
            type: 'contractJudgesSorce/getAnswerListJs',
            payload: {
                page,
                milestoneId: milestoneId !== undefined ? milestoneId : -1,
                proId: match.params.proId, // 测试proId：3
                state: 0, //技术应答表
            },
        }).then((res) => {
            if (res) {
                const { content = [] } = res.page;
                const newDataSource = content.map((item) => ({
                    ...item,
                    _status: 'update',
                }));
                dispatch({
                    type: 'contractJudgesSorce/updateState',
                    payload: {
                        answerSourceJs: newDataSource,
                        milestonesJs: res.milestones,
                        answerJsPaginationJs: createPagination(res.page),
                    },
                });
                this.setState({ milestoneId: milestoneId !== undefined ? milestoneId : res.milestones[0].milestoneId })
            }
        });
        this.props.onChangeFlag()
    }

    @Bind
    handleChangeFormItem(milestoneId) {
        this.setState({ milestoneId: milestoneId })
        this.getAnswerTable(milestoneId);
    }

    render() {
        const {
            fetchSourceList,
            contractJudgesSorce,
            form = {},
        } = this.props;
        const { answerSourceJs = [], milestonesJs = [], answerJsPaginationJs = {}, enumMap = {} } = contractJudgesSorce;
        const { yesNO = [] } = enumMap;
        const { getFieldDecorator } = form;
        const { milestoneId } = this.state;
        const columns = [
            {
                title: intl.get(`bid.biddashbord.view.title.clause`).d('大条款'),
                dataIndex: 'clause',
                fixed: 'left',
                width: 150,
                render: (val, record) => (
                    <Tooltip placement="topLeft" title={record.clause}>
                        <span>{record.clause}</span>
                    </Tooltip>
                )
            },
            {
                title: intl.get(`bid.bidcommon.view.title.clauseitems`).d('细节条款'),
                dataIndex: 'clauseDetail',
                fixed: 'left',
                width: 200,
                render: (val, record) => (
                    <Tooltip placement="topLeft" title={record.clauseDetail}>
                        <span>{record.clauseDetail}</span>
                    </Tooltip>
                )
            },
            {
                title: intl.get(`bid.bidcommon.view.title.keyindicators`).d('是否关键指标'),
                dataIndex: 'isLowestRequire',
                fixed: 'left',
                width: 120,
                render: (val, record) => {
                    yesNO.map((item) => {
                        if (item.value === record.isLowestRequire) {
                            record.isLowestRequire = item.meaning
                        }
                    })
                    return (
                        <Tooltip placement="topLeft" title={record.isLowestRequire}>
                            <span>{record.isLowestRequire}</span>
                        </Tooltip>
                    )
                }
            }
        ];
        if (answerSourceJs.length > 0) {
            answerSourceJs[0].list.map((item, i) => {
                columns.push({
                    key: `${item.supplierName}`,
                    title: `${item.supplierName}` != 'null' ? `${item.supplierName}` : '',
                    children: [
                        {
                            title: intl.get(`bid.bidcommon.view.title.response`).d('应答情况'),
                            // dataIndex: `${v[answerIndex] != undefined && v[answerIndex].answerCondition}`,
                            render: (_, row) => {
                                if (row.list != undefined) {
                                    return (
                                        <span>{row.list[i].answerCondition}</span>
                                    )
                                }
                            },
                        },
                        {
                            title: intl.get(`bid.bidcommon.bid.title.DeviationDescription`).d('偏离情况说明'),
                            // dataIndex: `${v[answerIndex] != undefined && v[answerIndex].deviationRemark}`,
                            render: (_, row) => {
                                if (row.list != undefined) {
                                    return (
                                        <Tooltip placement="topLeft" title={row.list[i].deviationRemark}>
                                            <span>{row.list[i].deviationRemark}</span>
                                        </Tooltip>
                                    )
                                }
                            }
                        }
                    ],
                })
            })
        }
        const otherListProps = {
            dataSource: answerSourceJs,
            columns,
            pagination: answerJsPaginationJs,
            contractJudgesSorce,
            loading: fetchSourceList,
            onChange: (page) => this.getAnswerTable(milestoneId !== '' ? milestoneId : -1, page),
        };
        otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
        return (
            <Fragment>
                <Content>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            marginRight: '10px',
                            color: '#666',
                            fontSize: '14px',
                            marginBottom: '14px'
                        }}>
                            {intl.get(`bid.bidcommon.view.title.round`).d('轮次：')}
                        </div>
                        <Form.Item>
                            {getFieldDecorator('round', {
                                initialValue: milestonesJs.length > 0 && milestonesJs[0].milestoneId
                            })(
                                <Select allowClear style={{ width: 150 }}
                                    defaultValue={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                                    onChange={(e) => this.handleChangeFormItem(e)} >
                                    {milestonesJs.map(n => (
                                        <Select.Option key={n.milestoneId} value={n.milestoneId}>
                                            {n.round}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    </div>
                    <Table bordered {...otherListProps} />
                </Content>
            </Fragment>
        );
    }
}
