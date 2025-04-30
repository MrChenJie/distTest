/**
 * 审批状态（待办相关 - 应付账项组组长审核补充银行信息
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/18
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Col, Collapse, Row } from 'antd';
const { Panel } = Collapse;
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import { getLFormGridSpan } from 'srm-front-common/lib/utils/utils';
import CusButton from 'srm-front-common/lib/components/CusButton';
import BankTable from '@/routes/Approval/components/BankTable';
import AccountsPayableBasicForm from '@/routes/Approval/components/AccountsPayableBasicForm';
import AttachmentTable from '@/routes/Approval/components/AttachmentTable';

const prompt = 'spfmhk.supplier';
@Form.create()
export default class AccountsPayable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basicInfo', 'bank', 'bankAttachment'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
    }
  }

  componentDidMount() {
  }

  @Bind()
  handleSearch(values) {
    console.log(values);
  }

  render() {
    const { activeKey } = this.state;
    const applyFilterFormProps = {
      onSearch: this.handleSearch
    }
    const gridSpan = getLFormGridSpan();
    const { form: {getFieldDecorator} } = this.props;
    return (
      <PageWrapper>
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
                title={intl.get(`${prompt}.view.title.basicInfo`).d('基础信息')}
                arrowActive={activeKey.includes('basicInfo')}
              />
            }
            key="basicInfo"
          >
            <AccountsPayableBasicForm />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                arrowActive={activeKey.includes('bank')}
              />
            }
            key="bank"
          >
            <p>
              提示:
              <span>银行国际代码为8位或11位，如供应商确认的代码为8位，请选择末尾带有XXX等代码。对于中国境内的银行，请补充填写收款银行的“银行联行号”</span><br/>
              <span style={{paddingLeft: '30px'}}>若供应商有多余一种货币时，必须提供其他货币的银行账户资料。</span><br/>
              <span style={{paddingLeft: '30px'}}>供应商提供的账户名称必须跟收款人名称一致。</span>
            </p>
            <div className="table-operator">
              <CusButton>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
              <CusButton>{intl.get('hzero.common.button.edit').d('编辑')}</CusButton>
              <CusButton type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>
            </div>
            <BankTable />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.attachment`).d('银行附件')}
                arrowActive={activeKey.includes('bankAttachment')}
              />
            }
            key="bankAttachment"
          >
            <AttachmentTable />
          </Panel>
        </Collapse>
      </PageWrapper>
    )
  }
}
