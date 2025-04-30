/**
 * @Description: 项目答疑
 * @date 2022-05-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Fragment, Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Form, Button, LocaleProvider, Spin, Collapse, Modal } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import uuidv4 from 'uuid/v4';
import { getCurrentLanguage, getEditTableData, getCurrentUser } from 'utils/utils';
import ProjectQaInfo from './projectQaInfo';
import BiddingRound from './biddingRound';
import PurchaseReplyTable from './purchaseReply';
import ActiveClarificationTable from './activeClarification';
import notification from 'utils/notification';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
} from 'hzero-front/lib/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import { isBoolean } from 'lodash';

const { Panel } = Collapse;
@connect(({ loading, projectQaModels }) => ({
  projectQaModels,
  poHeaderInfo: projectQaModels.poHeaderInfo,
  poHeaderMilestonesInfo: projectQaModels.poHeaderMilestonesInfo,
  initLoading: loading.effects['projectQaModels/queryProjectQaInfo'],
  submitLoading: loading.effects['projectQaModels/submitRows'],
  fetchPurchaseReplyLoading: loading.effects['projectQaModels/fetchPurchaseReplyList'],
  fetchActiveClariLoading: loading.effects['projectQaModels/fetchCmiContentList'],
  savePurChaseLoading: loading.effects['projectQaModels/saveClarificationAnswers']
}))
@formatterCollections({
  code: ['bid.bidcommon'],
})
@Form.create({ fieldNameProp: null })
class projectQa extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [
        'projectQaInfo',
        'biddingRound',
        'purchaseReplyTable',
        'activeClarificationTable',
      ],
      clarificationDataSource: [],
      clarificationPagination: {},
      timeFlag: false,
      submitFlag: false,
      groupUnsaveFlag: false,
      fileId: '',
      saveLoading: false,
      selectedPurchaseRowsData: [],
      selectedClarificationRowsData: [],
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        poHeaderInfo: {}, // 头信息
        poHeaderMilestonesInfo: {},
      },
    });
  }

  @Bind
  init() {
    this.getPurchaseReply();
    this.getCmiContentList();
    this.queryProjectQaInfo();
    this.queryProjectQaMilestonesInfo();
    this.getFile();
  }

  /**
   * 查询基本头信息
   */
  @Bind
  queryProjectQaInfo() {
    const { dispatch, match } = this.props;
    const { proId } = match.params;
    dispatch({
      type: 'projectQaModels/queryProjectQaInfo',
      payload: {
        proId: proId,
      },
    });
  }

  /**
   * 查询轮次信息
   */
  @Bind
  queryProjectQaMilestonesInfo() {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    const newDateTime = new Date().getTime();
    dispatch({
      type: 'projectQaModels/queryProjectQaMilestonesInfo',
      payload: {
        milestoneId: milestoneId,
      },
    }).then((res) => {
      if (res) {
        const endTime = Date.parse(new Date(res.milestoneEndTime));
        if (newDateTime < endTime) {
          this.setState({
            timeFlag: true,
          });
        }
        this.setState({
          submitFlag: res.isQaSubmit === 'y',
        });
      }
    });
  }

  // 获取文件列表
  @Bind
  getFile() {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    dispatch({
      type: 'projectQaModels/getQaSummaryFile',
      payload: {
        milestoneId: milestoneId,
        proId: proId,
        remarks: 'summaryFile',
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            newFileUrl: res.answerFileUrls,
          },
        });
        this.setState({
          fileId: res.fileId,
        });
      }
    });
  }

  // 获取CMI答复内容数据
  @Bind
  getPurchaseReply(page = {}) {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    dispatch({
      type: 'projectQaModels/fetchPurchaseReplyList',
      payload: {
        page,
        proId: proId,
        milestoneId: milestoneId,
        // type: 3, // 0 自己供应商提问/ 1 其他人提问/ 2 CMI主动澄清的内容/ 3 CMI回复/ 4 需求人答疑
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            purchaseReplyDataSource: newDataSource,
            purchaseReplyPagination: pagination,
          },
        });
        this.setState({
          groupUnsaveFlag: false,
        });
      }
    });
  }

  // 获取CMI主动澄清
  @Bind
  getCmiContentList(page = {}) {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    dispatch({
      type: 'projectQaModels/fetchCmiContentList',
      payload: {
        page,
        proId: proId,
        milestoneId: milestoneId,
        type: 2, // 0 自己供应商提问/ 1 其他人提问/ 2 CMI主动澄清的内容/ 3 CMI回复/ 4 需求人答疑
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            clarificationDataSource: newDataSource,
            clarificationPagination: pagination,
          },
        });
        this.setState({
          groupUnsaveFlag: false,
          saveLoading:false,
        });
      }
    });
  }

  // 获取CMI主动澄清删除后
  @Bind
  getCmiContentListNew(data) {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    // const { current = 1, pageSize = 10 } = page;
    dispatch({
      type: 'projectQaModels/fetchCmiContentList',
      payload: {
        proId: proId,
        milestoneId: milestoneId,
        type: 2, // 0 自己供应商提问/ 1 其他人提问/ 2 CMI主动澄清的内容/ 3 CMI回复/ 4 需求人答疑
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        let newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        let newPagination = {}
        if (data.length) {
          newDataSource.unshift(...data)
          newPagination = createPagination({
            number: 0,
            size: newDataSource.length,
            totalElements: res.totalElements + data.length
          })
          newPagination = delItemsToPagination(
            0,
            newDataSource.length,
            newPagination
          );
        }else{
          newPagination = createPagination(res)
        }
        console.log('123', newDataSource)
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            clarificationDataSource: newDataSource,
            clarificationPagination: newPagination,
          },
        });
        this.setState({
          groupUnsaveFlag: false,
        });
      }
    });
  }

  @Bind
  onCollapseChange(value) {
    this.setState({
      activeKey: value,
    });
  }

  @Debounce(300, { leading: true })
  @Bind
  handleSavePurchaseReply() {
    const { dispatch, projectQaModels } = this.props;
    const { purchaseReplyDataSource = [] } = projectQaModels;
    const data = getEditTableData(purchaseReplyDataSource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    return new Promise((resolve, reject) => {
      this.updataFileList();
      if (data.length > 0) {
        dispatch({
          type: 'projectQaModels/saveClarification',
          payload: {
            data,
          },
        }).then((resData) => {
          if (resData) {
            dispatch({
              type: 'projectQaModels/saveClarificationAnswers',
              payload: {
                resData,
              },
            }).then((res) => {
              if (res) {
                notification.success({
                  message: intl.get('bid.bidcommon.view.title.savesuccessfully').d('保存成功'),
                });
                this.setState({
                  selectedPurchaseRowsData: []
                })
                // this.getPurchaseReply();
                resolve(res);
              } else {
                reject();
              }
              this.getPurchaseReply();
            });
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  @Bind
  updataFileList() {
    const { dispatch, projectQaModels, match } = this.props;
    const { fileId } = this.state;
    dispatch({
      type: 'projectQaModels/saveQaSummaryFile',
      payload: [
        {
          milestoneId: match.params.milestoneId,
          proId: match.params.proId,
          remarks: 'summaryFile',
          fileId: fileId,
          answerFileUrls: projectQaModels.newFileUrl,
        },
      ],
    });
  }

  @Bind
  handleSaveClarification(selectedClarificationRowsData = []) {
    const { dispatch, projectQaModels } = this.props;
    const { clarificationDataSource = [] } = projectQaModels;
    const newData = getEditTableData(clarificationDataSource).map((item) =>
      item._status === 'create'
        ? {
          ...item,
          poOrderId: undefined,
        }
        : item
    );
    let data = newData.sort();
    if(selectedClarificationRowsData.length > 0) {
      data.map((item) => {
        selectedClarificationRowsData?.map((template) => {
          if(item.qaId === template.qaId) {
            item.identificationTpye = 'y'
          }
        })
      })
    }
    this.setState({
      saveLoading: true,
    })
    return new Promise((resolve, reject) => {
      if (data.length > 0) {
        dispatch({
          type: 'projectQaModels/saveClarification',
          payload: {
            data,
          },
        }).then((resData) => {
          if (resData) {
            dispatch({
              type: 'projectQaModels/saveClarificationAnswers',
              payload: {
                resData,
              },
            }).then((res) => {
              if (res) {
                notification.success({
                  message: intl.get('bid.bidcommon.view.title.savesuccessfully').d('保存成功'),
                });
                this.setState({
                  selectedClarificationRowsData: []
                })
                resolve(res);
              } else {
                reject();
              }
              // this.getCmiContentList();
              setTimeout(() => {
                this.getCmiContentList();
              }, 300);
            });
          }
        });
      } else {
        if (clarificationDataSource.length > 0) {
          reject();
        } else {
          resolve(true);
        }
      }
    });
  }

  // /**
  //  * 添加CMI答复内容行
  //  *
  //  * @memberof PurchaseReplyTable
  //  */
  // @Bind
  // handleAddPurchaseReplyLine() {
  //   const { projectQaModels, dispatch, match } = this.props;
  //   const { poHeadersId } = match.params;
  //   const { purchaseReplyDataSource = [], purchaseReplyPagination = {} } = projectQaModels;
  //   const newLine = {
  //     _status: 'create',
  //     type: 3,
  //     organizationId: getCurrentOrganizationId(),
  //     // proId: '', // 项目ID
  //     // milestoneId: poHeadersId, // 里程碑ID
  //     // poOrderId: uuidv4(),
  //     // creationDate: moment().format('YYYY-MM-DD 00:00:00'),
  //     // realName: getCurrentUser().realName,
  //     // editFlag: 'Y',
  //     // poHeadersId: +poHeadersId,
  //   };
  //   const newDataSource = [newLine, ...purchaseReplyDataSource];
  //   const newPagination = addItemToPagination(
  //     purchaseReplyDataSource.length,
  //     purchaseReplyPagination
  //   );
  //   dispatch({
  //     type: 'projectQaModels/updateState',
  //     payload: {
  //       purchaseReplyDataSource: newDataSource,
  //       purchaseReplyPagination: newPagination,
  //     },
  //   });
  // }

  /**
   * 添加CMI主动澄清行
   *
   * @memberof ActiveClarificationTable
   */
  @Bind
  handleAddClarificationLine() {
    const { projectQaModels, dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    const { clarificationDataSource = [], clarificationPagination = {} } = projectQaModels;
    const newLine = {
      _status: 'create',
      type: 2,
      organizationId: getCurrentOrganizationId(),
      proId: proId, // 项目ID
      milestoneId: milestoneId, // 里程碑ID
      rowKey: uuidv4(),
      // creationDate: moment().format('YYYY-MM-DD 00:00:00'),
      // realName: getCurrentUser().realName,
      // editFlag: 'Y',
      // poHeadersId: +poHeadersId,
    };
    const newDataSource = [...clarificationDataSource, newLine];
    const newPagination = addItemToPagination(
      clarificationDataSource.length,
      clarificationPagination
    );
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        clarificationDataSource: newDataSource,
        clarificationPagination: newPagination,
      },
    });
  }

  @Bind
  handleDeleteClarificationLine(selectedRowKeys, selectedRows, callback) {
    const { projectQaModels, dispatch } = this.props;
    const { clarificationDataSource = [], clarificationPagination = {} } = projectQaModels;
    const newDataSource = selectedRows;
    const deleteData = selectedRows;
    const newPagination = delItemsToPagination(
      selectedRowKeys.length,
      clarificationDataSource.length,
      clarificationPagination
    );

    // console.log('123',selectedRowKeys, selectedRows, callback)
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.remove`).d('是否确认删除'),
        okText: intl.get(`bid.bidcommon.view.title.sure`).d('确定'),
        cancelText: intl.get(`bid.bidcommon.view.button.cancel`).d('取消'),
        onOk: () => {
          const data = deleteData.filter((item) => item._status === 'update');
          const remainCreateData = newDataSource.filter((item) => item._status === 'create');
          if (data.length) {
            this.handleDelete(data);
          }
          let allList = clarificationDataSource;
          let newCreatList = [];
          allList = allList.filter(
            (item) => !remainCreateData.some((ele) => ele?.poOrderId == item?.poOrderId)
          );
          newCreatList = allList.filter((item) => item._status === 'create');
          // for (const i of remainCreateData) {
          // allList = allList.filter(item=>item.poOrderId !==i.poOrderId)
          // console.log('item',newCreatList,allList)
          // this.handleDelete(i.poOrderId,allList)

          // }
          setTimeout(() => {
            this.getCmiContentListNew(newCreatList);
          }, 300);
          dispatch({
            type: 'projectQaModels/updateState',
            payload: {
              clarificationDataSource: newDataSource,
              clarificationPagination: newPagination,
            },
          });
          this.setState({
            selectedClarificationRowsData: []
          })
        },
        onCancel: () => {
          this.setState({
            selectedClarificationRowsData: []
          })
        }
      });
    } else {
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
    callback();
    // const data = deleteData.filter((item) => item._status === 'update');
    // const remainCreateData = newDataSource.filter((item) => item._status === 'create');
    // if (data.length > 0) {
    //   if (remainCreateData.length > 0) {
    //     Modal.info({
    //       title: intl
    //         .get('sodr.purchaseOrder.view.info.ramainCreateData')
    //         .d('存在新增的行没有保存！'),
    //     });
    //     return false;
    //   } else {
    //     dispatch({
    //       type: 'projectQaModels/deleteClarification',
    //       payload: {
    //         data,
    //       },
    //     }).then((res) => {
    //       if (res) {
    //         notification.success();
    //         const { current, pageSize, sourceSize } = clarificationPagination;
    //         this.getCmiContentList({
    //           current,
    //           pageSize: sourceSize || pageSize,
    //         });
    //         callback();
    //       }
    //     });
    //   }
    // } else {
    //   if (remainCreateData.length > 0) {
    //     Modal.info({
    //       title: intl
    //         .get('sodr.purchaseOrder.view.info.ramainCreateData')
    //         .d('存在新增的行没有保存！'),
    //     });
    //     return false;
    //   } else {
    //     dispatch({
    //       type: 'projectQaModels/updateState',
    //       payload: {
    //         clarificationDataSource: newDataSource,
    //         clarificationPagination: newPagination,
    //       },
    //     });
    //     callback();
    //   }
    // }
  }
  // del(key) {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'projectQaModels/updateState',
  //     payload: {
  //       clarificationDataSource: key,
  //       // clarificationPagination: newPagination,
  //     },
  //   });
  // }

  // handleDelete(item,list) {
  //   const { projectQaModels, dispatch } = this.props;
  //   const { clarificationDataSource = [], clarificationPagination = {} } = projectQaModels;
  //   let key =  clarificationDataSource
  //   key =  key.filter(ite => ite.poOrderId === item)
  //   console.log(key)
  //   if (key[0]._status === 'update') {
  //     const data = key
  //     dispatch({
  //             type: 'projectQaModels/deleteClarification',
  //             payload: {
  //               data,
  //             },
  //           }).then((res) => {
  //       if (res) {
  //         this.del(list)
  //       }
  //     })
  //   } else {
  //     this.del(list)
  //   }
  // }

  handleDelete(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/deleteClarification',
      payload: {
        data,
      },
    });
  }
  // 提交
  @Debounce(200)
  @Bind
  handleSubmit() {
    const { dispatch, match, poHeaderInfo } = this.props;
    const { proId, milestoneId } = match.params;
    const { selectedPurchaseRowsData = [], selectedClarificationRowsData = [] } = this.state;
    const purchaseQaId = selectedPurchaseRowsData.map(item => {
      return {
        qaId: item.qaId
      }
    })
    // if(!poHeaderInfo.existsSupplier) {
    //   return Modal.confirm({
    //     title: intl
    //     .get('bid.bidcommon.view.message.projectqareminder')
    //     .d('当前还未有供应商应标，请先做保存等待供应商应标后提交。'),
    //     okText: intl.get('hzero.common.cusModal.button.confirm').d('确认'),
    //     onOk: () => {
    //       this.handleSaveClarification();
    //     },
    //   })
    // }
    Modal.confirm({
      title: intl
        .get('bid.bidcommon.view.message.submitrequiretosupplier')
        .d('请确认是否提交项目答疑回复给供应商'),
      onOk: () => {
        this.handleSaveClarification(selectedClarificationRowsData).then((result) => {
          if (result) {
            this.handleSavePurchaseReply().then((res) => {
              const clarQaId = !isBoolean(result) && result.filter((item) => {
                return item.identificationTpye === 'y'
              }).map(i => {
                return {
                  qaId: i.qaId
                }
              })
              const qaIds = purchaseQaId.concat(clarQaId ? clarQaId : [])
              if (res) {
                dispatch({
                  type: 'projectQaModels/submitRows',
                  payload: {
                    proId: proId, // 项目Id
                    milestoneId: milestoneId, // 里程碑Id
                    values: qaIds, // CMI答复内容
                  },
                }).then((res) => {
                  if (res) {
                    notification.success({
                      message: intl
                        .get('bid.bidcommon.view.title.submitsuccessfully')
                        .d('提交成功'),
                    });
                    this.setState({
                      selectedRowKeys: [],
                      selectedRows: [],
                      selectedClarificationRowsData: [],
                      selectedPurchaseRowsData: []
                    });
                    this.getPurchaseReply();
                    this.getCmiContentList();
                    this.queryProjectQaMilestonesInfo();
                  }
                });
              }
            });
          }
        });
      },
    });
  }

  // 分配
  @Bind
  handleAssign(selectedRows, id) {
    const { dispatch } = this.props;
    const data = selectedRows;
    dispatch({
      type: 'projectQaModels/assign',
      payload: {
        qaId: [...data],
        employeeId: id,
      },
    }).then((res) => {
      if (res) {
        this.getPurchaseReply();
        notification.success();
        this.setState({
          selectedPurchaseRowsData: []
        })
      }
    });
  }

  render() {
    const {
      initLoading = false,
      form,
      projectQaModels: {
        purchaseReplyDataSource = [],
        purchaseReplyPagination = {},
        clarificationDataSource = [],
        clarificationPagination = {},
      },
      projectQaModels,
      poHeaderInfo,
      poHeaderMilestonesInfo,
      match,
      submitLoading = false,
      fetchPurchaseReplyLoading = false,
      fetchActiveClariLoading = false,
      savePurChaseLoading = false
    } = this.props;
    const { activeKey, submitFlag, timeFlag, groupUnsaveFlag, saveLoading, selectedPurchaseRowsData = [], selectedClarificationRowsData = []} = this.state;
    const projectQaInfoProps = {
      form,
      poHeaderInfo,
      initLoading: initLoading
    };
    const biddingRoundInfoProps = {
      form,
      poHeaderMilestonesInfo,
    };
    const purchaseReplyTableProps = {
      form,
      submitFlag,
      timeFlag,
      match,
      projectQaModels,
      dataSource: purchaseReplyDataSource,
      pagination: purchaseReplyPagination,
      fetchLoading: fetchPurchaseReplyLoading,
      saveLoading: savePurChaseLoading,
      onAssign: this.handleAssign,
      onSave: this.handleSavePurchaseReply,
      onChange: this.getPurchaseReply, // 分页查询
      unsaveFlag: groupUnsaveFlag, // 校验切换分页前是否存在未保存数据
      onEdit: (flag) => {
        this.setState({
          groupUnsaveFlag: flag,
        });
      },
      onPurchaseRow: (rows) => {
        this.setState({
          selectedPurchaseRowsData: rows
        })
      },
    };

    const activeClarificationTableProps = {
      submitFlag,
      timeFlag,
      dataSource: clarificationDataSource,
      pagination: clarificationPagination,
      fetchLoading: fetchActiveClariLoading,
      saveLoading: saveLoading ,
      onAddLine: this.handleAddClarificationLine,
      onDeleteLine: this.handleDeleteClarificationLine,
      onSave: this.handleSaveClarification,
      // onChange: this.getPurchaseReply,
      onPageChange: this.getCmiContentList, // 分页查询
      unsaveFlag: groupUnsaveFlag, // 校验切换分页前是否存在未保存数据
      onEdit: (flag) => {
        this.setState({
          groupUnsaveFlag: flag,
        });
      },
      onClarificationRow: (rows) => {
        this.setState({
          selectedClarificationRowsData: rows
        })
      },
      selectedRowKeys: selectedClarificationRowsData
    };
    // const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    return (
      <Fragment>
        <Header>
          <div style={{ marginRight: '16px' }}>
            <Button
              disabled={selectedPurchaseRowsData.length === 0 && selectedClarificationRowsData.length === 0}
              onClick={this.handleSubmit}
              loading={submitLoading}
            >
              {intl.get('bid.bidcommon.view.button.submit').d('提交')}
            </Button>
          </div>
        </Header>
        <Content className="content-bottom">
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <div>
              <Spin spinning={submitLoading}>
                <Collapse activeKey={activeKey} onChange={this.onCollapseChange}>
                  <Panel
                    header={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                    key="projectQaInfo"
                  >
                    <ProjectQaInfo {...projectQaInfoProps} />
                  </Panel>
                  <Panel
                    header={intl.get(`bid.bidcommon.view.title.qaround`).d('答疑轮次')}
                    key="biddingRound"
                  >
                    <BiddingRound {...biddingRoundInfoProps} />
                  </Panel>
                  <Panel
                    header={intl.get(`bid.bidcommon.view.title.replycontent`).d('CMI答复内容')}
                    key="purchaseReplyTable"
                  >
                    <PurchaseReplyTable {...purchaseReplyTableProps} />
                  </Panel>
                  <Panel
                    header={intl.get(`bid.bidcommon.view.title.activelyclarify`).d('CMI主动澄清')}
                    key="activeClarificationTable"
                  >
                    <ActiveClarificationTable {...activeClarificationTableProps} />
                  </Panel>
                </Collapse>
              </Spin>
            </div>
          </LocaleProvider>
        </Content>
      </Fragment>
    );
  }
}

export default projectQa;
