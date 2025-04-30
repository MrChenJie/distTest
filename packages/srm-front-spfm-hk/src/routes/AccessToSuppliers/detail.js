/**
 * 供应商准入 - 线条审批信息查看
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/28
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import EditTable from '_cus_components/EditTable';
import CusTabs from '_cus_components/CusTabs';
import { Checkbox, Form } from 'hzero-ui';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import PageMessage from '_cus_components/Page/PageMessage';

import { Bind } from 'lodash-decorators';
import ApproveTabs from '@/routes/AccessToSuppliers/components/ApproveTabs';
import BasicForm from '@/routes/AccessToSuppliers/components/BasicForm';
import queryString from 'query-string';
import { ready } from '@/plugin/udc-sdk-esm';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';
const realName = getCurrentUser().realName;

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader([])
@connect(({ accessToSupplierHK, loading }) => ({
  accessToSupplierHK,
  queryLoading: loading.effects['accessToSupplierHK/previewSupplierDetail'],
  previewData: accessToSupplierHK.previewData || {},
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'contact'],
      tabActiveKey: '1',
      purchase: true,
      finance: false,
      currentActivityCode: '',
      nextActivityCode: '',
      affairTitle: '',
      backAffairTitle: '', // 退回待办标题
      processType: 'Y', // 默认是采购供应商
      state: null,
      companyName: null,
      registrationNumber: null,
    };
    this.platform = {};
    this.setCurrentTab = this.setCurrentTab.bind(this);
  }

  componentDidMount() {
    this.getSupplierDetailData();
    // 致远自定义按钮
    const {
      location: { search },
      previewData,
    } = this.props;
    const { supplierId, formRecordId, caseId, state, permissionType } = queryString.parse(
      search.substring(1)
    );
    const id = supplierId || formRecordId;

    // if(state === 'PENDING' && permissionType === 'SEND') {
    //   console.log('退回单');
    //   ready({
    //     mode: 'iframe',
    //     tenant: 'CMI',
    //   },(instance) => {
    //     console.log(ready, 'ready');
    //     //  调用iframeSdk为CMI定制API insertBtnForToolbar, 不设置id，默认为当前页面第一个iframe控件插入按钮
    //     instance.getCustomApi().insertBtnForToolbar({
    //       // 按钮插入位置
    //       position: 1,
    //       btns: [{
    //         // 按钮名称
    //         name: intl.get(`${prompt}.view.button.update.info`).d('信息修改'),
    //         buttonType: 'primary',
    //         customEvents: [
    //           {
    //             type: 'click',
    //             func: () => {
    //               // 业务逻辑
    //               window.open(`/pub/spfm-hk/supplier/edit-admittance?supplierId=${id}&caseId=${caseId}`);
    //             }
    //           }
    //         ]
    //       }]
    //     });
    //   });
    // }
  }

  @Bind()
  setCurrentTab(val) {
    this.setState({
      purchase: val,
      finance: !val,
    });
  }

  @Bind()
  async getSupplierDetailData() {
    const {
      location: { search },
      dispatch,
    } = this.props;
    const { supplierId, formRecordId, state, caseId } = queryString.parse(search.substring(1));
    console.log(state, 'state');
    let supplierCategory;
    let id;
    let nextActivityCode;
    let supplierName;
    let affairTitle;
    let backAffairTitle; // 退回待办标题
    let processType;
    await dispatch({
      type: 'accessToSupplierHK/previewSupplierDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then((res) => {
      supplierCategory = res?.head?.supplierCategory;
      id = res?.head?.id;
      supplierName = res?.head?.companyNameCh;
      console.log(supplierName, 'supplierName');
      if (res?.head?.supModifyState === 'Draft') {
        ready(
          {
            mode: 'iframe',
            tenant: 'CMI',
          },
          (instance) => {
            console.log(ready, 'ready');
            //  调用iframeSdk为CMI定制API insertBtnForToolbar, 不设置id，默认为当前页面第一个iframe控件插入按钮
            instance.getCustomApi().insertBtnForToolbar({
              // 按钮插入位置
              position: 1,
              btns: [
                {
                  // 按钮名称
                  name: intl.get(`${prompt}.view.button.update.info`).d('信息修改'),
                  buttonType: 'primary',
                  customEvents: [
                    {
                      type: 'click',
                      func: () => {
                        // 业务逻辑
                        window.open(
                          `/pub/spfm-hk/supplier/edit-admittance?supplierId=${res?.head?.id}&caseId=${caseId}`
                        );
                        window.parent?.postMessage(
                          {
                            messageType: 'CLOSE_WINDOW',
                          },
                          '*'
                        );
                      },
                    },
                  ],
                },
              ],
            });
          }
        );
      }
      // 草稿状态：当前用户=该供应商业务员时，才可以编辑
      if(res?.head?.supModifyState === 'Draft' && res?.head?.salesman === realName) {
        this.setState({
          disabledEdit: false, // 编辑权限
        })
      } else {
        this.setState({
          disabledEdit: true, // 编辑权限
        })
      }
      this.setState({
        companyName: res?.head?.companyNameCh,
        registrationNumber: res?.head?.registrationNumber,
      });
    });
    await dispatch({
      type: 'accessToSupplierHK/getNodeInfo',
      payload: {
        formRecordId: supplierId || formRecordId,
        templateCode: 'BMP-CGGYSZR',
      },
    }).then((res) => {
      if (res) {
        nextActivityCode = res?.nextActivityCode;
        console.log(res?.currentActivityCode, 'currentActivityCode');
        console.log(nextActivityCode, 'nextActivityCode');
        if (supplierCategory !== 'FINANCIALPAYMENT') {
          processType = 'Y';
          switch (nextActivityCode) {
            case 'CG01':
              affairTitle =
                intl.get(`${prompt}.todotask.bankinfo`).d(`补充银行信息：`) + supplierName;
              backAffairTitle =
                intl.get(`${prompt}.todotask.procuresup.access`).d(`采购供应商准入`) + supplierName;
              break;
            case 'CG02':
              affairTitle =
                intl.get(`${prompt}.todotask.bankinfo`).d(`补充银行信息：`) + supplierName;
              backAffairTitle =
                intl.get(`${prompt}.todotask.bankinfo`).d(`补充银行信息：`) + supplierName;
              break;
            case 'CG03':
              affairTitle =
                intl.get(`${prompt}.todotask.procuresup.access`).d(`采购供应商准入`) + supplierName;
              backAffairTitle =
                intl.get(`${prompt}.todotask.bankinfo`).d(`补充银行信息：`) + supplierName;
              break;
            default:
              affairTitle =
                intl.get(`${prompt}.todotask.procuresup.access`).d(`采购供应商准入`) + supplierName;
              backAffairTitle =
                intl.get(`${prompt}.todotask.procuresup.access`).d(`采购供应商准入`) + supplierName;
          }
        }
        if (supplierCategory === 'FINANCIALPAYMENT') {
          affairTitle =
            intl.get(`${prompt}.todotask.nonprocuresup.access`).d(`非采购供应商准入`) +
            supplierName;
          processType = 'N';
        }
        this.setState({
          currentActivityCode: res?.nextActivityCode, //  当前节点需要操作后才更新，所以这里取下一节点
          nextActivityCode: res?.nextActivityCode,
          // tabActiveKey: ['CG02', 'CG03'].includes(res?.nextActivityCode) ? '2' : '1', // 默认选中第二个tab 这里暂时注释
          finance: ['CG02', 'CG03'].includes(res?.nextActivityCode) || processType === 'N',
          purchase: !['CG02', 'CG03'].includes(res?.nextActivityCode),
          affairTitle,
          processType,
          tabActiveKey: '2', // 拿到所有数据后再切换到第二个tab
          state,
        });
      }
      console.log(affairTitle, 'affairTitle');
    });
  }

  // 联系人信息表格
  @Bind()
  contactPersonTableColumns() {
    return [
      {
        title: intl.get(`${prompt}.table.contact.info.type`).d('联系人类型'),
        dataIndex: 'typeMeaning',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'name',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.table.contact.info.email`).d('电邮'),
        dataIndex: 'email',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.table.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        align: 'left',
        width: 100,
        render: (values, record) => {
          const {
            form: { getFieldDecorator },
          } = this.props;
          return (
            <Form.Item>
              {getFieldDecorator(`isDefault${record.id}`, {
                initialValue: record?.isDefault,
              })(<Checkbox checked={record.isDefault === 'Y'} disabled />)}
            </Form.Item>
          );
        },
      },
    ];
  }

  render() {
    const {
      activeKey,
      purchase,
      finance,
      tabActiveKey,
      currentActivityCode,
      nextActivityCode,
      affairTitle,
      processType,
      state,
      backAffairTitle,
      disabledEdit,
      companyName,
      registrationNumber,
    } = this.state;
    const { previewData, queryLoading } = this.props;
    const { contacts } = previewData;
    const supplierCategory = previewData?.head?.supplierCategory;
    const basicFormProps = {
      disabled: true,
      initialValues: {
        ...previewData.head,
      },
    };
    const contactPersonTableColumns = this.contactPersonTableColumns();
    const contactPersonRowSelection = {
      getCheckboxProps: (record) => ({
        disabled: true,
      }),
    };
    const approveTabsProps = {
      supplierCategory: supplierCategory,
      setCurrentTab: this.setCurrentTab,
      purchase,
      finance,
      currentActivityCode,
      nextActivityCode,
      affairTitle,
      processType,
      state,
      backAffairTitle,
      disabledEdit,
      companyName, // dict获取数据的参数
      registrationNumber, // dict获取数据的参数
      initialValues: {
        ...previewData.head
      }
    };

    const tabItems = [
      {
        key: '1',
        label: intl.get(`${prompt}.view.title.basic.information`).d('基本信息'),
        children: (
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
            style={{ border: 'none' }}
          >
            {/* 基本信息 */}
            <Panel
              data-border={false}
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                  arrowActive={activeKey.includes('basic')}
                />
              }
              key="basic"
            >
              <p>
                {intl
                  .get(`${prompt}.view.title.basicInfo.tips`)
                  .d(
                    '适用于企业、个体工商户、事业单位等，通过营业执照，组织机构代码等相关资质进行认证'
                  )}
              </p>
              <BasicForm
                {...basicFormProps}
                onRef={(ref) => {
                  this.platform = ref;
                }}
              />
            </Panel>
            <Panel
              data-border={false}
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.contact.person`).d('联系信息')}
                  arrowActive={activeKey.includes('contact')}
                />
              }
              key="contact"
            >
              <p>
                {intl
                  .get(`${prompt}.view.title.contact.tips`)
                  .d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。')}
              </p>
              <EditTable
                bordered
                pagination={false}
                dataSource={contacts}
                columns={contactPersonTableColumns}
                rowSelection={contactPersonRowSelection}
                rowKey="id"
              />
            </Panel>
          </Collapse>
        ),
      },
      {
        key: '2',
        label: intl.get(`${prompt}.view.title.access.info`).d('准入信息'),
        children: <ApproveTabs props={this.props} {...approveTabsProps} />,
      },
    ].filter(Boolean);

    return (
      <PageWrapper loading={queryLoading}>
        <div style={{ margin: '-16px', marginBottom: '16px' }}>
          <PageMessage>
            <div>{intl.get(`${prompt}.view.supplier.entrytip.tips`).d('提示：')}</div>
            <div>
              {intl
                .get(`${prompt}.view.supplier.entrytip1.tips`)
                .d('1.采购员可在采购侧线条补充采购供应商信息，准入完成后，更新为合格供应商。')}
            </div>
            <div>
              {intl
                .get(`${prompt}.view.supplier.entrytip2.tips`)
                .d(
                  '2.财务可以在财务信息页签维护该供应商的银行信息、A2P供应商的业务信息和网络信息。'
                )}
            </div>
          </PageMessage>
        </div>
        <CusTabs
          activeKey={tabActiveKey}
          items={tabItems}
          moreIcon={false}
          onChange={(key) => {
            this.setState({ tabActiveKey: key });
          }}
        />
      </PageWrapper>
    );
  }
}
