/**
 * index.js - 新建项目-技术评分表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Row, Col, Upload, Modal, Select, Input, Form, InputNumber, Tooltip, Icon, Table } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { sum } from 'lodash';
import classnames from 'classnames';
import { Content } from 'components/Page';
import { getEditTableData } from 'utils/utils';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
} from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import ExcelExport from '@/components/ExcelExport';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import { SRM_BID } from '@/common/config';

import deleteIcon from '@/assets/buttonIcons/删除.png';
import importIcon from '@/assets/buttonIcons/导入.png';
import exportIcon from '@/assets/buttonIcons/导出.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import styles from './index.less';
import { downloadFile } from 'hzero-front/lib/services/api';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';

const organizationId = getCurrentOrganizationId();

let count = 0;
let newDataList = [];

@connect(({ loading = {}, contractMaintain = {} }) => ({
  fetchSourceList: loading.effects['contractMaintain/getTableList'],
  saveLoading: loading.effects['contractMaintain/updateTableList'],
  contractMaintain,
}))

@formatterCollections({
  code: ['bid.bidcommon']
})

@Form.create({ fieldNameProp: null })

export default class QuoteSourceResult extends Component {
  constructor(props) {
    newDataList = [];
    super(props);
    this.state = {
      dataSourceTest: [], // 技术评分表本地数据源
      technologySource: [
        {
          socreConfigId: '', // 导入后的保存不传这个id
          proId: '',
          scoreClause: "",
          clauseDetail: "",
          score: 0,
          scoreType: "",
          isObjectiveScore: '',
          setScore: "",
        }
      ],
      selectedRows: [],
      selectedRowKeys: [],
      fileUrl: '',
      upload: false,
      fileList: [],
      visible: false,
      messageVisible: false,
      code: 'BID.SCORE_CONFIGS',
      count: 0,
      listAll: {}, // 采购方式数据
      total: 0,
      // newSorceList: [],
      uniqueKey: Math.floor(Math.random() * 100000),
      groupUnsaveFlag: false,
      footerTotalSource: 0,
    };
  }
  componentDidMount() {
    this.fetchList(); // 查询数据
    newDataList = [];
  }

  componentWillMount() {
    newDataList = [];
  }

  componentWillUnmount() {
    newDataList = [];
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  @Debounce(200)
  fetchList() {
    const { dispatch, matchs } = this.props;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractMaintain/getTableList',
      payload: {
        proId: matchs.params.proId, //matchs.params.proId
      },
    }).then((res) => {
      if (res) {
        // const { content = [] } = res;
        // const pagination = createPagination(res);
        const newDataSource = res.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        // let newList = content.length > 0 ? [...newDataSource, { poOrderId: undefined }, { poOrderId: undefined }] : newDataSource;
        let newList = newDataSource
        this.setState({ dataSourceTest: newList, groupUnsaveFlag: false });
        dispatch({
          type: 'contractMaintain/updateState',
          payload: {
            technologySource: newList,
            // technologyPagination: pagination,
          },
        });
        let total = 0;
        for (let i in newList) {
          total += Number(newList[i].score)
        }
        this.setState({ footerTotalSource: total })
      }
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
    * 处理数据导入后的数据展示(保存)
    *
    * @memberof Import
    */
  @Bind()
  @Debounce(200)
  handleImportData(params) {
    const { dispatch, matchs, contractMaintain: { technologySource, technologyPagination, detailEnumMap } } = this.props;
    const { scoreType = [], scoreType1 = [], yesNo = [] } = detailEnumMap;
    request(`${SRM_BID}/v1/${organizationId}/import/data?templateCode=${params.templateCode}&batch=${params.batch}&size=500`, {
      method: 'GET'
    }
    ).then((res) => {
      if (res.content) {
        let newdata = []
        if (res.content.length > 0) {
          res.content.map((item) => {
            const listn = { ...JSON.parse(item._data) }
            const newList = {
              _status: 'update',
              poOrderId: uuidv4(),
              clauseDetail: listn.clauseDetail,
              isObjectiveScore: listn.isObjectiveScore,
              proId: matchs.params.proId,
              score: listn.score,
              scoreClause: listn.scoreClause,
              scoreType: listn.scoreType,
              setScore: listn.setScore,
            }
            newdata.push(newList)
          })
          if (newdata.length > 50) {
            this.setState({
              uploadLoading: false,
            });
            notification.error({ message: '单次导入不能超过50条，超出不做保存' })
            return;
          } else {
            // 导入后校验总分是否是100
            let totalScore = 0;
            newdata.map((item) => {
              if (item.score !== '' && item.score !== undefined) {
                totalScore += Number(item.score)
              }
            })
            technologySource.map((item, index) => {
              if (item.score !== '' && item.score !== undefined) {
                totalScore += Number(this.props.contractMaintain.technologySource[index].$form.getFieldValue('score'))
              }
            })
            if (totalScore !== 100) {
              notification.warning({
                message: intl.get('bid.bidcommon.view.title.scoreconfirma') + totalScore + intl.get('bid.bidcommon.view.title.scoreconfirmb'),
              });
              // return;
            } else {
              // 循环值集
              yesNo.map((item) => {
                newdata.map((ite) => {
                  if (item.meaning === ite.isObjectiveScore) {
                    ite.isObjectiveScore = item.value
                  }
                })
              })
              scoreType.map((item) => {
                newdata.map((ite) => {
                  if (item.meaning === ite.scoreType) {
                    ite.scoreType = item.value
                  }
                })
              })
              scoreType1.map((item) => {
                newdata.map((ite) => {
                  if (item.meaning === ite.scoreType) {
                    ite.scoreType = item.value
                  }
                })
              })
              // const newdataList = technologySource.length > 0 ? [...newdata, ...technologySource] : [...newdata, ...technologySource, {}, {}];
              const newdataList = [...newdata, ...technologySource]
              dispatch({
                type: 'contractMaintain/updateState',
                payload: {
                  technologySource: newdataList,
                  // technologyPagination: createPagination({
                  //   number: 0,
                  //   size: newdataList.length,
                  //   totalElements: newdataList.length
                  // }),
                },
              });
              // this.setState({ technologySource: newdataList })
              this.handleSave();
            }
          }
          this.setState({
            uploadLoading: false,
          });
        } else {
          setTimeout(()=>{ 
            this.handleImportDataTwo(params)},500)
          // notification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
        }
      }
    })
  }

  /**
    * 处理数据导入后的数据展示(保存)二次
    *
    * @memberof Import
    */
   @Bind()
   @Debounce(200)
   handleImportDataTwo(params) {
     const { dispatch, matchs, contractMaintain: { technologySource, technologyPagination, detailEnumMap } } = this.props;
     const { scoreType = [], scoreType1 = [], yesNo = [] } = detailEnumMap;
     request(`${SRM_BID}/v1/${organizationId}/import/data?templateCode=${params.templateCode}&batch=${params.batch}&size=500`, {
       method: 'GET'
     }
     ).then((res) => {
       if (res.content) {
         let newdata = []
         if (res.content.length > 0) {
           res.content.map((item) => {
             const listn = { ...JSON.parse(item._data) }
             const newList = {
               _status: 'update',
               poOrderId: uuidv4(),
               clauseDetail: listn.clauseDetail,
               isObjectiveScore: listn.isObjectiveScore,
               proId: matchs.params.proId,
               score: listn.score,
               scoreClause: listn.scoreClause,
               scoreType: listn.scoreType,
               setScore: listn.setScore,
             }
             newdata.push(newList)
           })
           if (newdata.length > 50) {
            this.setState({
              uploadLoading: false,
            });
             notification.error({ message: '单次导入不能超过50条，超出不做保存' })
             return;
           } else {
             // 导入后校验总分是否是100
             // let totalScore = 0;
             // newdata.map((item) => {
             //   if (item.score !== '' && item.score !== undefined) {
             //     totalScore += Number(item.score)
             //   }
             // })
             // technologySource.map((item, index) => {
             //   if (item.score !== '' && item.score !== undefined) {
             //     totalScore += Number(this.props.contractMaintain.technologySource[index].$form.getFieldValue('score'))
             //   }
             // })
             // if (totalScore !== 100) {
             //   notification.warning({
             //     message: intl.get('bid.bidcommon.view.title.scoreconfirma') + totalScore + intl.get('bid.bidcommon.view.title.scoreconfirmb'),
             //   });
             //   return;
             // } else {
             // 循环值集
             yesNo.map((item) => {
               newdata.map((ite) => {
                 if (item.meaning === ite.isObjectiveScore) {
                   ite.isObjectiveScore = item.value
                 }
               })
             })
             scoreType.map((item) => {
               newdata.map((ite) => {
                 if (item.meaning === ite.scoreType) {
                   ite.scoreType = item.value
                 }
               })
             })
             scoreType1.map((item) => {
               newdata.map((ite) => {
                 if (item.meaning === ite.scoreType) {
                   ite.scoreType = item.value
                 }
               })
             })
             // const newdataList = technologySource.length > 0 ? [...newdata, ...technologySource] : [...newdata, ...technologySource, {}, {}];
             const newdataList = [...newdata, ...technologySource]
             dispatch({
               type: 'contractMaintain/updateState',
               payload: {
                 technologySource: newdataList,
                //  technologyPagination: createPagination({
                //    number: 0,
                //    size: newdataList.length,
                //    totalElements: newdataList.length
                //  }),
               },
             });
             this.setState({
              uploadLoading: false,
            });
             // notification.success({ message: intl.get('bid.bidcommon.view.message.uploadsuccessfully').d('导入成功') });
             // this.setState({ technologySource: newdataList })
             // this.handleSave(newdata);
             this.handleSave();
             // }
           }
         } else {
          this.setState({
            uploadLoading: false,
          });
           notification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
         }
       }
     })
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
      dispatch,
      templateCode = 'BID.SCORE_CONFIGS',
    } = this.props;
    const formData = new FormData();
    formData.append('excel', file, file.name);
    if (file.uid) {
      // const url = `${SRM_BID}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
      this.setState({
        uploadLoading: true,
      });
      dispatch({
        type: 'contractMaintain/goImport',
        payload: {
          templateCode: templateCode,
          file: formData,
        }
      }).then((res) => {
        if (this.isJSON(res)) {
          notification.error({ message: intl.get(`bid.bidcommon.view.title.operationfailed`).d('操作失败') });
        } else if (res) {
          // 导入成功后查一遍数据进行导入的数据展示
          const params = {
            templateCode: templateCode,
            batch: res
          }
          setTimeout(()=>{ 
            this.handleImportData(params)},500)
          // this.handleImportData(params)
        }
      })
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
    });
  }

  // 添加行
  @Bind
  @Debounce(500)
  handleAdd() {
    const {
      dispatch,
      contractMaintain: { technologySource, technologyPagination },
      matchs
    } = this.props;
    const newData = {
      _status: 'create',
      clauseDetail: "",
      isObjectiveScore: "",
      proId: matchs.params.proId, // 该用户id测试id:2 //matchs.params.proId
      score: '',
      scoreClause: "",
      scoreType: "",
      setScore: "",
      poOrderId: uuidv4(),
    }
    // const newDataSource = technologySource.length > 0 ? [newData, ...technologySource] : [newData, ...technologySource, { poOrderId: undefined }, { poOrderId: undefined }];
    const newDataSource = [...technologySource, newData]
    const newPagination = addItemToPagination(
      technologySource.length,
      technologyPagination
    );
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        technologySource: newDataSource,
        // technologyPagination: newPagination,
      },
    });
    this.props.isTrue()
    this.setState({ groupUnsaveFlag: true });
  }

  /**
   * 更新行数据
   */
  @Bind()
  refreshLine(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/updateTableList',
      payload: data,
    }).then(() => {
      this.setState({
        selectedRows: [],
      });
      this.fetchList();
    });
  }

  // 保存按钮
  @Bind()
  @Debounce(200)
  handleSave() {
    const { dispatch, contractMaintain: { technologySource = [] } } = this.props;
    const newData = getEditTableData(technologySource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    let data = newData.sort();
    if (data.length > 0) {
      dispatch({
        type: 'contractMaintain/updateTableList',
        payload: {
          data: [...data]
        }
      }).then((res) => {
        if (res.res === 'error') {
          notification.warning({
            message: intl.get('bid.bidcommon.view.title.scoreconfirma') + res.totalCount + intl.get('bid.bidcommon.view.title.scoreconfirmb'),
          });
        } else if (res.res === 'mistake') {
          notification.warning({
            message: intl.get('bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist').d('当前列表中不得超出最大长度1000字符'),
          });
        } else {
          this.fetchList();
          this.props.isFalse();
          notification.success({
            message: intl
              .get(`bid.bidcommon.view.title.savesuccessfully`)
              .d('保存成功'),
          });
          this.setState({ groupUnsaveFlag: false })
        }
      })
    } else {
      dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          technologySource: technologySource,
          // technologyPagination: createPagination(technologySource),
        }
      });
      this.setState({ groupUnsaveFlag: true })
    }
  }

  // 删除
  @Bind
  handleDelete() {
    const { dispatch, contractMaintain: { technologySource, technologyPagination } } = this.props;
    const { selectedRows, selectedRowKeys, dataSourceTest } = this.state;
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
        okText: intl.get(`bid.bidcommon.view.title.sure`).d('确定'),
        cancelText: intl.get(`bid.bidcommon.view.button.cancel`).d('取消'),
        onOk: () => {
          let deleteNewDataList = [];
          for (let i in selectedRows) {
            if (selectedRows[i]._status === 'update') {
              selectedRows.map((item, i) => {
                technologySource.map((ite, j) => {
                  if (item.poOrderId === ite.poOrderId && item._status === 'update') {
                    deleteNewDataList.push(ite);
                    technologySource.splice(j, 1)
                  }
                })
              })
              this.setState({ dataSourceTest: dataSourceTest })
            } else {
              // 删除本地数据
              selectedRows.map((item, i) => {
                technologySource.map((ite, j) => {
                  if (item.poOrderId === ite.poOrderId && item._status === 'create') {
                    technologySource.splice(j, 1)
                  }
                })
              })
              this.setState({ selectedRows: [], selectedRowKeys: [] })
            }
          }
          if (deleteNewDataList.length > 0) {
            let data = [];
            deleteNewDataList.map((item) => {
              data.push({ socreConfigId: item.socreConfigId })
            })
            dispatch({
              type: 'contractMaintain/deleteTableList',
              payload: [...data],
            }).then(() => {
              this.fetchList();
            })
          }
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              technologySource: technologySource,
            }
          });
          notification.success();
        }
      })
    } else {
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }

  @Bind
  handleOk() {
    this.setState({
      messageVisible: false,
      visible: false,
      message: '',
      fileList: [],
      upload: false,
    });
  }

  /**
     * 下载模板
     */
  @Bind()
  handleDownloadTemplateClick() {
    const organizationId = getCurrentOrganizationId();
    const { code } = this.state;
    const api = `${SRM_BID}/v1/${organizationId}/import/template/${code}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] });
  }

  @Bind
  changeScore(record) {
    const { contractMaintain: { technologySource = [] } } = this.props;
    for (let i = 0; i < technologySource.length; i++) {
      if (technologySource[i].score != undefined) {
        record.score += technologySource[i].score;
      }
      // record.score += record.$form.getFieldValue('score')
    }
    this.setState({
      total: Number(record.score) || 0
    })
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
          this.fetchList();
        },
      });
    } else {
      this.fetchList(page);
    }
  }

  @Bind
  @Debounce(200)
  changeTotal(val, index) {
    const { contractMaintain: {technologySource = []} } = this.props;
    let total = 0;
    let newSource = technologySource
    newSource[index].score = val
    newSource.map((item) => {
      total += Number(item.score)
    })
    this.setState({ footerTotalSource: total })
  }

  render() {
    const {
      matchs,
      fetchSourceList,
      saveLoading,
      contractMaintain: { technologySource = [], technologyPagination = {} },
      detailEnumMap = {},
      deleteLinesLoading = false,
      loading,
      disabled,
      code = {},
      getDetailList,
    } = this.props;
    const { scoreType = [], scoreType1 = [], yesNo = [] } = detailEnumMap;
    newDataList = [];
    count++;
    if (count === 15) {
      this.setState({ dataSourceTest: technologySource });
    }
    newDataList = technologySource;
    const {
      selectedRows = [],
      selectedRowKeys = [],
    } = this.state;
    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };
    let total = 0;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: 70,
        // editable: true,
        render: (val, record, index) => {
          // if (index < technologySource.length - 2) {
          return (
            index + 1
          );
          // }
          // if (index == technologySource.length - 2) {
          //   return {
          //     children: <span>{intl.get(`bid.bidcommon.view.title.totalscore`).d('总分(百分制)')}</span>,
          //     props: {
          //       colSpan: 3,
          //     },
          //   };
          // }
          // if (index == technologySource.length - 1) {
          //   return {
          //     children: <span>{intl.get(`bid.bidcommon.view.title.proportion`).d('加权得分')}（{getDetailList.tenRate || getDetailList.technicalProportion}%）</span>,
          //     props: {
          //       colSpan: 3,
          //     },
          //   };
          // }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
        dataIndex: 'scoreClause',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
        render: (text, record, index) => {
          // if (index < technologySource.length - 2 && record.$form !== undefined) {
          return (
            <Form.Item>
              <Tooltip placement="topLeft" title={record.scoreClause}
                overlayStyle={{'max-height': '30vh','overflow-y': 'scroll',
                  'scrollbar-width': 'none !important',
                  '-ms-overflow-style': 'none !important',
                }}
                >
                {record.$form && record.$form.getFieldDecorator('scoreClause', {
                  initialValue: record.scoreClause,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
                    }),
                  }]
                })(
                  <Input disabled={disabled}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                    onChange={() => {
                      record.scoreClause = record.$form.getFieldValue('scoreClause'),
                      this.props.isTrue()
                    }
                    } />
                )}
              </Tooltip>
            </Form.Item>
          );
          // }
          // if (index == technologySource.length - 2) {
          //   return {
          //     children: <span>100{intl.get(`bid.bidcommon.view.title.point`).d('分')}</span>,
          //     props: {
          //       colSpan: 4,
          //     },
          //   };
          // }
          // if (index == technologySource.length - 1) {
          //   return {
          //     children: <span>{(100 * (getDetailList.tenRate || getDetailList.technicalProportion) / 100).toFixed(2)}{intl.get(`bid.bidcommon.view.title.point`).d('分')}</span>,
          //     props: {
          //       colSpan: 4,
          //     },
          //   };
          // }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
        dataIndex: 'clauseDetail',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        // width: 150,
        render: (text, record, index) => {
          if (record.$form !== undefined) {
            // if (index < technologySource.length - 2) {
            return (
              <Form.Item>
                <Tooltip placement="topLeft" title={record.clauseDetail}
                overlayStyle={{'max-height': '30vh','overflow-y': 'scroll',
                  'scrollbar-width': 'none !important',
                  '-ms-overflow-style': 'none !important',
                }}
                >
                  {record.$form && record.$form.getFieldDecorator('clauseDetail', {
                    initialValue: record.clauseDetail,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
                      }),
                    }]
                  })(
                    <Input disabled={disabled}
                      placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                      onChange={() => {
                        record.clauseDetail = record.$form.getFieldValue('clauseDetail')
                        this.props.isTrue()
                      }} />
                  )}
                </Tooltip>
              </Form.Item>
            );
            // }
          }
          // if (index === technologySource.length - 2 || index === technologySource.length - 1) {
          //   return {
          //     props: {
          //       colSpan: 0,
          //     },
          //   };
          // }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
        dataIndex: 'score',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 100,
        render: (text, record, index) => {
          if (record.$form !== undefined) {
            // if (index < technologySource.length - 2) {
            return (
              <Form.Item>
                {record.$form && record.$form.getFieldDecorator('score', {
                  initialValue: record.score,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
                    }),
                  }]
                })(
                  <InputNumber disabled={disabled} min={0}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                    onChange={(text) => {
                      this.props.isTrue()
                      this.changeTotal(text, index)
                    }}
                    onInput={() => record.score = record.$form.getFieldValue('score')} />
                )}
              </Form.Item>
            );
          }
          // }
          // if (index === technologySource.length - 2 || index === technologySource.length - 1) {
          //   return {
          //     props: {
          //       colSpan: 0,
          //     },
          //   };
          // }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.objective`).d('是否客观分'),
        dataIndex: 'isObjectiveScore',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 150,
        render: (text, record, index) => {
          if (record.$form !== undefined) {
            // if (index < technologySource.length - 2) {
            return (
              <Form.Item>
                {record.$form && record.$form.getFieldDecorator('isObjectiveScore', {
                  initialValue: record.isObjectiveScore ? record.isObjectiveScore : '',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.objective`).d('是否客观分'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear style={{ minWidth: 100 }} disabled={disabled}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                    onChange={() => {
                      record.isObjectiveScore = record.$form.getFieldValue('isObjectiveScore')
                      this.props.isTrue()
                    }}
                  >
                    {yesNo.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          }
          // }
          // if (index === technologySource.length - 2 || index === technologySource.length - 1) {
          //   return {
          //     props: {
          //       colSpan: 0,
          //     },
          //   };
          // }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
        dataIndex: 'scoreType',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 300,
        render: (text, record, index) => {
          // if (record.$form !== undefined && index < technologySource.length - 2) {
          if (record.$form && (record.$form.getFieldValue('isObjectiveScore') === 'YES' || record.$form.getFieldValue('isObjectiveScore') === '是')) {
            return (
              <Form.Item>
                {record.$form && record.$form.getFieldDecorator('scoreType', {
                  initialValue: record.$form.getFieldValue('isObjectiveScore') === record.isObjectiveScore ? record.scoreType : '',
                  // initialValue: record.scoreType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
                      }),
                    }
                  ],
                })(
                  <Select allowClear style={{ minWidth: 260 }} disabled={disabled}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                    onChange={() => {
                      record.scoreType = record.$form.getFieldValue('scoreType'),
                      this.props.isTrue()
                    }}
                  >
                    {scoreType1.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else if (record.$form && (record.$form.getFieldValue('isObjectiveScore') === 'NO' || record.$form.getFieldValue('isObjectiveScore') === '否')) {
            return (
              <Form.Item>
                {record.$form && record.$form.getFieldDecorator('scoreType', {
                  initialValue: record.$form.getFieldValue('isObjectiveScore') === record.isObjectiveScore ? record.scoreType : '',
                  // initialValue: record.scoreType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear style={{ minWidth: 260 }} disabled={disabled}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                    onChange={() => {
                      record.scoreType = record.$form.getFieldValue('scoreType')
                      this.props.isTrue()
                    }}
                  >
                    {scoreType.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )
          } else {
            return (
              <div>
                <Select placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')} style={{ minWidth: 150 }} disabled
                  onChange={() => { this.props.isTrue() }}
                >
                  <Select.Option value='1'></Select.Option>
                </Select>
              </div>
            )
          }
          // }
          // if (index === technologySource.length - 2 || index === technologySource.length - 1) {
          //   return {
          //     props: {
          //       colSpan: 0,
          //     },
          //   };
          // }
        },
      },
      {
        // title: intl.get(`bid.bidcommon.view.title.scorevalue`).d('设置分值下拉值'),
        title: (
          <>
            {intl.get(`bid.bidcommon.view.title.scorevalue`).d('设置分值下拉值')}
            <Tooltip
              title={intl.get(`bid.bidcommon.view.title.setscoreprompt`)}
            >
              <Icon type="question-circle-o" style={{ marginLeft: 5, color: '#0086cf' }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'setScore',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        width: 300,
        render: (text, record, index) => {
          // if (record.$form !== undefined && index < technologySource.length - 2) {
          if (record.$form && record.$form.getFieldValue('scoreType') === 'objectiveMetrology_binninglinear') {
            return (
              // objectiveMetrology_binninglinear:客观计量式（分档-线性）
              <Input disabled
                placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                inputChinese={false}
                onChange={() => {
                  this.props.isTrue()
                }}
              />
            );
          } else {
            if (record.$form && record.$form.getFieldValue('isObjectiveScore')) {
              return (
                <Form.Item>
                  {record.$form && record.$form.getFieldDecorator('setScore', {
                    initialValue: record.setScore,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('bid.bidcommon.view.title.scorevalue').d('分值下拉值'),
                        }),
                      },
                      {
                        pattern: /^[,~.0-9]*$/,
                        message: intl
                          .get(`bid.bidcommon.view.title.Onlynumbersandtsfh`)
                          .d('只能输入数字和~,.'),
                      },
                    ],
                  })(
                    <Input disabled={disabled} inputChinese={false}
                      placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                      onChange={() => {
                        record.setScore = record.$form.getFieldValue('setScore')
                        this.props.isTrue()
                      }} />
                  )}
                </Form.Item>
              );
            } else {
              return (
                <Form.Item>
                  <Input inputChinese={false}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                    onChange={() => {
                      this.props.isTrue()
                    }} />
                </Form.Item>
              );
            }
          }
          // }
          // if (index === technologySource.length - 2 || index === technologySource.length - 1) {
          //   return {
          //     props: {
          //       colSpan: 0,
          //     },
          //   };
          // }
        },
      },
    ].filter(Boolean);
    const listProps = {
      dataSource: technologySource,
      loading,
      columns,
      rowSelection: {
        selectedRowKeys,
        onChange: this.onRowSelectChange,
        getCheckboxProps: record => ({
          disabled: record._status === undefined,
        }),
      },
      pagination: false,
      // pagination: technologyPagination,
      selectedRows,
      selectedRowKeys,
      rowKey: 'poOrderId',
      loading: fetchSourceList,
      // unsaveFlag: groupUnsaveFlag,
      // onChange: (page) => this.handlePageChange(page),
      // onDataChange: this.handleDataChange,
      // onEdit: (flag) => {
      //   this.setState({
      //     groupUnsaveFlag: flag,
      //   });
      // },
      className: classnames(styles['db-list']),
      footer: () => {
        if (technologySource.length > 0) {
          return (
            <Table
              columns={footerColumns}
              dataSource={footefDataSource}
              showHeader={false}
              rowSelection={newrowSelection}
              pagination={false}
            >
            </Table>
          )
        }
      }
    };
    const newrowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record._status === undefined,
      }),
    }
    const footerColumns = [{
      title: 'name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'sorce',
      dataIndex: 'sorce',
      key: 'sorce',
      width: 851,
    }]
    const footefDataSource = [{
      name: intl.get(`bid.bidcommon.view.title.totalscore`).d('总分(百分制)'),
      sorce: this.state.footerTotalSource + intl.get(`bid.bidcommon.view.title.point`).d('分')
    }, {
      name: intl.get(`bid.bidcommon.view.title.proportion`).d('加权得分') + '（' + `${getDetailList.tenRate || getDetailList.technicalProportion}` + '%' + '）',
      sorce: (this.state.footerTotalSource * (getDetailList.tenRate || getDetailList.technicalProportion) / 100).toFixed(2) + intl.get(`bid.bidcommon.view.title.point`).d('分')
    }]

    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };

    return (
      <Fragment>
        <Content style={{ padding: '0' }}>
          <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }} >
            <Col span={24} className="customize-buttons">
              <Button style={{ marginRight: '8px' }} onClick={() => this.handleDownloadTemplateClick()} disabled={disabled}>
                <img src={importIcon} alt="" />
                {intl.get(`bid.bidcommon.view.button.download`).d('下载模板')}
              </Button>
              <Upload {...uploadProps}>
                <Button onClick={this.handleImport} disabled={disabled}>
                  <img src={importIcon} alt="" />
                  {intl.get(`bid.bidcommon.view.button.import`).d('导入')}
                </Button>
              </Upload>
              <ExcelExport
                requestUrl={`${SRM_BID}/v1/${organizationId}/bid-score-configs/exportConInfo?proId=${matchs.params.proId}&fillerType=single-sheet`}
                // queryParams={this.fetchList}
                downloadType="Blob"
                disabled={disabled}
                fileName='技术评分表导出'
                otherButtonProps={{
                  // type: 'default',
                  icon: null,
                }}
                buttonText={
                  <>
                    <img src={exportIcon} alt="" />
                    {intl.get(`bid.bidcommon.view.button.export`).d('导出')}
                  </>
                }
              />
              <Button
                onClick={this.handleDelete}
                loading={deleteLinesLoading}
                disabled={disabled}
              >
                <img src={deleteIcon} alt="" />
                {intl.get('bid.bidcommon.view.button.delete').d('删除')}
              </Button>
              <Button onClick={this.handleAdd} disabled={disabled}>
                <img src={addIcon} alt="" />
                {intl.get(`bid.bidcommon.view.button.add`).d('添加')}
              </Button>
              <Button onClick={this.handleSave} disabled={disabled} loading={saveLoading}>
                <img src={saveIcon} alt="" />
                {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
              </Button>
            </Col>
          </Row>
          <Modal
            title={intl.get('bid.bidcommon.button.import.result').d('导入结果')}
            visible={this.state.messageVisible}
            footer={null}
            destroyOnClose
            width={300}
            style={{ top: 150 }}
            className={styles.priceEntry}
            onCancel={this.handleCancel}
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
                {intl.get(`bid.bidcommon.view.title.sure`).d('确定')}
              </Button>
            </div>
          </Modal>
          <EditTable bordered {...listProps} />
          {/* <Table bordered {...footerProps} /> */}
          {/* <Pagination style={{ 'margin': '16px 0','float': 'right' }} showSizeChanger {...listProps} defaultCurrent={1} total={technologyPagination} /> */}
        </Content>
      </Fragment>
    );
  }
}
