/*
 * ui 修改
 * @date: 2023-08-07
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
// ps：保存注释通contractmidlleNew 不做额外注释
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col, Upload, InputNumber, Table } from 'antd';
import EditTable from '_cus_components/EditTable';
import CusButton from '_cus_components/CusButton';
import { labelTip, tooltipRender } from '_cus_utils/render';
import CusSelect from '_cus_components/CusSelect';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import CusSpin from '_cus_components/CusSpin';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, cloneDeep, pullAllBy } from 'lodash';
import classnames from 'classnames';
import { getEditTableData, tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import {
  addItemToPagination,
  getCurrentOrganizationId,
} from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { SRM_BID } from '@/common/config';
import styles from './index.less';
import { downloadFile } from 'hzero-front/lib/services/api';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';
import CusNotification from '_cus_components/CusNotification';
import eventBus from '../../components/ev';
import { numberRender } from 'utils/renderer';
import CusInputNumber from '_cus_components/CusInputNumber';

const organizationId = getCurrentOrganizationId();

let count = 0;
let newDataList = [];

@connect(({ loading = {}, contractMaintain = {} }) => ({
  fetchSourceList: loading.effects['contractMaintain/getTableList'],
  saveLoading: loading.effects['contractMaintain/updateTableList'],
  uploadLoading: loading.effects['contractMaintain/goImport'],
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
      oldProId: null,
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
    eventBus.on('handleSave', this.handleSaveNew)
  }

  componentWillUnmount() {
    eventBus.off('handleSave', this.handleSaveNew)
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
  fetchList(deletedList) {
    const { dispatch, matchs } = this.props;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    if (matchs.params.proId) {
      this.setState({ oldProId: matchs.params.proId })
      dispatch({
        type: 'contractMaintain/getTableList',
        payload: {
          proId: matchs.params.proId, //matchs.params.proId
        },
      }).then((res) => {
        if (res) {
          // const { content = [] } = res;
          // const pagination = createPagination(res);
          let newDataSource = [];
          let newList = [];
          // 若是删除后调用的查询，数据用deletedList
          if (deletedList && deletedList.length > 0) {
            newDataSource = [...deletedList];
            newList = newDataSource.length > 0 ? [...newDataSource, {}, {}] : newDataSource;
          } else if (deletedList && deletedList.length === 0) {
            newDataSource = [];
          } else { // 初始查询用的数据res
            newDataSource = res.map((item) => ({
              ...item,
              _status: 'update',
              poOrderId: uuidv4(),
            }));
            // 初始查询判断是否有无数据，有新增两个空{},没有返回空[]
            newList = newDataSource.length > 0 ? [...newDataSource, {}, {}] : newDataSource;
          }
          // newDataSource = deletedList ? deletedList.length > 0 ? [...deletedList, {}, {}] : [] : res.map((item) => ({
          //   ...item,
          //   _status: 'update',
          //   poOrderId: uuidv4(),
          // }));
          // let newList = newDataSource.length > 0 ? [...newDataSource, {}, {}] : newDataSource;
          this.setState({ dataSourceTest: newList, groupUnsaveFlag: false });
          dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              technologySource: newList,
              // technologyPagination: pagination,
            },
          });
          // 计算总分
          let total = 0;
          for (let i in newList) {
            if (newList[i].score) {
              total += Number(newList[i].score)
            }
          }
          this.setState({ footerTotalSource: total })
          console.log(newList,'newDataSource')
          if (newList.length == 0) this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
        }
      });
    } else {
      this.setState({ dataSourceTest: [], groupUnsaveFlag: false });
      this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
    }

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
          res.content.map((item, index) => {
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
              orderSeq: index + 1
            }
            newdata.push(newList)
          })
          if (newdata.length > 50) {
            this.setState({
              uploadLoading: false,
            });
            CusNotification.error({ message: '单次导入不能超过50条，超出不做保存' })
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
              CusNotification.warning({
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
              this.handleSave((res) => {
                if (res) {
                  const params = res.map((item) => {
                    return {
                      content: item.clauseDetail,
                      number: item.orderSeq,
                    }
                  })
                  setTimeout(() => {
                    this.getCheckMessage(params);
                  }, 1000)
                }
              })
            }
          }
          this.setState({
            uploadLoading: false,
          });
        } else {
          setTimeout(() => {
            this.handleImportDataTwo(params)
          }, 500)
          // CusNotification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
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
          res.content.map((item, index) => {
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
              orderSeq: index + 1,
            }
            newdata.push(newList)
          })
          if (newdata.length > 50) {
            this.setState({
              uploadLoading: false,
            });
            CusNotification.error({ message: '单次导入不能超过50条，超出不做保存' })
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
            //   CusNotification.warning({
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
            const list = [...newdata, ...technologySource]
            const newdataList = list.length > 0 ? [...list, {}, {}] : [];
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
            // CusNotification.success({ message: intl.get('bid.bidcommon.view.message.uploadsuccessfully').d('导入成功') });
            // this.setState({ technologySource: newdataList })
            // this.handleSave(newdata);
            this.handleSave((res) => {
              if (res) {
                const params = res.map((item) => {
                  return {
                    content: item.clauseDetail,
                    number: item.orderSeq,
                  }
                })
                setTimeout(() => {
                  this.getCheckMessage(params);
                }, 1000)
              }
            })
            // }
          }
        } else {
          this.setState({
            uploadLoading: false,
          });
          CusNotification.error({ message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败') });
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
      dispatch({
        type: 'contractMaintain/goImport',
        payload: {
          templateCode: templateCode,
          file: formData,
        }
      }).then((res) => {
        if (this.isJSON(res)) {
          CusNotification.error({ message: intl.get(`bid.bidcommon.view.title.operationfailed`).d('操作失败') });
        } else if (res) {
          // 导入成功后查一遍数据进行导入的数据展示
          const params = {
            templateCode: templateCode,
            batch: res
          }
          setTimeout(() => {
            this.handleImportData(params)
          }, 500)
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
    const newTechnologySource = technologySource.filter((item) => {
      if (item.proId) {
        return item
      }
    })
    const newDataSource = [...newTechnologySource, newData, {}, {}]
    // const newPagination = addItemToPagination(
    //   technologySource.length,
    //   technologyPagination
    // );
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


  //校验
  @Bind()
  handleSaveNew(id) {
    console.log('datas',this.state.oldProId, id);
    if (this.state.oldProId == null || this.state.oldProId === id) {
      if (!this.props.matchs.params.proId) {
        if (activeKey == 'quoteSourceResult') eventBus.emit('callback', 'quoteSourceResult', true);
        return
      }
      this.handleSave()
    }
  }

  // 保存按钮
  @Bind()
  @Debounce(200)
  handleSave(callback) {
    const { dispatch, matchs, activeKey, contractMaintain: { technologySource = [] } } = this.props;
    const newData = getEditTableData(technologySource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
          proId: matchs.params.proId
        }
        : item
    );
    let data = newData.sort();
    // console.log('data', this.state.oldProId, matchs.params.proId)
    // if (this.state.oldProId == null || this.state.oldProId === matchs.params.proId) {
      if (data.length > 0) {
        dispatch({
          type: 'contractMaintain/updateTableList',
          payload: {
            data: [...data]
          }
        }).then((res) => {
          if (res.res === 'error') {
            if (res.totalCount > 100) {
              CusNotification.warning({
                message:
                  intl
                    .get('bid.bidcommon.view.title.scoreconfirma2', { score: res.totalCount })
                    .d('技术总分为分，超过100分'),
              });
              if (activeKey == 'quoteSourceResult') eventBus.emit('callback', 'quoteSourceResult', true);
            }
            else {
              CusNotification.warning({
                message:
                  intl.get('bid.bidcommon.view.title.scoreconfirma') +
                  res.totalCount +
                  intl.get('bid.bidcommon.view.title.scoreconfirmb'),
              });
              if (activeKey == 'quoteSourceResult') eventBus.emit('callback', 'quoteSourceResult', true)
            }
          } else if (res.res === 'mistake') {
            CusNotification.warning({
              message: intl.get('bid.bidcommon.view.title.Themaximumlengthof1000characterscannotbeexceededinthecurrentlist').d('当前列表中不得超出最大长度1000字符'),
            });
            if (activeKey == 'quoteSourceResult') eventBus.emit('callback', 'quoteSourceResult', true)
          } else {
            this.fetchList();
            this.props.isFalse();
            if (activeKey == 'quoteSourceResult') {
              CusNotification.success({
              message: intl
                .get(`bid.bidcommon.view.title.savesuccessfully`)
                .d('保存成功'),
            });
            }
            
            this.setState({ groupUnsaveFlag: false })
            if (typeof callback === 'function') {
              callback(res)
            }
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
        CusNotification.error({
          message: intl
            .get(`bid.bidcommon.view.message.pleasecheckitem`)
            .d('请检查必填项并保存!'),
        });
        if (activeKey == 'quoteSourceResult') eventBus.emit('callback', 'quoteSourceResult', true)
      }
    // }

  }

  // 新建未保存数据删除
  @Bind()
  deleteNewRows(deleteRow, newList) {
    // 若有已保存的数据删除
    if (deleteRow.length > 0) {
      let data = [];
      deleteRow.map((item) => {
        data.push({ socreConfigId: item.socreConfigId })
      });
      this.props.dispatch({
        type: 'contractMaintain/deleteTableList',
        payload: [...data],
      }).then((res) => {
        if (res) {
          this.fetchList(newList);
          CusNotification.success();
          // this.setState({ technologySource: newList });
          this.props.dispatch({
            type: 'contractMaintain/updateState',
            payload: {
              technologySource: newList,
            }
          });
        }
      });
    } else {
      CusNotification.success();
      // this.setState({ technologySource: newList });
      this.props.dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          technologySource: newList.length > 0 ? [...newList, {}, {}] : newList,
        }
      });
    }
  }

  // 接口删除
  @Bind()
  deleteExistRows(deleteRow, newList) {
    const { dispatch } = this.props;
    let data = [];
    deleteRow.map((item) => {
      data.push({ socreConfigId: item.socreConfigId })
    });
    dispatch({
      type: 'contractMaintain/deleteTableList',
      payload: [...data],
    }).then((res) => {
      if (res) {
        this.fetchList(newList);
        this.deleteNewRows(data, newList);
      }
    });
  }

  // 删除
  @Bind()
  handleDelete() {
    const { dispatch, contractMaintain: { technologySource } } = this.props;
    const { selectedRowKeys, dataSourceTest } = this.state;
    const newDeleteList = cloneDeep(technologySource.filter((n) => n._status !== undefined));
    const newSelectedRows = [];
    selectedRowKeys && newDeleteList.forEach((i) => {
      selectedRowKeys.forEach((j) => {
        if (i.poOrderId === j) {
          newSelectedRows.push(i);
        }
      });
    });
    if (newSelectedRows && newSelectedRows.length > 0) {
      // 选中行的新建行
      const newRows = newSelectedRows.filter((n) => n._status === 'create');
      // 选中行的已有行
      const existRows = newSelectedRows.filter((n) => n._status !== 'create');
      let newList = [];
      if (newRows) {
        newList = pullAllBy(newDeleteList, newRows, 'poOrderId');
      }
      if (existRows) {
        newList = pullAllBy(newDeleteList, existRows, 'poOrderId');
      }
      if (newRows.length > 0) {
        CusModal.CusDeleteConfirm(() => this.deleteNewRows(existRows, newList));
      } else if (existRows.length > 0) {
        CusModal.CusDeleteConfirm(() => this.deleteExistRows(existRows, newList));
      } else {
        CusModal.confirm({
          content: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
          okType: 'normal',
          onOk: () => {
            let data = existRows;
            dispatch({
              type: 'contractMaintain/deleteTableList',
              payload: { data },
            }).then((res) => {
              if (res) {
                // this.setState({ technologySource: newList });
                dispatch({
                  type: 'contractMaintain/updateState',
                  payload: {
                    technologySource: newList,
                  }
                });
                this.fetchList(newList);
                CusNotification.success();
              }
            });
          }
        })
      }
    } else {
      CusNotification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }

  // 删除
  // @Bind()
  // handleDelete() {
  //   const { dispatch, contractMaintain: { technologySource, technologyPagination } } = this.props;
  //   const { selectedRows, selectedRowKeys, dataSourceTest } = this.state;
  //   if (selectedRowKeys && selectedRowKeys.length > 0) {
  //     CusModal.confirm({
  //       content: intl.get(`bid.bidcommon.view.message.suredelete`).d('是否确认删除'),
  //       onOk: () => {
  //         let deleteNewDataList = [];
  //         for (let i in selectedRows) {
  //           if (selectedRows[i]._status === 'update') {
  //             selectedRows.map((item, i) => {
  //               technologySource.map((ite, j) => {
  //                 if (item.poOrderId === ite.poOrderId && item._status === 'update') {
  //                   deleteNewDataList.push(ite);
  //                   technologySource.splice(j, 1)
  //                 }
  //               })
  //             })
  //             this.setState({ dataSourceTest: dataSourceTest })
  //           } else {
  //             // 删除本地数据
  //             selectedRows.map((item, i) => {
  //               technologySource.map((ite, j) => {
  //                 if (item.poOrderId === ite.poOrderId && item._status === 'create') {
  //                   technologySource.splice(j, 1)
  //                 }
  //               })
  //             })
  //             this.setState({ selectedRows: [], selectedRowKeys: [] })
  //           }
  //         }
  //         if (deleteNewDataList.length > 0) {
  //           let data = [];
  //           deleteNewDataList.map((item) => {
  //             data.push({ socreConfigId: item.socreConfigId })
  //           })
  //           dispatch({
  //             type: 'contractMaintain/deleteTableList',
  //             payload: [...data],
  //           }).then(() => {
  //             this.fetchList();
  //           })
  //         }
  //         dispatch({
  //           type: 'contractMaintain/updateState',
  //           payload: {
  //             technologySource: technologySource,
  //           }
  //         });
  //         CusNotification.success();
  //       }
  //     })
  //   } else {
  //     CusNotification.warning({
  //       message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
  //     });
  //   }
  // }

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
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag()
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   */
  @Bind
  handlePageChange(page) {
    const { groupUnsaveFlag } = this.state;
    if (groupUnsaveFlag) {
      CusModal.confirm({
        content: intl
          .get('bid.bidcommon.view.message.confirmgetout')
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okType: 'normal',
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
    const { contractMaintain: { technologySource = [] } } = this.props;
    let total = 0;
    let newSource = technologySource
    newSource[index].score = val
    newSource.map((item) => {
      if (item.score) {
        total += Number(item.score)
      }
    })
    this.setState({ footerTotalSource: total })
  }

  @Bind
  handleCheck(e, record) {
    const isObjectiveScore = record.$form.getFieldValue('isObjectiveScore'); // 是否客观分
    const orderSeq = record.orderSeq; // 序号
    const clauseDetail = e.target.value; // 评分细项
    const params = [
      {
        content: clauseDetail,
        number: orderSeq,
      }
    ]
    if (isObjectiveScore === 'YES' && !isEmpty(clauseDetail)) {
      this.getCheckMessage(params);
    }
  }

  @Bind
  handleIsScoreCheck(val, record) {
    const orderSeq = record.orderSeq; // 序号
    const clauseDetail = record.$form.getFieldValue('clauseDetail'); // 评分细项
    const params = [
      {
        content: clauseDetail,
        number: orderSeq,
      }
    ]
    if (val === 'YES' && !isEmpty(clauseDetail)) {
      this.getCheckMessage(params);
    }
  }

  // 校验技术评分的风向明细
  @Bind
  getCheckMessage(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getCheckScoreMessage',
      payload: params
    }).then((res) => {
      if (res) {
        // console.log('res', res);
        res.map((item, index) => {
          setTimeout(() => {
            CusNotification.warning({
              message: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号') + `${item.number}` + `${item.errMessage}`,
              duration: null,
            })
          }, 200 * (index + 1))
        })
      }
    })
  }

  render() {
    const {
      matchs,
      fetchSourceList = false,
      saveLoading = false,
      uploadLoading = false,
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
      footerTotalSource,
    } = this.state;
    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };
    let total = 0;
    // console.log('getDetailList', getDetailList);
    // console.log('footerTotalSource', this.state.footerTotalSource);
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: getCurrentLanguage() === 'zh_CN' ? 62 : 130,
        // fixed: 'left',
        dataIndex: 'orderSeq',
        render: (_, record, index) => {
          record.orderSeq = index + 1
          if (index == technologySource.length - 1) {
            return {
              children: intl.get(`bid.bidcommon.view.title.proportion`).d('加权得分') + '（' + `${getDetailList.tenRate || getDetailList.technicalProportion || 0}` + '%' + '）',
              props: {
                colSpan: 3
              }
            }
          } else if (index == technologySource.length - 2) {
            return {
              children: intl.get(`bid.bidcommon.view.title.totalscore`).d('总分(百分制)'),
              props: {
                colSpan: 3
              }
            }
          } else {
            return (
              <div style={{ textAlign: 'center' }}>
                {index + 1}
              </div>
            );
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
        dataIndex: 'scoreClause',
        width: 150,
        required: !disabled,
        render: (text, record, index) => {
          // if (index < technologySource.length - 2 && record.$form !== undefined) {
          if (index == technologySource.length - 2) {
            return {
              children: <div style={{ textAlign: 'right' }}>{numberRender(footerTotalSource, 2)}</div>,
              props: {
                // style:{borderLeft: 'none'},
                colSpan: 1
              }
            }
          } else if (index == technologySource.length - 1) {
            return {
              children: <div style={{ textAlign: 'right' }}>{numberRender((footerTotalSource * (getDetailList.tenRate || getDetailList.technicalProportion) / 100), 2)}</div>,
              props: {
                colSpan: 1
              }
            }
          } else {
            return (
              disabled ?
                tooltipRender(record.scoreClause) : (<Form.Item>
                  {record.$form && record.$form.getFieldDecorator('scoreClause', {
                    initialValue: record.scoreClause,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
                      }),
                    }]
                  })(
                    <CusInput.TextArea
                      autoChangeSize={true}
                      onChange={() => {
                        record.scoreClause = record.$form.getFieldValue('scoreClause'),
                          this.props.isTrue()
                      }}
                    />
                  )}
                </Form.Item>)
            )
          }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
        dataIndex: 'clauseDetail',
        width: 550,
        required: !disabled,
        render: (text, record, index) => {
          if (record.$form !== undefined) {
            if (index == technologySource.length - 1 || index == technologySource.length - 2) {
              return {
                props: {
                  colSpan: 0
                }
              }
            } else {
              return (
                disabled ?
                  tooltipRender(text) : (<Form.Item>
                    {record.$form && record.$form.getFieldDecorator('clauseDetail', {
                      initialValue: record.clauseDetail,
                      rules: [{
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
                        }),
                      }]
                    })(
                      <CusInput.TextArea
                        autoChangeSize={true}
                        onChange={() => {
                          record.clauseDetail = record.$form.getFieldValue('clauseDetail')
                          this.props.isTrue()
                        }}
                        onBlur={(e) => {
                          this.handleCheck(e, record)
                        }}
                      />
                    )}
                  </Form.Item>)
              )
            }
          } else {
            return {
              props: {
                style: { borderLeft: 'none' },
              }
            }
          }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
        dataIndex: 'score',
        required: !disabled,
        width: 100,
        render: (text, record, index) => {
          // console.log('record', record)
          if (record.$form !== undefined) {
            // if (index < technologySource.length - 2) {
            if (index == technologySource.length - 1 || index == technologySource.length - 2) {
              return {
                props: {
                  colSpan: 3
                }
              }
            } else {
              return (
                disabled ?
                  <div style={{ textAlign: 'right' }}>
                    {tooltipRender(numberRender(record.score, 2))}
                  </div>
                  : (<Form.Item>
                    {record.$form && record.$form.getFieldDecorator('score', {
                      initialValue: record.score,
                      rules: [{
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
                        }),
                      }]
                    })(
                      <CusInputNumber
                        min={0}
                        onChange={(text) => {
                          this.props.isTrue()
                          this.changeTotal(text, index)
                        }}
                        className="cus-input-money"
                        precision={2}
                        onInput={() => record.score = record.$form.getFieldValue('score')}
                      />
                    )}
                  </Form.Item>)
              )
            }
          } else {
            return {
              props: {
                style: { borderLeft: 'none' },
              }
            }
          }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.objective`).d('是否客观分'),
        dataIndex: 'operator',
        required: !disabled,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 115 : 105) : (!disabled ? 110 : 105), // 根据try英文环境调整
        render: (_, record, index) => {
          if (record.$form !== undefined) {
            // if (index < technologySource.length - 2) {
            if (index == technologySource.length - 1 || index == technologySource.length - 2) {
              return {
                props: {
                  colSpan: 0
                }
              }
            } else {
              return (
                disabled ?
                  tooltipRender(record.isObjectiveScoreMeaning) :
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
                      <CusSelect
                        allowClear
                        options={yesNo}
                        onChange={(val) => {
                          // 清除值
                          if(val === 'YES') {
                            record.$form.setFieldsValue({
                              scoreType: 'objective_Freestyle',
                              setScore: null,
                            });
                          } else if(val === 'NO') {
                            record.$form.setFieldsValue({
                              scoreType: 'subjective_Freestyle',
                              setScore: null,
                            });
                          } else {
                            record.$form.setFieldsValue({
                              scoreType: null,
                              setScore: null,
                            });
                          }
                          record.isObjectiveScore = record.$form.getFieldValue('isObjectiveScore')
                          this.props.isTrue()
                          this.handleIsScoreCheck(val, record)
                        }}
                      />
                    )}
                  </Form.Item>
              )
            }
          } else {
            return {
              props: {
                style: { borderLeft: 'none' },
              }
            }
          }
        },
      },
      {
        // width: 300,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 305 : 300) : (!disabled ? 510 : 515),
        title: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
        dataIndex: 'soLineNumber',
        required: !disabled,
        render: (_, record, index) => {
          if (index == technologySource.length - 1 || index == technologySource.length - 2) {
            return {
              props: {
                colSpan: 0
              }
            }
          } else {
            if (disabled) {
              return (
                tooltipRender(record.scoreTypeMeaning)
              )
            }
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
                    <CusSelect
                      allowClear
                      options={scoreType1}
                      onChange={() => {
                        record.scoreType = record.$form.getFieldValue('scoreType'),
                          this.props.isTrue()
                      }}
                    />
                  )}
                </Form.Item>
              )
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
                    <CusSelect
                      allowClear
                      options={scoreType}
                      onChange={() => {
                        record.scoreType = record.$form.getFieldValue('scoreType')
                        this.props.isTrue()
                      }}
                    />
                  )}
                </Form.Item>
              )
            }
          }
        },
      },
      {
        // width: 300,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 200 : 180) : (!disabled ? 168 : 155),
        required: !disabled,
        title: (
          labelTip({
            label: intl.get(`bid.bidcommon.view.title.scorevalue`).d('设置分值下拉值'),
            tip: intl.get(`bid.bidcommon.view.title.setscoreprompt`).d('设置分值下拉值')
          })
        ),
        dataIndex: 'operation',
        render: (text, record, index) => {
          if (index == technologySource.length - 1 || index == technologySource.length - 2) {
            return {
              props: {
                colSpan: 0
              }
            }
          } else {
            if (disabled) {
              return (
                tooltipRender(record.setScore)
              )
            }
            if (record.$form && record.$form.getFieldValue('scoreType') === 'objectiveMetrology_binninglinear') {
              return (
                <CusInput.TextArea
                  autoChangeSize={true}
                  inputChinese={false}
                  onChange={() => {
                    this.props.isTrue()
                  }}
                />
              )
            } else {
              if (record.$form && record.$form.getFieldValue('isObjectiveScore')) {
                return (
                  disabled ?
                    tooltipRender(record.setScore)
                    :
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
                        <CusInput.TextArea
                          autoChangeSize={true}
                          inputChinese={false}
                          onChange={() => {
                            record.setScore = record.$form.getFieldValue('setScore')
                            this.props.isTrue()
                          }}
                        />
                      )}
                    </Form.Item>
                )
              } else {
                return (
                  <Form.Item>
                    <CusInput.TextArea
                      autoChangeSize={true}
                      inputChinese={false}
                      placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                      onChange={() => {
                        this.props.isTrue()
                      }}
                    />
                  </Form.Item>
                )
              }
            }
          }
        }
      },
    ].filter(Boolean);
    // console.log('technologySource', technologySource);
    const listProps = {
      dataSource: technologySource,
      columns,
      scroll: { x: tableScrollWidth(columns), y: 440 }, // y: 480
      rowSelection: {
        selectedRowKeys,
        onChange: this.onRowSelectChange,
        getCheckboxProps: record => ({
          disabled: record._status === undefined || disabled,
        }),
      },
      pagination: false,
      // selectedRows,
      // selectedRowKeys,
      rowKey: 'poOrderId',
      // className: classnames(styles['db-list']),
      // footer: () => {
      //   if (technologySource.length > 0) {
      //     return (
      //       <Table
      //         columns={footerColumns}
      //         dataSource={footefDataSource}
      //         showHeader={false}
      //         scroll={{ x: tableScrollWidth(columns) }} // y: 480
      //         rowSelection={newrowSelection}
      //         pagination={false}
      //       >
      //       </Table>
      //     )
      //   }
      // }
    };
    const newrowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record._status === undefined,
      }),
    }

    const tableHeaderColumns = document.querySelectorAll('.my-table .ant-table-cell.react-resizable');
    let totalWidth = 0;
    for (let i = 0; i < 3; i++) {
      totalWidth += tableHeaderColumns[i]?.offsetWidth;
    }
    const footerColumns = [{
      title: 'name',
      dataIndex: 'name',
      key: 'name',
      width: totalWidth

    }, {
      title: 'sorce',
      dataIndex: 'sorce',
      key: 'sorce',
    }]
    const footefDataSource = [{
      name: intl.get(`bid.bidcommon.view.title.totalscore`).d('总分(百分制)'),
      sorce: this.state.footerTotalSource + intl.get(`bid.bidcommon.view.title.point`).d('分')
    }, {
      name: intl.get(`bid.bidcommon.view.title.proportion`).d('加权得分') + '（' + `${getDetailList.tenRate || getDetailList.technicalProportion}` + '%' + '）',
      sorce: (this.state.footerTotalSource * (getDetailList.tenRate || getDetailList.technicalProportion) / 100).toFixed(2) + intl.get(`bid.bidcommon.view.title.point`).d('分')
    }]

    // listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 800 };
    return (
      <CusSpin spinning={fetchSourceList || saveLoading || uploadLoading}>
        <Form className="customize-form">
          {disabled && <div style={{ display: 'flex', float: 'right', marginBottom: '16px' }}>
            <CusExcelExport
              requestUrl={`${SRM_BID}/v1/${organizationId}/bid-score-configs/exportConInfo?proId=${matchs.params.proId}&fillerType=single-sheet`}
              downloadType="Blob"
              disabled={disabled}
              fileName={intl.get('bid.bidcommon.view.title.technicalscoreformsetting').d('技术评分表')}
              otherButtonProps={{
                mini: true,
                icon: null,
              }}
              buttonText={<>{intl.get(`bid.bidcommon.view.button.export`).d('导出')}</>}
            />
          </div>}
          {!disabled && (
            <Row style={{ display: 'flex', float: 'right', marginBottom: '16px' }}>
              <Col span={24}>
                <CusButton
                  mini
                  onClick={() => this.handleDownloadTemplateClick()}
                  disabled={disabled}
                >
                  {intl.get(`bid.bidcommon.view.button.download`).d('下载模板')}
                </CusButton>
                <CusExcelExport
                  requestUrl={`${SRM_BID}/v1/${organizationId}/bid-score-configs/exportConInfo?proId=${matchs.params.proId}&fillerType=single-sheet`}
                  // queryParams={this.fetchList}
                  downloadType="Blob"
                  disabled={disabled}
                  fileName="技术评分表导出"
                  otherButtonProps={{
                    // type: 'default',
                    mini: true,
                    icon: null,
                    disabled,
                  }}
                  buttonText={<>{intl.get(`bid.bidcommon.view.button.export`).d('导出')}</>}
                />
                <Upload {...uploadProps}>
                  <CusButton
                    onClick={this.handleImport}
                    mini
                    loading={uploadLoading}
                    disabled={disabled}
                  >
                    {intl.get(`bid.bidcommon.view.button.import`).d('导入')}
                  </CusButton>
                </Upload>
                {selectedRowKeys.length > 0 && (
                  <CusButton
                    onClick={this.handleDelete}
                    mini
                    loading={deleteLinesLoading}
                    disabled={disabled}
                  >
                    {intl.get('bid.bidcommon.view.button.delete').d('删除')}
                  </CusButton>
                )}
                <CusButton onClick={this.handleAdd} mini disabled={disabled}>
                  {intl.get(`bid.bidcommon.view.button.add`).d('添加')}
                </CusButton>
                {/* <CusButton onClick={this.handleSave} mini disabled={disabled} loading={saveLoading}>
                {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
              </CusButton> */}
              </Col>
            </Row>
          )}
        </Form>
        <CusModal
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
            <CusButton
              key="submit"
              type="primary"
              style={{ textAlign: 'center' }}
              onClick={this.handleOk}
            >
              {intl.get(`bid.bidcommon.view.title.sure`).d('确定')}
            </CusButton>
          </div>
        </CusModal>
        <div style={{ marginTop:  '16px' }}>
          <EditTable {...listProps} onDataChange={this.handleDataChange} />
        </div>
      </CusSpin>
    );
  }
}
