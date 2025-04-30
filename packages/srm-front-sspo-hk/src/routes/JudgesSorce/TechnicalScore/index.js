/**
 * index.js - 技术评分表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Form, Select, Input, Row, Col, Upload, Modal, Tooltip, Table } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import classnames from 'classnames';
import { Bind, Debounce } from 'lodash-decorators';
import { SRM_BID } from '@/common/config';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getEditTableData, getCurrentOrganizationId, createPagination, getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';
import styles from './index.less';
import saveIcon from '@/assets/buttonIcons/保存.png';
import submitIcon from '@/assets/buttonIcons/提交.png';
import importIcon from '@/assets/buttonIcons/导入.png';
import exportIcon from '@/assets/buttonIcons/导出.png';
import formatterCollections from 'utils/intl/formatterCollections';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

let newSaveScore = []; // 查询后放初始查询的所有数据源

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
    judgesSorceList: loading.effects['contractJudgesSorce/getTechnical'],
    passListLoading: loading.effects['contractJudgesSorce/getPassFrame'],
    saveLoading: loading.effects['contractJudgesSorce/saveScore'],
    submitLoading: loading.effects['contractJudgesSorce/submitScore'],
    contractJudgesSorce,
}))
@formatterCollections({
    code: ['bid.bidcommon']
})
@Form.create({ fieldNameProp: null })

export default class TechnicalScore extends Component {
    constructor(props) {
        super(props);
        const {
            // match
        } = this.props;
        this.state = {
            newDatasource: [],
            saveFlag: false, // 是否点击了保存
            saveScore: [], // 保存的数据
            code: 'BID_SCORECONFIG',
            upload: false,
            fileList: [],
            visible: false,
            messageVisible: false,
            submitState: false, // 是否已经提交
            paStating: false, // 默认进来禁止编辑，评委确认供应商通过且采购确认完才允许编辑表格
            passModal: false,
            groupUnsaveFlag: false,
        };
    }
    componentDidMount() {
        const { paStatus } = this.props;
        this.fetchScoreTable(); // 查询数据
        if (paStatus === 'n') {
            this.setState({ paStating: false })
        } else {
            this.setState({ paStating: true })
        }
    }
    /**
     * fetchScoreTable - 查询技术评分表格信息
     */
    @Bind()
    @Debounce(200)
    fetchScoreTable() {
        const { dispatch, match } = this.props;
        dispatch({
            type: 'contractJudgesSorce/getTechnical',
            payload: {
                proId: match.params.proId,
                // page,
            },
        }).then((res) => {
            if (res) {
                // const { content = [] } = res;
                // const pagination = createPagination(res);
                if (res.length > 0) {
                    const newDataSource = res.map((item) => ({
                        ...item,
                        _status: 'update',
                    }));
                    dispatch({
                        type: 'contractJudgesSorce/updateState',
                        payload: {
                            judgesSorceDataSource: [...newDataSource, {}, {}],
                            // judgesSorcePagination: pagination,
                        },
                    });
                    this.setState({ newDatasource: [...newDataSource] })
                    let lists = [];
                    this.props.contractJudgesSorce.judgesSorceDataSource.map((item) => {
                        lists.push(item.list)
                    })
                    if (lists.length > 0) {
                        for (let j = 0; j < lists.length; j++) {
                            let total = 0;
                            for (let i = 0; i < lists.length; i++) {
                                if (newDataSource[i] !== undefined && newDataSource[i].list !== undefined && newDataSource[i].list[j] !== undefined) {
                                    total += Number(newDataSource[i].list[j].answerGetScore)
                                    newDataSource[i].list[j].total = total
                                }
                            }
                        }
                        dispatch({
                            type: 'contractJudgesSorce/updateState',
                            payload: {
                                judgesSorceDataSource: [...newDataSource, {}, {}],
                                // judgesSorcePagination: pagination,
                            },
                        });
                    }
                }
                this.setState({ groupUnsaveFlag: false })
                if (res[0] && res[0].submit === true) {
                    this.setState({ submitState: true })
                }
            }
        })
    }

    // 显示供应商的通过与否弹框
    @Bind
    handlePass() {
        this.getPassFrame();
        this.setState({ passModal: true });
    }

    /**
     * 查询供应商允许评分状态
    */
    @Bind
    getPassFrame(page = {}) {
        const { dispatch, match } = this.props;
        dispatch({
            type: 'contractJudgesSorce/getPassFrame',
            payload: {
                // page,
                proId: match.params.proId,
                all: 'NO'
            },
        }).then((res) => {
            if (res) {
                const newDataSource = res[0].supplierList.map((item) => ({
                    ...item,
                    _status: 'update',
                }));
                dispatch({
                    type: 'contractJudgesSorce/updateState',
                    payload: {
                        passStatus: newDataSource,
                        passPagination: createPagination(res[0].supplierList),
                    },
                });
            }
        })
    }

    /**
     * 是否允许供应商继续评分
    */
    @Bind
    supplierPass() {
        const { dispatch, match, contractJudgesSorce: { passStatus } } = this.props;
        // validateEditTableDataSource(passStatus){
        //     if (dataSource.length === 0) {
        //       return dataSource;
        //     }
        // };
        let newData = [];
        passStatus.map((item) => {
            newData.push({
                supplierId: item.supplierId,
                unqualifiedSupplier: item.unqualifiedSupplier
            })
        })
        dispatch({
            type: 'contractJudgesSorce/supplierPass',
            payload: {
                proId: match.params.proId,
                passList: [...newData]
            },
        }).then((res) => {
            if (res.message === 'ok') {
                notification.success();
                this.setState({ status: false, passModal: false });
            }
        })
    }

    /**
     * 保存
     */
    @Debounce(300, { leading: true })
    @Bind()
    handleSave() {
        const { dispatch, match, contractJudgesSorce } = this.props;
        const { judgesSorceDataSource = [] } = contractJudgesSorce;
        const saveDate = [...getEditTableData(judgesSorceDataSource).map((item) =>
            item.list
        )];
        let scoreInfo = [];
        for (let i = 0; i < saveDate.length; i++) {
            // for (let j = 0; j < saveDate[i].length; j++) {
            scoreInfo.push(...saveDate[i])
            // }
        }
        for (let j = 0; j < scoreInfo.length; j++) {
            scoreInfo[j].proId = match.params.proId;
        }
        if (saveDate.length > 0) {
            dispatch({
                type: 'contractJudgesSorce/saveScore',
                payload: {
                    scoreInfo
                },
            }).then((res) => {
                if (res.message === 'ok') {
                    notification.success({
                        message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
                    });
                    this.fetchScoreTable()
                    this.setState({ saveFlag: true })
                } else {
                    notification.error({
                        message: intl.get(`bid.bidcommon.view.title.scoreoutofrange`).d('分数不在设置范围')
                    })
                }
            })
        }
    }
    /**
     * 提交
     */
    @Bind()
    handleSubmit() {
        const { dispatch, match, contractJudgesSorce } = this.props;
        const { judgesSorceDataSource = [] } = contractJudgesSorce;
        const { saveFlag } = this.state;
        if (!saveFlag) {
            const saveDate = [...getEditTableData(judgesSorceDataSource).map((item) =>
                item.list
            )];
            let scoreInfo = [];
            for (let i = 0; i < saveDate.length; i++) {
                scoreInfo.push(...saveDate[i])
            }
            for (let j = 0; j < scoreInfo.length; j++) {
                scoreInfo[j].proId = match.params.proId;
            }
            if (saveDate.length > 0) {
                dispatch({
                    type: 'contractJudgesSorce/saveScore',
                    payload: {
                        scoreInfo
                    },
                }).then((res) => {
                    if (res.message === 'ok') {
                        dispatch({
                            type: 'contractJudgesSorce/submitScore',
                            payload: {
                                proId: match.params.proId,
                            },
                        }).then(() => {
                            this.fetchScoreTable()
                            this.setState({ saveFlag: false })
                            notification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
                        })
                    } else {
                        notification.error({
                            message: intl.get(`bid.bidcommon.view.title.scoreoutofrange`).d('分数不在设置范围')
                        })
                    }
                })
            }
        } else {
            if (judgesSorceDataSource.length > 0) {
                dispatch({
                    type: 'contractJudgesSorce/submitScore',
                    payload: {
                        proId: match.params.proId,
                    },
                }).then(() => {
                    this.fetchScoreTable();
                    this.setState({ saveFlag: false })
                    notification.success({
                        message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功'),
                    });
                });
            }
        }
        this.setState({ saveFlag: false, groupUnsaveFlag: false })
    }

    /**
     * 理由的编辑值改变
    */
    @Bind
    uploadScore(record, k, index, val) {
        const { dispatch, contractJudgesSorce: { judgesSorceDataSource } } = this.props;
        record.list[k].answerGetScore = val.target.value
        // judgesSorceDataSource[index].list[k].answerGetScore = record.$form.getFieldValue(`${record.list[k].supplierId}score`)
        let newDataSource = [...judgesSorceDataSource];
        let lists = [];
        judgesSorceDataSource.map((item) => {
            lists.push(item.list)
        })
        if (lists.length > 0) {
            for (let j = 0; j < lists.length; j++) {
                let total = 0;
                for (let i = 0; i < lists.length; i++) {
                    if (newDataSource[i] !== undefined && newDataSource[i].list !== undefined && newDataSource[i].list[j] !== undefined) {
                        total += Number(newDataSource[i].list[j].answerGetScore)
                        newDataSource[i].list[j].total = total
                    }
                }
            }
        }
        dispatch({
            type: 'contractJudgesSorce/updateState',
            payload: {
                judgesSorceDataSource: [...newDataSource],
            },
        });
    }

    @Bind
    uploadData(record, k, index) {
        this.props.contractJudgesSorce.judgesSorceDataSource[index].list[k].answerGetReason = record.$form.getFieldValue(`${record.list[k].supplierId}`)
    }

    @Bind
    uploadSorceData(record, k, index, val) {
        const { dispatch, contractJudgesSorce: { judgesSorceDataSource } } = this.props;
        record.list[k].answerGetScore = val
        let newDataSource = [...judgesSorceDataSource];
        let lists = [];
        judgesSorceDataSource.map((item) => {
            lists.push(item.list)
        })
        if (lists.length > 0) {
            for (let j = 0; j < lists.length; j++) {
                let total = 0;
                for (let i = 0; i < lists.length; i++) {
                    if (newDataSource[i] !== undefined && newDataSource[i].list !== undefined && newDataSource[i].list[j] !== undefined) {
                        total += Number(newDataSource[i].list[j].answerGetScore)
                        newDataSource[i].list[j].total = total
                    }
                }
            }
        }
        dispatch({
            type: 'contractJudgesSorce/updateState',
            payload: {
                judgesSorceDataSource: [...newDataSource],
            },
        });
    }

    @Bind
    changeChosen(record, index) {
        const { contractJudgesSorce: { passStatus } } = this.props;
        passStatus[index].unqualifiedSupplier = record.$form.getFieldValue(`unqualifiedSupplier`)
    }
    isJSON(str) {
        let result;
        try {
            result = JSON.parse(str);
        } catch (e) {
            return false;
        }
        return isObject(result) && !isString(result);
    }
    @Bind
    handleImport() {
        this.setState({
            visible: true,
        });
    }
    @Bind
    beforeUpload(file) {
        const {
            match,
            dispatch
        } = this.props;
        const formData = new FormData();
        formData.append('excel', file, file.name);
        if (file.uid) {
            const url = `${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-score-config-answers?proId=${match.params.proId}`;
            this.setState({
                uploadLoading: true,
            });
            dispatch({
                type: 'contractJudgesSorce/goImport',
                payload: {
                    exportInfo: {
                        proId: match.params.proId,
                        organizationId: getCurrentOrganizationId()
                    },
                    file: formData,
                }
            }).then(res => {
                let mess = JSON.parse(res);
                this.fetchScoreTable();
                if (mess.message === 'err') {
                    notification.error({
                        message: intl.get(`bid.bidcommon.view.title.scoreoutofrange`).d('存在分数超出设置范围'),
                    });
                } else if (mess.message === 'ok') {
                    this.fetchScoreTable();
                    notification.success({
                        message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
                    });
                } else if (mess.message === 'overlong') {
                    // 分数最大300，理由最大字符1000
                    notification.success({
                        message: intl.get(`bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist`).d('当前列表中不得超出最大长度1000字符'),
                    });
                } else {
                    notification.success({
                        message: intl.get(`bid.bidcommon.view.title.inporterror`).d('传入数据有误或者文件类型不匹配'),
                    });
                }
                // setTimeout(() => {
                //     if (mess.message === 'ok') {
                //         if (this.state.submitState) {
                //             notification.success({ message: intl.get('bid.bidcommon.view.message.uploadsuccessfully').d('导入成功') });
                //         } else {
                //             notification.success({ message: mess.message });
                //         }
                //     } else {
                //         notification.success({ message: mess.message });
                //     }
                // }, 500);
            }).finally(() => {
                this.setState({
                    uploadLoading: false,
                });
            });
        }
        return false;
    }
    // 取消
    @Bind
    handleCancel() {
        this.setState({
            visible: false,
            messageVisible: false,
            fileList: [],
            message: '',
            passModal: false,
        });
    }

    // 导出
    @Bind
    handleExport(event) {
        event.preventDefault();
        event.stopPropagation();
        const { dispatch, match } = this.props;
        dispatch({
            type: 'contractJudgesSorce/goExport',
            payload: {
                exportInfo: {
                    proId: match.params.proId,
                    organizationId: getCurrentOrganizationId()
                }
            }
        }).then(res => {
            // 创建下载的链接
            const url = window.URL.createObjectURL(new Blob([res],
                // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const location = document.createElement('a');
            location.style.display = 'none';
            const fileName = "技术评分表导出.xlsx";
            location.download = fileName;
            location.href = url;
            document.body.appendChild(location);
            location.click();
            // 释放的 URL 对象以及移除 a 标签
            URL.revokeObjectURL(location.href);
            document.body.removeChild(location);
        });
    }

    @Bind
    handleOk() {
        const { priceEntry, upload } = this.state;
        const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面;
        if (upload) {
            openTab({
                title: intl.get(`${promptCode}.entry.input.title`).d('价格数据录入'),
                key: `${isPub ? '/pub' : ''}${SRM_BID}/price-entry/detail/${priceEntry.priceGroupId}`,
                path: `${isPub ? '/pub' : ''}${SRM_BID}/price-entry/detail/${priceEntry.priceGroupId}`,
                icon: 'edit',
                closable: true,
            });
        }
        this.setState({
            messageVisible: false,
            visible: false,
            message: '',
            fileList: [],
            upload: false,
        });
    }

    /**
     * 监听编辑事件，更改当前未保存状态
     */
    @Bind
    handleDataChange() {
        const { groupUnsaveFlag } = this.state;
        if (!groupUnsaveFlag) {
            const { onEdit = (e) => e } = this.props;
            onEdit(true);
        }
    }

    /**
     * 监听分页变化，判断是否有未保存的数据
     */
    @Bind
    handlePageChange(page) {
        const { groupUnsaveFlag } = this.state;
        if (groupUnsaveFlag) {
            Modal.confirm({
                title: intl
                    .get('bid.bidcommon.view.message.confirmgetout')
                    .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
                onOk: () => {
                    this.fetchScoreTable();
                },
            });
        } else {
            this.fetchScoreTable(page);
        }
    }

    render() {
        const {
            judgesSorceList,
            passList,
            saveLoading,
            passListLoading,
            submitLoading,
            contractJudgesSorce,
            form = {},
            basicInfo
        } = this.props;
        const {
            judgesSorceDataSource = [],
            judgesSorcePagination = {},
            passStatus = [],
            passPagination = {},
            enumMap = {},
        } = contractJudgesSorce;
        const { passModal, paStating } = this.state;
        const uploadProps = {
            accept: '.xls,.xlsx,.csv',
            beforeUpload: this.beforeUpload,
            showUploadList: false,
        };
        const { yesNo = [], scoreType = [], scoreType1 = [], status = [] } = enumMap;
        // 查询所有数据后获取每个对象里的list
        let lists = []
        judgesSorceDataSource.map((item) => {
            lists.push(item.list)
        })
        let newDataList = []; // 查询后放初始查询的list数据
        let newDatasource; // newDatasource:为添加总分和权重添加两个空数据的数组
        newDatasource = [...judgesSorceDataSource]
        if (judgesSorceDataSource.length > 0) {
            // newDataList = judgesSorceDataSource[0].list
            // newDatasource = [
            //     ...judgesSorceDataSource,
            //     {}, {}
            // ]
            newDataList = judgesSorceDataSource[0].list
            newDatasource = [...judgesSorceDataSource]
        }
        // else {
        //     newDatasource = [...judgesSorceDataSource]
        // }
        const sorceList = judgesSorceDataSource.length > 0 ? [
            {
                title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
                dataIndex: 'scoreClause',
                width: 150,
                fixed: 'left',
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (text, row, index) => {
                    if (index < newDatasource.length - 2) {
                        return (
                            <Tooltip placement="topLeft" title={row.scoreClause}>
                                <span>{row.scoreClause}</span>
                            </Tooltip>
                        )
                    } else if (index == newDatasource.length - 2) {
                        return {
                            children: <span>{intl.get(`bid.bidcommon.view.title.totalscore`).d('总分(百分制)')}</span>,
                            props: {
                                colSpan: 2,
                            },
                        };
                    } else if (index == newDatasource.length - 1) {
                        return {
                            children: <span>{intl.get(`bid.bidcommon.view.title.proportion`).d('加权得分') + '（' + `${basicInfo.tenRate || basicInfo.technicalProportion}` + '%' + '）'}</span>,
                            props: {
                                colSpan: 2,
                            },
                        };
                    }
                },
            },
            {
                title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
                dataIndex: 'clauseDetail',
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                width: 150,
                fixed: 'left',
                render: (text, row, index) => {
                    if (index < newDatasource.length - 2) {
                        return (
                            <Tooltip placement="topLeft" title={row.clauseDetail}>
                                <span>{row.clauseDetail}</span>
                            </Tooltip>
                        )
                    } else if (index == newDatasource.length - 2) {
                        if (getCurrentLanguage() === 'zh_CN') {
                            return {
                                children: <span>100{intl.get(`bid.bidcommon.view.title.point`).d('分')}</span>,
                                props: {
                                    colSpan: 3
                                },
                            }
                        } else {
                            return {
                                children: <span style={{fontWeight: 'bold', fontSize: '15px'}}>100</span>,
                                props: {
                                    colSpan: 3
                                },
                            }
                        }
                    }
                    // 技术评分比例:tenRate
                    else if (index == newDatasource.length - 1) {
                        if (getCurrentLanguage() === 'zh_CN') {
                            return {
                                children: <span>{(100 * (basicInfo.tenRate || basicInfo.technicalProportion) / 100).toFixed(2) + intl.get(`bid.bidcommon.view.title.point`).d('分')}</span>,
                                props: {
                                    colSpan: 2 * lists.length + 5,
                                },
                            }
                        } else {
                            return {
                                children: <span style={{fontWeight: 'bold', fontSize: '15px'}}>{(100 * (basicInfo.tenRate || basicInfo.technicalProportion) / 100).toFixed(2)}</span>,
                                props: {
                                    colSpan: 2 * lists.length + 5,
                                },
                            }
                        }
                    }
                }
            },
            {
                title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
                key: 'score',
                dataIndex: 'score',
                width: 80,
                fixed: 'left',
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (text, record, index) => {
                    if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
                        return {
                            props: {
                                colSpan: 0,
                            },
                        }
                    } else {
                        return (
                            <span style={{ 'color': '#333333' }}>{record.score}</span>
                        )
                    }
                }
            },
            {
                title: intl.get(`bid.bidcommon.view.title.objective`).d('是否客观分'),
                dataIndex: 'isObjectiveScore',
                width: 80,
                fixed: 'left',
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                render: (row, record, index) => {
                    if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
                        return {
                            props: {
                                colSpan: 0,
                            },
                        }
                    } else {
                        yesNo.map((item) => {
                            if (item.meaning === record.isObjectiveScore) {
                                record.isObjectiveScore = item.meaning
                            }
                        })
                        return (
                            <span>{record.isObjectiveScore}</span>
                        )
                    }
                }
            },
            // {
            //     title: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
            //     dataIndex: 'scoreType',
            //     width: 150,
            //     fixed: 'left',
            //     onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            //     render: (text, record, index) => {
            //         if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
            //             return {
            //                 props: {
            //                     colSpan: 0,
            //                 },
            //             }
            //         } else {
            //             scoreType && scoreType.map((item) => {
            //                 if (item.meaning === record.scoreType) {
            //                     record.scoreType = item.meaning
            //                 }
            //             })
            //             scoreType1 && scoreType1.map((item) => {
            //                 if (item.meaning === record.scoreType) {
            //                     record.scoreType = item.meaning
            //                 }
            //             })
            //             return (
            //                 <Tooltip title={record.scoreType} placement='topLeft'>
            //                     <span>{record.scoreType}</span>
            //                 </Tooltip>
            //             )
            //         }
            //     }
            // },
            ...(newDataList).map((v, k) => {
                return {
                    key: `${k}`,
                    title: `${v.supplierName}`,
                    width: 250,
                    onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                    children: [
                        {
                            title: intl.get(`bid.bidcommon.view.title.scorefenshu`).d('分数'),
                            key: `${k}0`,
                            // dataIndex: `${v[k] != undefined && v[k].answerGetScore}`,
                            onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                            width: 100,
                            render: (text, record, index) => {
                                if (index < newDatasource.length - 2) {
                                    // if (record.$form != undefined) {
                                        if (record.scoreType === '客观计件式（一般计件-带下限值）' || record.scoreType === 'Objective piece count (general piece count - with lower limit)' ||
                                            record.scoreType === '客观计件式（一般计件-下限值=0）' || record.scoreType === 'Objective piece count (general piece count - with lower limit=0)' ||
                                            record.scoreType === '客观计件式（是非式）' || record.scoreType === 'Objective piece counting (yes or no)' ||
                                            record.scoreType === '客观计件式（负偏离扣分）' || record.scoreType === 'Objective piece counting (deduction for negative deviation)') {
                                            return (
                                                <Form.Item>
                                                    {record.$form.getFieldDecorator(`${record.list[k].supplierId}score`, {
                                                        initialValue: record.list[k].answerGetScore,
                                                        rules: [{
                                                            required: true,
                                                            message: intl.get('hzero.common.validation.notNull', {
                                                                name: intl
                                                                    .get(`bid.bidcommon.view.title.scorefenshu`)
                                                                    .d('分数'),
                                                            }),
                                                        }]
                                                    })(
                                                        <Select style={{ width: 100 }} 
                                                        disabled={record.submit || !paStating} 
                                                        onChange={(val) => this.uploadSorceData(record, k, index, val)}
                                                        >
                                                            {record.strings && record.strings.map((n) => (
                                                                <Select.Option key={n} value={n} >
                                                                    {n}
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    )}
                                                </Form.Item>
                                            );
                                        } else {
                                            return (
                                                <Form.Item>
                                                    {record.$form.getFieldDecorator(`${record.list[k].supplierId}score`, {
                                                        initialValue: record.list[k].answerGetScore,
                                                        rules: [{
                                                            required: true,
                                                            message: intl.get('hzero.common.validation.notNull', {
                                                                name: intl
                                                                    .get(`bid.bidcommon.view.title.scorefenshu`)
                                                                    .d('分数'),
                                                            }),
                                                        }]
                                                    })(
                                                        <Input style={{ width: 100 }} disabled={record.submit || !paStating} inputChinese={false}
                                                            onChange={(val) => this.uploadScore(record, k, index, val)} />
                                                    )}
                                                </Form.Item>
                                            );
                                        }
                                    // }
                                }
                                if (index === newDatasource.length - 2) {
                                    if (getCurrentLanguage() === 'zh_CN') {
                                        return {
                                            children: 
                                            <span>
                                                {newDatasource[newDatasource.length - 3].list[k].total === undefined ? (0).toFixed(2) : newDatasource[newDatasource.length - 3].list[k].total.toFixed(2)}
                                                {intl.get(`bid.bidcommon.view.title.point`).d('分')}
                                            </span>,
                                            props: {
                                                colSpan: 2,
                                            },
                                        };
                                    } else {
                                        return {
                                            children: 
                                            <span style={{fontWeight: 'bold', fontSize: '15px'}}>
                                                {newDatasource[newDatasource.length - 3].list[k].total === undefined ? (0).toFixed(2) : newDatasource[newDatasource.length - 3].list[k].total.toFixed(2)}
                                            </span>,
                                            props: {
                                                colSpan: 2,
                                            },
                                        };
                                    }
                                }
                                if (index === newDatasource.length - 1) {
                                    return {
                                        props: {
                                            colSpan: 0,
                                        },
                                    }
                                }
                            }
                        },
                        {
                            title: intl.get(`bid.bidcommon.bid.title.Reason`).d('理由'),
                            key: `${k}1`,
                            // dataIndex: `${v[k] != undefined && v[k].answerGetReason}`,
                            // onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                            with: 100,
                            render: (text, record, index) => {
                                if (index < newDatasource.length - 2) {
                                    // if (record.$form != undefined) {
                                        return (
                                            <Form.Item>
                                                <Tooltip placement="topLeft" title={record.list[k].answerGetReason}>
                                                    {record.$form.getFieldDecorator(`${record.list[k].supplierId}`, {
                                                        initialValue: record.list[k].answerGetReason,
                                                    })(
                                                        <Input disabled={record.submit || !paStating}
                                                            placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                                                            onChange={this.uploadData(record, k, index)} />
                                                    )}
                                                </Tooltip>
                                            </Form.Item>
                                        )
                                    // }
                                }
                                if (index === newDatasource.length - 2 || index === newDatasource.length - 1) {
                                    return {
                                        props: {
                                            colSpan: 0,
                                        },
                                    };
                                }
                            }
                        }
                    ],
                };
            }),
        ] : [
            {
                title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
                dataIndex: 'scoreClause',
                width: 150,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            },
            {
                title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
                dataIndex: 'clauseDetail',
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                width: 150,
            },
            {
                title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
                key: 'score',
                dataIndex: 'score',
                width: 80,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            },
            {
                title: intl.get(`bid.bidcommon.view.title.objective`).d('是否客观分'),
                dataIndex: 'isObjectiveScore',
                width: 80,
                onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            },
            // {
            //     title: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
            //     dataIndex: 'scoreType',
            //     width: 150,
            //     onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            // }
        ];
        const otherListProps = {
            form,
            dataSource: judgesSorceDataSource,
            columns: sorceList,
            pagination: false,
            // pagination: judgesSorcePagination,
            loading: judgesSorceList,
            rowHeight: 'auto',
            // onChange: (page) => this.handlePageChange(page),
            // onDataChange: this.handleDataChange,
            // onEdit: (flag) => {
            //     this.setState({
            //         groupUnsaveFlag: flag,
            //     });
            // },
            // className: classnames(styles['db-list']),
            // footer: () => {
            //     if (newDatasource.length > 0) {
            //         return (
            //             <Table
            //                 columns={footerColumns}
            //                 dataSource={footefDataSource}
            //                 showHeader={false}
            //                 pagination={false}
            //             >
            //             </Table>
            //         )
            //     }
            // },
        };
        const footerColumns = [{
            title: 'name',
            dataIndex: 'name',
            key: 'name',
            width: 300
        }, {
            title: 'sorce',
            dataIndex: 'sorce',
            key: 'sorce',
        }]
        const footefDataSource = [{
            name: intl.get(`bid.bidcommon.view.title.totalscore`).d('总分(百分制)'),
            sorce: '100' + intl.get(`bid.bidcommon.view.title.point`).d('分')
        }, {
            name: intl.get(`bid.bidcommon.view.title.proportion`).d('加权得分') + '（' + `${basicInfo.tenRate || basicInfo.technicalProportion}` + '%' + '）',
            sorce: (100 * (basicInfo.tenRate || basicInfo.technicalProportion) / 100).toFixed(2) + intl.get(`bid.bidcommon.view.title.point`).d('分')
        }]

        const listProps = {
            form,
            dataSource: passStatus,
            columns: [
                {
                    title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
                    dataIndex: 'supplierName',
                    width: 100,
                    render: (text, record) => {
                        return (
                            <Tooltip title={record.supplierName} placement='topLeft'>
                                <span>{record.supplierName}</span>
                            </Tooltip>
                        )
                    }
                },
                {
                    title: intl.get(`bid.bidcommon.view.title.status`).d('状态'),
                    dataIndex: 'unqualifiedSupplier',
                    width: 100,
                    onHeaderCell: () => ({ className: styles['table-thead-required'] }),
                    render: (text, record, index) => {
                        return (
                            <Form.Item>
                                {record.$form.getFieldDecorator(`unqualifiedSupplier`, {
                                    initialValue: record.unqualifiedSupplier,
                                    rules: [{
                                        required: true,
                                        message: intl.get('hzero.common.validation.notNull', {
                                            name: intl.get(`bid.bidcommon.view.title.status`).d('状态'),
                                        }),
                                    }]
                                })(
                                    <Select style={{ width: 100 }} >
                                        {status.map((n) => (
                                            <Select.Option key={n.value} value={n.value} onChange={this.changeChosen(record, index)}>
                                                {n.meaning}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            // pagination: passPagination,
            pagination: false,
            loading: passList,
        };
        otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };

        return (
            <Fragment>
                <Content>
                    <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
                        <Col span={24} className="customize-buttons" style={{display: 'flex', alignItems: 'baseline', justifyContent: 'end'}} >
                            <div>
                                <Button onClick={this.handlePass} disabled={paStating || (this.state.submitState && paStating)} loading={passListLoading}>
                                    <img src={submitIcon} style={{ width: '10px' }} />
                                    {intl.get(`bid.bidcommon.view.title.PreliminaryReview`).d('技术符合审查(初审)')}
                                </Button>
                                <div color='#a19b9b' 
                                    style={{
                                        fontSize: '12px',
                                        textAlign: 'center', 
                                        paddingLeft: '5px'}}
                                >
                                    {intl.get(`bid.bidcommon.view.title.judgeremind`).d('请评委先进行初审')}
                                </div>
                            </div>
                            <Upload {...uploadProps}>
                                <Button onClick={this.handleImport} disabled={this.state.submitState || !paStating}>
                                    <img src={importIcon} alt="" />
                                    {intl.get(`bid.bidcommon.view.button.import`).d('导入')}
                                </Button>
                            </Upload>
                            {/*  || !paStating */}
                            <Button onClick={(e) => this.handleExport(e)} disabled={this.state.submitState}>
                                <img src={exportIcon} alt="" />
                                {intl.get(`bid.bidcommon.view.button.export`).d('导出')}
                            </Button>
                            <Button onClick={this.handleSave} disabled={this.state.submitState || !paStating} loading={saveLoading}>
                                <img src={saveIcon} />
                                {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
                            </Button>
                            <Button onClick={this.handleSubmit} disabled={this.state.submitState || !paStating} loading={submitLoading}>
                                <img src={submitIcon} style={{ width: '10px' }} />
                                {intl.get(`bid.bidcommon.view.button.submit`).d('提交')}
                            </Button>
                        </Col>
                    </Row>
                    <EditTable bordered {...otherListProps} />
                    <Modal
                        title={intl.get('bid.bidcommon.view.title.importresults').d('导入结果')}
                        visible={this.state.messageVisible}
                        footer={null}
                        destroyOnClose
                        width={300}
                        style={{ top: 150 }}
                        className={styles.priceEntry}
                        onCancel={this.handleCancel}
                        cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
                        okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                marginTop: '10px',
                                marginBottom: '20px',
                                textAlign: 'center',
                            }}
                        >
                            {this.state.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Button
                                key="submit"
                                type="primary"
                                style={{ textAlign: 'center' }}
                                onClick={this.handleOk}
                            >
                                {intl.get(`bid.sure.view.title.sure`).d('确定')}
                            </Button>
                        </div>
                    </Modal>
                    <Modal
                        title={intl.get(`bid.bidcommon.view.title.PreliminaryReview`).d('技术符合审查(初审)')}
                        visible={passModal}
                        destroyOnClose
                        width='45%'
                        style={{ top: 150 }}
                        onCancel={this.handleCancel}
                        onOk={this.supplierPass}
                        cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
                        okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
                    >
                        <EditTable bordered {...listProps} ></EditTable>
                    </Modal>
                </Content>
            </Fragment>
        );
    }
}
