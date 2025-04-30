/**
 * DICT 合作伙伴管理
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/10/17
 * @Copyright: Copyright (c), 2024, hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusExcelExport from '_cus_components/CusExcelExport';
import { fastCodeLoader } from '@/utils/decorators';
import FilterForm from './Form';
import ListTable from './ListTable';
import { Bind } from 'lodash-decorators';
import CusModal from '_cus_components/CusModal';
import InvitationRegisterForm from './components/InvitationRegisterForm';
import dayjs from 'dayjs';
import { getCurrentOrganizationId } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { tableScrollWidth } from 'utils/utils';
import notification from 'utils/notification';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';
import { SRM_DICT } from '@/utils/config';

const { Panel } = Collapse;
const prompt = 'spfmhk.dict';
const tenantId = getCurrentOrganizationId();

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader(['DICT.PARTNER_STATUS', 'HKSP.SUP_CATEGORY', 'DICT.RECUITMENT_METHOD'])
@connect(({ loading, partnerManagement }) => ({
  partnerManagement,
  queryLoading: loading.effects['partnerManagement/queryPartnerManagementList'],
}))
export default class PartnerManagement extends Component {
  constructor(props) {
    super(props);
    this.form = {};
    this.invitationRegisterForm = {};
    this.state = {
      activeKey: ['form', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      invitationRegisterVisible: false,
      reviewPointDetailVisible: false,
      scoreDataSource: [],
      scoreColumnsPartnerTitle: '',
      newSorceDetail:[],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  // 查询
  @Bind()
  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'partnerManagement/queryPartnerManagementList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    });
  };

  // 获取form values
  getQueryParams = (type) => {
    const { selectedRows } = this.state;
    const fieldsValue = (this.form.props && this.form.props.form.getFieldsValue()) || {};
    if (type === 'export') {
      const recordIds = selectedRows?.map((i) => {
        return i.partnerId;
      });
      return {
        ...fieldsValue,
        objectIds: recordIds,
      };
    } else {
      return {
        ...fieldsValue,
      };
    }
  };

  // 邀请注册
  @Bind()
  invitationRegister() {
    this.setState({
      invitationRegisterVisible: true,
    });
  }

  // 发送邀请
  @Bind()
  sendInvitation() {
    const { dispatch } = this.props;
    this.invitationRegisterForm.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {
          cmpanyName: values.cmpanyName,
          businessRegistration: values.businessRegistration,
          inviteExplain: values.inviteExplain,
          email: values.email.toLowerCase(),
          organizationId: getCurrentOrganizationId(),
        };
        dispatch({
          type: 'partnerManagement/invitationRegister',
          payload: { ...params },
        }).then((res) => {
          if (res) {
            notification.success();
            this.setState({
              invitationRegisterVisible: false,
            });
          }
        });
      }
    });
  }

  // 主数据导出
  @Bind()
  masterDataExport() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const objectIds = selectedRows.map(item => {
      return item.partnerId
    })
    dispatch({
      type: 'partnerManagement/masterDataExport',
      payload: {
        ...this.getQueryParams(),
        objectIds: objectIds
      },
    }).then(res => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl.get(`${prompt}.export.master.data.fileName`).d('主数据导出报表') + `(${dayjs().format('YYYY-MM-DD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          Promise.resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  // 评审分数明细
  @Bind()
  handleReviewPoint(record) {
    const { dispatch } = this.props;
    const { partnerId, cmpanyName } = record;
    this.setState({
      reviewPointDetailVisible: true,
      scoreColumnsPartnerTitle: cmpanyName,
    });
    dispatch({
      type: 'partnerManagement/queryScore',
      payload: {
        partnerId,
      },
    }).then(res => {
      this.setState({
        scoreDataSource: res,
        newSorceDetail:res?.map((obj, index) => {
          if (index === res.length - 1) {
              return { ...obj, revItem: 'sumAll' }; // 展开最后一个对象并添加新属性
          }
          return obj; // 其他对象保持不变
        }),
      });
    });
  }

  @Bind()
  filterChildrenData(ratingScoreList) {
    if(ratingScoreList?.length > 0) {
      return ratingScoreList.map(item => {
        return {
          title: item.scoreBy,
          children: [
            {
              title: intl.get(`${prompt}.view.field.tech.scorevalue`).d('分值'),
              render: () => (<>{item.score}</>)
            },
            {
              title: intl.get(`${prompt}.view.field.tech.reason`).d('理由'),
              render: () => (<>{item.reason}</>)
            },
          ],
        }
      })
    }
    return [];
  }

  render() {
    const { queryLoading = false, idpValueMap, partnerManagement: { tableData = [], pagination = {} } } = this.props;
    const {
      activeKey,
      selectedRowKeys,
      invitationRegisterVisible,
      reviewPointDetailVisible,
      scoreDataSource=[],
      newSorceDetail=[],
      scoreColumnsPartnerTitle,
    } = this.state;
    const filterFormProps = {
      onRef: (ref) => {
        this.form = ref;
      },
      onSearch: this.handleSearch,
      idpValueMap,
    };
    const rowSelection = {
      selectedRowKeys,
      idpValueMap,
      onChange: (keys, rows) => {
        console.log('keys: ', keys, ' rows: ', rows);
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const listTableProps = {
      ...this.props,
      rowSelection,
      onChange: this.handleSearch,
      dataSource: tableData,
      pagination,
      handleReviewPoint: this.handleReviewPoint,
    };

    const scoreColumns = [
      {
        title: intl.get(`${prompt}.view.field.tech.majorscoreitem`).d('评分大项'),
        dataIndex: 'itemCase',
        key: 'itemCase',
        render: (text, row, index) => {
          if (row?.revItem === 'sumAll') {
            return {
              children: <span>{row?.itemCase}</span>,
              props: {
                colSpan: 2,
                // className: 'borderRightBolder'
              },
            }
          } else {
            return (
              tooltipRender(row?.itemCase)
            );
          }
        }
      },
      {
        title: intl.get(`${prompt}.view.field.tech.detailedscore`).d('评分细项'),
        dataIndex: 'itemCaseDetail',
        key: 'itemCaseDetail',
        render: (text, row, index) => {
          if (row?.revItem === 'sumAll') {
            return {
              props: {
                colSpan: 0,
                // className: 'borderRightBolder'
              },
            }
          } else {
            const htmlValue = row?.itemCaseDetail?.replace(/\\n/g, '<br />')
            return (
              tooltipRender(
                <span dangerouslySetInnerHTML={{ __html: htmlValue}} />
              )
            );
          }
        }
      },
      // {
      //   title: scoreColumnsPartnerTitle,
      //   // children: this.filterChildrenData(scoreDataSource[1]?.ratingScoreList),
      // },
    ];

    newSorceDetail[0] && newSorceDetail[0]?.scoreItemDetail.map((v, i) => {
      scoreColumns.push({
        key: `${i}`,
        title: scoreColumnsPartnerTitle,
        width: 150,
        // className: i > 0 ? 'borderBolder' : 'borderNone',
        children: [
          ...(v?.partnerScoreDetail).map((h, j) => {
            return {
              key: `${i}${j}`,
              dataIndex: `${i}${j}`,
              title: `${h?.scoreBy !== null ? h?.scoreBy : ''}`,
              // className: j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0 ? 'borderNone' : '',
              children: [
                {
                  key: `${i}${j}分值`,
                  dataIndex: `${i}${j}分值`,
                  title: intl.get(`${prompt}.view.field.tech.scorevalue`).d('分值'),
                  width: j == 0 && i > 0 ? 83 : 80,
                  // className: j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0 ? 'borderNone' : '',
                  render: (val, row, index) => {
                    if (row?.scoreItemDetail[i] && row?.scoreItemDetail[i].partnerScoreDetail[j] !== undefined) {
                      if (row.revItem === 'sumAll') {
                          return {
                            props: {
                              colSpan: 2,
                              style: {
                                borderLeft: 'none'
                              }
                            }
                          }
                      } else {
                        return (
                          <div style={{ textAlign: 'right' }}>
                            {numberRender(row.scoreItemDetail[i].partnerScoreDetail[j].score || 0, 0)}
                          </div>
                        )
                      }
                    }
                  }
                }, {
                  key: `${i}${j}理由`,
                  dataIndex: `${i}${j}理由`,
                  width: 100,
                  title: intl.get(`${prompt}.view.field.tech.reason`).d('理由'),
                  // className: `${styles['reasonClass']}`,
                  render: (val, row, index) => {
                    if (row?.scoreItemDetail[i] && row?.scoreItemDetail[i].partnerScoreDetail[j] !== undefined) {
                      if(row?.revItem === 'sumAll') {
                        return {
                          props: {
                            colSpan: 0,
                            style: {
                              borderLeft: 'none'
                            }
                          }
                        }
                      } else {
                        return (
                          tooltipRender(row.scoreItemDetail[i].partnerScoreDetail[j].reason || '')
                        )
                      }
                    }
                  }
                }
              ]
            }
          }),
          {
            key: "appraisalScoreItemAvg",
            dataIndex: "appraisalScoreItemAvg",
            title: intl.get(`${prompt}.view.score.average`).d('平均分'),
            width: 80,
            // className: j == 0 && i > 0 ? 'borderBolder' : j == 0 && i == 0 ? 'borderNone' : '',
            render: (val, row, index) => {
                if (row?.revItem === 'sumAll') {
                  return {
                      children:
                            <div style={{ textAlign: 'right' }}>
                              {numberRender(row.appraisalScoreItemAvg || 0, 1)}
                            </div>,
                    props: {
                      colSpan: 1,
                      style: {
                        borderLeft: 'none'
                      }
                    }
                  }
                }else{
                  return (
                    <div style={{ textAlign: 'right' }}>
                      {numberRender(row.appraisalScoreItemAvg || 0, 1)}
                    </div>
                  )
                }
              }
          }
        ]
      })
    })

    const dataExportProps = {
      requestUrl: `${SRM_DICT}/v1/${tenantId}/partner-infos/storage/export`,
      method: 'GET',
      downloadType: 'Blob',
      buttonText: intl.get(`${prompt}.view.field.portalanswerexport`).d('列表导出'),
      fileName: intl.get(`${prompt}.view.field.dictpartnerlistexport`).d('合作伙伴管理列表导出'),
      queryParams: this.getQueryParams('export'),
    };

    return (
      <PageWrapper loading={queryLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <FilterForm {...filterFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  <>
                    <CusExcelExport mini {...dataExportProps} />
                    <CusButton
                      mini
                      onClick={this.masterDataExport}
                    >
                      {intl.get(`${prompt}.view.button.master.data.export`).d('主数据导出')}
                    </CusButton>
                    <CusButton
                      mini
                      type="primary"
                      onClick={this.invitationRegister}
                    >
                      {intl.get(`${prompt}.view.button.directed.import`).d('定向引入')}
                    </CusButton>
                  </>
                }
              />
            }
            key="table"
          >
            <ListTable {...listTableProps} />
          </Panel>
        </Collapse>

        {/* 邀请注册Modal */}
        {invitationRegisterVisible && (
          <CusModal
            title={intl.get(`${prompt}.view.title.inviting.partner.register`).d('邀请合作伙伴注册')}
            visible={invitationRegisterVisible}
            destroyOnClose
            width={600}
            onCancel={() => this.setState({ invitationRegisterVisible: false })}
            onOk={this.sendInvitation}
            okText={intl.get(`${prompt}.view.button.send.invitation`).d('发送邀请')}
          >
            <InvitationRegisterForm
              onRef={ref => {
                this.invitationRegisterForm = ref;
              }}
              dispatch
            />
          </CusModal>
        )}

        {/*评审分数明细Modal*/}
        {reviewPointDetailVisible && <CusModal
          title={intl.get(`${prompt}.view.title.review.point.detail`).d('评审分数明细')}
          visible={reviewPointDetailVisible}
          destroyOnClose
          width={1200}
          onCancel={() => this.setState({ reviewPointDetailVisible: false })}
          cancelText={intl.get('hzero.common.button.close').d('关闭')}
        >
          <CusTable
            rowKey="ratingItemId"
            pagination={false}
            columns={scoreColumns}
            dataSource={newSorceDetail}
            scroll={{ x: tableScrollWidth(scoreColumns) }}
            bordered
          />
        </CusModal>}
      </PageWrapper>
    );
  }
}
