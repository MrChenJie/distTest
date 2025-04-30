/**
 * index.js - 协议拟制列表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Select, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum } from 'lodash';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRules: false,
      num: 10, // 倒计时初始化的值
      timeNum: 10, // 按钮倒计时的值
      timeendState: true,
    };
  }
  @Bind
  isConfirm() {
    this.setState({
      showRules: true,
      timeendState: true,
    });
    this.timeOut();
  }
  // 十秒倒计时
  @Bind
  timeOut() {
    this.timer = setInterval(() => {
      this.state.num -= 1;
      this.state.timeNum = this.state.num;
      if (this.state.timeNum === 0) {
        this.setState({
          timeendState: false,
        });
        clearInterval(this.timer);
      }
    }, 1000);
  }
  @Bind
  handleOk() {
    // 倒计时结束后才可点击确定
    this.setState({
      showRules: false,
      timeendState: false,
    });
  }
  @Bind
  handleCancel() {
    clearInterval(this.timeOut());
    this.setState({
      showRules: false,
      timeendState: false,
    });
  }

  @Bind
  chooiceName() {
    
  }

  render() {
    const {
      loading,
      dataSource = [],
      onSearch,
      pagination,
      selectedRows,
      selectedRowKeys = [],
      onRowSelectChange = (e) => e,
      handleDataChange = (e) => e,
      contractMaintain,
      ...others
    } = this.props;
    const columns  = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyNum`).d('评委类型'),
        dataIndex: 'judgesType',
        width: 150,
        render: (row) => (
          <Select
            placeholder="请选择"
            value={row.judgesType}
            style={{ width: '100%' }}
            onChange={this.handleCurrencyChange}
          >
            <Select.Option value="type1">需求部门指派</Select.Option>
            <Select.Option value="type2">CMI评委库抽取</Select.Option>
            <Select.Option value="type3">外部专家</Select.Option>
          </Select>
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('评委姓名'),
        dataIndex: 'name',
        width: 150,
        render: (row) => (
          <Input
            type="text"
            value={row.name}
            onClick={this.chooiceName}
            placeholder={intl.get('spcm.paymentRequest.placeholder.pleaseinput').d('请输入')}
          />
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('评委所在部门'),
        dataIndex: 'department',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('电话'),
        dataIndex: 'mobile',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('邮箱'),
        dataIndex: 'email',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('状态'),
        dataIndex: 'effectState',
        width: 120,
        render: (row) => (
          <Select
            placeholder="请选择"
            value={row.effectState}
            style={{ width: '100%' }}
            onChange={this.handleCurrencyChange}
          >
            <Select.Option value="type1">参加</Select.Option>
            <Select.Option value="type2">无效</Select.Option>
          </Select>
        ),
      },
      ,
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('阅读评委守则状态'),
        dataIndex: 'judgesRuleState',
        width: 180,
        render: () => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button type="dashed">待确认</Button>
              <Button type="primary" onClick={this.isConfirm}>
                确认
              </Button>
              <Button type="primary" disabled>
                已查看
              </Button>
            </div>
          );
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('备注'),
        dataIndex: 'remark',
        width: 150,
      }
    ].filter(Boolean);
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection: {
        selectedRowKeys,
        onChange: onRowSelectChange,
        onDataChange: handleDataChange,
      },
      bordered: true,
      // rowKey: 'resultId',
      // onChange: (page) => onSearch(page),
      pagination,
      ...others,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    return (
      <>
        <EditTable {...tableProps} />
        {/* <Modal
          title={intl.get('hzero.common.button.import.result').d('评委守则')}
          visible={this.state.showRules}
          footer={null}
          destroyOnClose
          width={900}
          style={{ top: 150 }}
          onCancel={this.handleCancel}
        >
          <div
            style={{
              fontSize: '14px',
              marginTop: '10px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <h1>中国移动国际有限公司采购项目评审工作守则</h1>
            <h4 style={{ textAlign: 'left' }}>
              以下工作守则参照《采购政策》及《中国移动采购领域人员廉洁从业行为规范(2019版)》要求制定，请评委严格遵守：
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              一、自觉遵守香港政府相关法律法规，切实维护国家和香港特区利益、企业利益。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              二、若与投标人有利害关系（有以下情形之一的），应当主动提出并回避。
            </h4>
            <h4 style={{ textIndent: '25px', textAlign: 'left' }}>
              （一）投标人主要负责人或其近亲属；
            </h4>
            <h4 style={{ textIndent: '25px', textAlign: 'left' }}>
              （二）与投标人有经济利益关系，可能影响对投标公正评审的；
            </h4>
            <h4 style={{ textIndent: '25px', textAlign: 'left' }}>
              （三）曾因在招标、评标以及其他与招标投标有关活动中从事违法行为而受过行政处罚或刑事处罚的。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              三、不私下与投标人接触，不收受投标人给予的财物或者其他好处，不向招标人征询确定中标人的意向，不接受任何单位或者个人明示或者暗示提出的倾向或者排斥特定投标人的要求，不做出其他不客观、不公正履行职务的行为。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              四、评标期间，按时参加评标，履行评委职责，严格按照招标文件规定的评标标准和方法评标。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              五、评标期间，不做出暗示或者诱导投标人澄清、说明的行为，不接受投标人主动提出的澄清、说明。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              六、评标期间，所有对外活动及问题的澄清，都必须由采购部指定的专门人员统一对外，严禁未经许可擅自与投标人接触。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              七、评标期间，所有文件、资料和各种表格等只限于在评标期间使用，不得外传，评标结束后应删除全部评标用文件。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              八、评标期间，认真地履行职责，遵守职业道德，排除干扰，对所提出的评审意见承担个人责任。评委没有义务也不允许向其所在单位领导汇报评标有关情况。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              九、对评标情况严加保密，不向外界透露任何评标情况。
            </h4>
            <h4 style={{ textAlign: 'left' }}>
              十、评标期间，如发现违规、违法行为，将承担个人责任。
            </h4>
            <h2 style={{ textAlign: 'left', fontWeight: 'bold' }}>
              本人承诺完全遵守上述评标工作守则。
            </h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              key="submit"
              type="primary"
              style={{ textAlign: 'center', display: this.state.timeendState ? 'block' : 'none' }}
              disabled
            >
              我已阅读，确认守则内容(<span>{this.state.timeNum}</span>s)
            </Button>
            <Button
              key="submit"
              type="primary"
              style={{ textAlign: 'center', display: !this.state.timeendState ? 'block' : 'none' }}
              onClick={this.handleOk}
            >
              我已阅读，确认守则内容
            </Button>
          </div>
        </Modal> */}
      </>
    );
  }
}
