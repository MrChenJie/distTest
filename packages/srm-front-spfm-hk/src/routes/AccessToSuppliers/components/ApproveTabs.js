import React, { PureComponent } from 'react';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import Purchase from '@/routes/AccessToSuppliers/components/Purchase';
import Finance from '@/routes/AccessToSuppliers/components/Finance';
import '../index.less'
import intl from 'utils/intl';
const prompt = 'spfmhk.supplier';

export default class ApproveTabs extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabActiveKey: '1',
    }
  }

  componentDidMount() {
    const { nextActivityCode, processType } = this.props;
    if(['CG02', 'CG03'].includes(nextActivityCode) || processType === 'N') { // 供应商类别为财务付款时也默认选中第二个tab
      this.setState({
        tabActiveKey: '2',
      })
    }
  }

  render() {
    const { tabActiveKey } = this.state;
    const {
      supplierCategory,
      purchase,
      finance,
      setCurrentTab,
      affairTitle,
      currentActivityCode,
      processType,
      state,
      backAffairTitle,
      disabledEdit,
      companyName,
      registrationNumber,
      initialValues,
    } = this.props;
    const tabItems = [
      {
        key: '1',
        label: intl.get(`${prompt}.view.title.purchase.supplier`).d('采购供应商'),
        children: (
          <Purchase
            props={this.props}
            purchase={purchase}
            supplierCategory={supplierCategory}
            affairTitle={affairTitle}
            currentActivityCode={currentActivityCode}
            processType={processType}
            state={state}
            backAffairTitle={backAffairTitle}
            disabledEdit={disabledEdit}
            companyName={companyName}
            registrationNumber={registrationNumber}
          />
        ),
      },
      {
        key: '2',
        label: intl.get(`${prompt}.view.title.finance.supplier`).d('财务供应商'),
        children: (
          <Finance
            props={this.props}
            finance={finance}
            supplierCategory={supplierCategory}
            affairTitle={affairTitle}
            currentActivityCode={currentActivityCode}
            processType={processType}
            state={state}
            backAffairTitle={backAffairTitle}
            disabledEdit={disabledEdit}
            companyName={companyName}
            registrationNumber={registrationNumber}
            initialValues={initialValues}
          />
        ),
      },
    ].filter(Boolean);
    return (
      <div className="tabs-wrapper">
        <CusSearchTabs
          activeKey={tabActiveKey}
          items={tabItems}
          moreIcon={false}
          onChange={(key) => {
            console.log(key === '1', `key === '1'`);
            setCurrentTab(key === '1')
            this.setState({
              tabActiveKey: key,
            });
          }}
        />
      </div>
    )
  }
}
