/**
 * 供应商准入 - 财务转合格
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/11
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
import CusButton from '_cus_components/CusButton';
import EditTable from '_cus_components/EditTable';
import BasicInfoForm from '@/routes/AccessToSuppliers/components/BasicInfoForm';
import uuid from 'uuid/v4';

import './index.less';
import { Bind } from 'lodash-decorators';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@formatterCollections({ code: [prompt] })
@fastCodeLoader([

])
@connect(({ loading }) => ({

}))
export default class Approve extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ["basicInformation", "contactPerson", "clientInformation"],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      contactPersonDataSource: [], // 联系人Table data
      clientTableDataSource: [], // 客户信息Table data
      selectedRows: [],
      selectedRowKeys: [],
    };
    this.formRef = React.createRef();
  }
  componentDidMount() {

  }

  // 下一步操作
  @Bind()
  nextStep(e) {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((error, values) => {
      if(!error){
        this.onRef(values);
      }
    })
  }

  // 联系人信息表格
  @Bind()
  contactPersonTableColumns() {
    return [
      {
        title: intl.get(`${prompt}.contact.info.type`).d('联系人类型'),
      },
      {
        title: intl.get(`${prompt}.contact.info.name`).d('姓名')
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话')
      },
      {
        title: intl.get(`${prompt}.contact.info.email`).d('电邮')
      },
      {
        title: intl.get(`${prompt}.contact.info.default`).d('默认联系人')
      },
    ]
  }

  // 新增一行联系人信息
  @Bind()
  handleAddContactPersonData() {
    const { contactPersonDataSource } = this.state;
    this.setState({
      contactPersonDataSource: [...contactPersonDataSource, { id: uuid(), _status: 'create' }],
    });
  }

  // 删除一行联系人信息
  @Bind()
  handleDelContactPersonData() {
    const { contactPersonDataSource = [], selectedRows = [] } = this.state;
    this.setState({
      dataSource: contactPersonDataSource.filter(r => selectedRows.every(rd => rd.id !== r.id)),
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  // 客户信息表格
  @Bind()
  clientInfoTableColumns() {
    return [
      {
        title: intl.get(`${prompt}.contact.info.company.name`).d('公司名称'),
      },
      {
        title: intl.get(`${prompt}.contact.info.company.name`).d('联系人'),
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
      },
      {
        title: intl.get(`${prompt}.contact.info.company.name`).d('电邮'),
      },
    ]
  }

  // 联系人信息表格checkBox
  @Bind()
  handleRowSelectionChange(_, selectedRows = []) {

  }

  @Bind()
  onRef(values) {
    console.log(values);
  }

  render() {
    const { activeKey, contactPersonDataSource, selectedRows, selectedRowKeys, clientInfoTableDataSource } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectionChange,
    };
    const contactPersonTableColumns = this.contactPersonTableColumns();
    const clientInfoTableColumns = this.clientInfoTableColumns();
    const basicInfoFormProps = {
      onRef: this.onRef
    };
    return (
      <PageWrapper>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          {/* 基本信息 */}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                arrowActive={activeKey.includes('basicInformation')}
              />
            }
            key="basicInformation"
          >
            <p>{ intl.get(`${prompt}.view.title.basicInfo.tips`).d('适用于企业、个体工商户、事业单位等，通过营业执照，组织机构代码等相关资质进行认证') }</p>
            <BasicInfoForm {...basicInfoFormProps}/>
          </Panel>
          {/* 联系人信息 */}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.contact.person`).d('联系信息')}
                arrowActive={activeKey.includes('contactPerson')}
              />
            }
            key="contactPerson"
          >
            <p>{ intl.get(`${prompt}.view.title.contact.tips`).d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。') }</p>
            <div className="table-operator">
              <CusButton>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
              <CusButton>{intl.get('hzero.common.button.edit').d('编辑')}</CusButton>
              <CusButton type="primary" onClick={this.handleAddContactPersonData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>
            </div>
            <EditTable
              bordered
              pagination={false}
              dataSource={contactPersonDataSource}
              columns={contactPersonTableColumns}
            />
          </Panel>
          {/* 客户信息 */}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.client.information`).d('客户信息')}
                arrowActive={activeKey.includes('clientInformation')}
              />
            }
            key="clientInformation"
          >
            <p>{ intl.get(`${prompt}.view.title.client.tips`).d('提示: 建议填写合作的客户单位，供参考。') }</p>
            <div className="table-operator">
              <CusButton>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
              <CusButton>{intl.get('hzero.common.button.edit').d('编辑')}</CusButton>
              <CusButton type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>
            </div>
            <EditTable
              bordered
              pagination={false}
              dataSource={clientInfoTableDataSource}
              columns={clientInfoTableColumns}
            />
            <div style={{
              textAlign: 'right'
            }}>
              <CusButton
                type="primary"
                onClick={this.nextStep}
              >
                {intl.get('hzero.common.button.next').d('下一步')}
              </CusButton>
            </div>
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
