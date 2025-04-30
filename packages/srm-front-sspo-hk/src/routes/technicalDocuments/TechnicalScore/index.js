/**
 * index.js - 技术评分表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Form, Select, Input, Row, Col } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import saveIcon from '@/assets/buttonIcons/保存.png';
import submitIcon from '@/assets/buttonIcons/提交.png';

let newSaveScore = []; // 查询后放初始查询的所有数据源

@connect(({ contractJudgesSorce = {} }) => ({
    judgesSorceDataSource: contractJudgesSorce.judgesSorceDataSource,
    contractJudgesSorce,
}))
@Form.create({ fieldNameProp: null })

export default class TechnicalScore extends Component {
    constructor(props) {
        super(props);
        const {
            // match
        } = this.props;
        this.state = {
            newDatasource: [],
            isSave: false, // 是否点击了保存
            saveScore: [], // 保存的数据
        };
    }
    componentDidMount() {
        this.fetchScoreTable(); // 查询数据
    }
    /**
     * fetchScoreTable - 查询技术评分表格信息
     */
    @Bind()
    fetchScoreTable(page = {}) {
        const { dispatch } = this.props;
        dispatch({
            type: 'contractJudgesSorce/getTechnical',
            payload: {
                proId: 15, // match.params.proId
                page,
            },
        }).then((res) => {
            if (res) {
                const { content = [] } = res;
                const pagination = createPagination(content);
                const newDataSource = content.map((item) => ({
                    ...item,
                    _status: 'update',
                }));
                dispatch({
                    type: 'contractJudgesSorce/updateState',
                    payload: {
                        judgesSorceDataSource: newDataSource,
                        judgesSorcePagination: pagination,
                    },
                  });
            }
        })
    }
    /**
     * 保存
     */
    @Bind()
    handleSave() {
        const { dispatch, contractJudgesSorce } = this.props;
        const { judgesSorceDataSource = [] } = contractJudgesSorce;
        console.log('getEditTableData(judgesSorceDataSource)', getEditTableData(judgesSorceDataSource))
        const saveDate = [...getEditTableData(judgesSorceDataSource).map((item) =>
            item.list
        )];
        let scoreInfo = [];
        for (let i = 0; i < saveDate.length; i++) {
            // for (let j = 0; j < saveDate[i].length; j++) {
            scoreInfo.push(...saveDate[i])
            // }
        }
        console.log('scoreInfo', scoreInfo)
        if (saveDate.length > 0) {
            dispatch({
                type: 'contractJudgesSorce/saveScore',
                payload: {
                    scoreInfo
                },
            }).then((res) => {
                if (res.message == 'ok') {
                    this.setState({
                        isSave: true
                    })
                    notification.success({
                        message: intl
                            .get(`bid.bidcommon.view.title.savesuccessfully`)
                            .d('保存成功'),
                    });
                    this.fetchScoreTable()
                }
            })
        }
    }
    /**
     * 提交
     */
    @Bind()
    handleSubmit(page = {}) {
        const { dispatch, match } = this.props;
        const { isSave } = this.state;
        if (isSave) {
            dispatch({
                type: 'contractJudgesSorce/submitScore',
                payload: {
                    proId: 3, // match.params.proId
                },
            }).then((res) => {
                notification.success({
                    message: intl
                        .get(`warning.message.createNeedAfterSave`)
                        .d('提交成功'),
                });
            });
        } else {
            notification.error({
                message: intl
                    .get(`warning.message.createNeedAfterSave`)
                    .d('请先进行保存'),
            });
        }
    }

    render() {
        const {
            fetchSourceList,
            contractJudgesSorce,
            deleteLinesLoading = false,
            pagination,
            form = {},
            match
        } = this.props;
        const {
            judgesSorceDataSource = [],
        } = contractJudgesSorce;
        // 查询所有数据后把judgesSorceDataSource放在新数组里面
        const { saveScore = [] } = judgesSorceDataSource.map((item) => {
            newSaveScore.push(item)
        })
        // 查询所有数据后获取每个对象里的list
        // let lists = []
        // const { list = [] } = judgesSorceDataSource.map((item) => {
        //     lists.push(item.list)
        // })
        // lists.map((items) => {
        //     newDataList.push(items)
        // })
        let newDataList = []; // 查询后放初始查询的list数据
        if (judgesSorceDataSource.length > 0 ){
            newDataList = judgesSorceDataSource[0].list

        }
        console.log("获取值", newDataList);
        // newDatasource:为添加总分和权重添加两个空数据的数组
        let newDatasource;
        if (judgesSorceDataSource.length > 0 && judgesSorceDataSource[0].purchaseType != 'invited_bidding' && judgesSorceDataSource[0].purchaseType != 'public_bidding') {
            newDatasource = [
                ...judgesSorceDataSource,
                {
                    // clauseDetail: '',
                    // isObjectiveScore: '',
                    // list: [{ supplierName: '', answerGetReason: '', answerGetScore: '', examineResult: '' }],
                    // purchaseType: '',
                    // score: '',
                    // scoreClause: '',
                    // scoreType: '',
                    // setScore: '',
                    // socreConfigId: '',
                    // strings: [],
                }, {
                    // clauseDetail: '',
                    // isObjectiveScore: '',
                    // list: [{ supplierName: '', answerGetReason: '', answerGetScore: '', examineResult: '' }],
                    // purchaseType: '',
                    // score: '',
                    // scoreClause: '',
                    // scoreType: '',
                    // setScore: '',
                    // socreConfigId: '',
                    // strings: [],
                }
            ]
        } else {
            judgesSorceDataSource.length > 0 && console.log('aaaaaaaaaaaaaaaaaaa', judgesSorceDataSource[0].purchaseType == 'invited_bidding')
            newDatasource = [...judgesSorceDataSource]
        }
        const columns = [
            {
                title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('评审大项'),
                dataIndex: 'clauseDetail',
                render: (text, row, index) => {
                    if (row.purchaseType == "invited_bidding" || row.purchaseType == "public_bidding") {
                        if (row.$form != undefined) {
                            return (
                                <p>{row.clauseDetail}</p>
                            );
                        }
                    } else {
                        if (index < newDatasource.length - 2) {
                            return (
                                <p>{row.clauseDetail}</p>
                            )
                        }
                        if (index == newDatasource.length - 2) {
                            return {
                                children: <p>{intl.get(`view.title.totalscore`).d('总分(百分制)')}</p>,
                                props: {
                                    colSpan: 2,
                                },
                            };
                        }
                        if (index == newDatasource.length - 1) {
                            return {
                                children: <p>{intl.get(`view.title.proportion`).d('权重')}</p>,
                                props: {
                                    colSpan: 2,
                                },
                            };
                        }
                    }
                },
            },
            {
                title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('评分细则'),
                dataIndex: 'scoreClause',
                render: (text, row, index) => {
                    if (row.purchaseType == "invited_bidding" || row.purchaseType == "public_bidding") {
                        if (row.$form != undefined) {
                            return (
                                <p>{row.scoreClause}</p>
                            );
                        }
                    } else {
                        if (index < newDatasource.length - 2) {
                            return (
                                <p>{row.scoreClause}</p>
                            )
                        }
                        if (index == newDatasource.length - 2) {
                            return {
                                children: <p>100分</p>,
                                // props: {
                                // colSpan: 2 * lists.length + 3,
                                // },
                            }
                        }
                        // 技术评分比例:tenRate
                        if (index == newDatasource.length - 1 && this.props.contractJudgesSorce.judgesSorceDataSource.length != 0) {
                            return {
                                children: <p>{100 * this.props.contractJudgesSorce.judgesSorceDataSource[0].tenRate || 0}分</p>,
                                // props: {
                                // colSpan: 2 * lists.length + 3,
                                // },
                            }
                        }
                    }
                }
            },
            {
                title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('分值'),
                key: 'score',
                dataIndex: 'score',
            },
            {
                title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('分值类型'),
                dataIndex: 'scoreType',
            },
            {
                title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('是否客观分'),
                dataIndex: 'isObjectiveScore',
            },
            ...(newDataList).map((v, k) => {
                console.log("获取值", v, k);
                return {
                    key: `${k}`,
                    title: `${v!= undefined && v.supplierName}`,
                    children: [
                        {
                            title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('分数'),
                            key: `${k}0`,
                            dataIndex: `${v[k] != undefined && v[k].answerGetScore}`,
                            width: 75,
                            render: (text, row, b) => {
                                if (row.purchaseType == "invited_bidding" || row.purchaseType == "public_bidding") {
                                    if (row.$form != undefined) {
                                        console.log("row", row.list[b]);
                                        const { getFieldDecorator, getFieldValue } = row.$form;
                                        return (
                                            <Form.Item>
                                                {getFieldDecorator(`${row.list[b].supplierId}`, {
                                                    initialValue: row.list[b].answerGetScore,
                                                    rules: [{
                                                        required: false,
                                                        message: intl.get('hzero.common.validation.notNull', {
                                                            name: intl
                                                                .get(`ssrc.bidHall.model.bidHall.supplierCompanyName`)
                                                                .d('分数不能为空'),
                                                        }),
                                                    }]
                                                })(
                                                    <Select style={{ 'width': '100px' }}>
                                                        <Select.Option value={b}>20</Select.Option>
                                                    </Select>
                                                    //   <Select style={{ width: 100 }}>
                                                    //     {(code['BID.EXPERT_TYPE'] || []).map((n) => (
                                                    //       <Select.Option key={n.value} value={n.value}>
                                                    //         {n.meaning}
                                                    //       </Select.Option>
                                                    //     ))}
                                                    //   </Select>
                                                )}
                                            </Form.Item>
                                        )
                                    }
                                } else {
                                    if (k < newDatasource.length - 2) {
                                        if (row.$form != undefined) {
                                            const { getFieldDecorator, getFieldValue } = row.$form;
                                            return (
                                                <Form.Item>
                                                    {getFieldDecorator(`${row.list[b].supplierId}`, {
                                                        initialValue: row.list[b].answerGetScore,
                                                        rules: [{
                                                            required: false,
                                                            message: intl.get('hzero.common.validation.notNull', {
                                                                name: intl
                                                                    .get(`ssrc.bidHall.model.bidHall.supplierCompanyName`)
                                                                    .d('分数不能为空'),
                                                            }),
                                                        }]
                                                    })(
                                                        <Select style={{ 'width': '100px' }}>
                                                            <Select.Option value={b}>20</Select.Option>
                                                        </Select>
                                                    )}
                                                </Form.Item>
                                            );
                                        }
                                    }
                                }
                            }
                        },
                        {
                            title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('理由'),
                            key: `${k}1`,
                            dataIndex: `${v[k] != undefined && v[k].answerGetReason}`,
                            width: 75,
                            render: (text, record, index) => {
                                if (record.purchaseType == "invited_bidding" || record.purchaseType == "public_bidding") {
                                    if (record.$form != undefined) {
                                        const { getFieldDecorator } = record.$form;
                                        return (
                                            <Form.Item>
                                                {getFieldDecorator(`${record.list[index].answerGetReason}`, {
                                                    initialValue: record.list[index].answerGetReason,
                                                })(
                                                    <Input style={{ 'width': '150px' }} />
                                                )}
                                            </Form.Item>
                                        );
                                    }
                                } else {
                                    if (k < newDatasource.length - 2) {
                                        if (record.$form != undefined) {
                                            // const { getFieldDecorator } = record.$form;
                                            return (
                                                <Form.Item>
                                                    {record.$form.getFieldDecorator(`${record.list[k].answerGetReason}`, {
                                                        initialValue: record.list[k].answerGetReason,
                                                    })(
                                                        <Input onChange={() => {record.list[k].answerGetReason = record.$form.getFieldValue(`${record.list[index].answerGetReason}`) }} style={{ 'width': '150px' }} />
                                                    )}
                                                </Form.Item>
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    ],
                };
            }),
        ];
        const otherListProps = {
            form,
            dataSource: newDatasource,
            columns,
            pagination,
            contractJudgesSorce,
            // loading: fetchSourceList
        };
        otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
        return (
            <Fragment>
                <Content>
                    <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
                        <Col span={24} className="customize-buttons">
                            <Button onClick={this.handleSave}>
                                <img src={saveIcon} />
                                {intl.get('hzero.common.button.save').d('保存')}
                            </Button>
                            <Button onClick={this.handleSubmit}>
                                <img src={submitIcon} />
                                {intl.get('hzero.common.button.submit').d('提交')}
                            </Button>
                            {/* <Button onClick={this.handleSave}>
                                <img src={saveIcon} />
                                {intl.get('hzero.common.button.save').d('导入')}
                            </Button><Button onClick={this.handleSave}>
                                <img src={saveIcon} />
                                {intl.get('hzero.common.button.save').d('导出')}
                            </Button> */}
                        </Col>
                    </Row>
                    <EditTable bordered {...otherListProps} />
                </Content>
            </Fragment>
        );
    }
}
