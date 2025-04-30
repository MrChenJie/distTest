/**
 * index.js - 招标公告查看
 * @date: 2022-04-07
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Collapse, Form, Input, DatePicker } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload';
import notification from 'utils/notification';

const commonPrompt = 'hzero.common';
const { Panel } = Collapse;
const { YearPicker } = DatePicker;

@connect(({ loading = {}, contractSignUpNow = {} }) => ({
  contractSignUpNow,
}))
@formatterCollections({
  code: [ 'bid.bidcommon' ]
})
export default class SignUpNow extends Component {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      dataSource: this.props.contractSignUpNow.dataSource,
      signList: [],
      open: [],
    };
  }

  componentDidMount() {
    this.fetchList()
  }

  /**
   * fetchList - 查询公告信息
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractSignUpNow/getNoticeDetail',
      payload: {
        language: 'zh_CN'
      },
    })
  }

  /**
   * 立即报名
  */
   @Bind()
   goToSignUp() {
    const { dispatch } = this.props;
    const { signList } = this.state;
    dispatch({
      type: 'contractSignUpNow/goToSignUp',
      payload: {
        proId: 2,
        supplierNum: '',
        portalCompanyName:"xx公司",
        realName:"张三",
        email:"12313XXX@163.com",
        regionId:1,
        phone:"1345124",
        businessLicenseUrl:"营业执照地址",
        licenseFileUrl:"投标授权人文件"
      },
    }).then((res) => {
      notification.success({
        message: intl
          .get(`${commonPrompt}.warning.message.createNeedAfterSave`)
          .d('报名成功'),
      });
    })
   }

  handleChange = (e) => {//实现onChange方法我们先打印一下
    this.setState({[e.target.name]: value});//将value存入state中
  }
  render() {
    const {
      contractSignUpNow,
      pagination,
    } = this.props;
    const { dataSource = [] } = contractSignUpNow;
    const { open = [...Array(dataSource.length).keys(), signList] } = this.state;
    // this.setState({ signList: dataSource })
    // const {getFieldDecorator} = this.props.form;
    return (
      <Fragment>
        <Content title={intl.get(`${commonPrompt}.title.quotationInquiry`).d('招标公告')}>
          <Collapse defaultActiveKey={['0', '1']} pagination={pagination}>
            {dataSource.map((item, i) => {
              return (
                <Panel header={item.cnSimpleNoticeTitle} key={i}>
                  <div style={{ display: 'flex' }}>
                    <p style={{ marginRight: '30px' }}>
                      <span style={{ color: '#0086D0' }}>{item.noticeType}</span> || 1234
                    </p>
                    <p>
                      <span>{item.signUpEndTime}</span>截止
                    </p>
                  </div>
                  <div>{item.cnSimpleNoticeContent}</div>
                  <Form.Item label="公司名称" labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <Input style={{ width: '15vw' }} />
                    {/* {getFieldDecorator('supplierNum', {
                      initialValue: item.supplierNum,
                      })(<Input style={{ width: '150px' }} onChange={(e)=>this.handleChange(e)} />)} */}
                  </Form.Item>
                  <Form.Item label={intl.get(`bid.bidcommon.view.title.bidcontactor`).d("投标联系人")} labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <Input style={{ width: '15vw' }} />
                  </Form.Item>
                  <Form.Item label="电话" labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <Input style={{ width: '15vw' }} />
                  </Form.Item>
                  <Form.Item label="邮箱" labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <Input style={{ width: '15vw' }} />
                  </Form.Item>
                  <Form.Item label="公司注册年份" labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <YearPicker onChange={this.onChangeDate} placeholder="Select year" style={{ width: '15vw' }} />
                  </Form.Item>
                  <Form.Item label="公司注册地点" labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <Input style={{ width: '15vw' }} />
                  </Form.Item>
                  <Form.Item label="统一社会信用代码" labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <Input style={{ width: '15vw' }} />
                  </Form.Item>
                  <Form.Item label="上传营业执照或者BR证书" labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <Upload>
                      <Button>点击上传</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item label="投标代表人授权文件" labelCol={{ span: 9 }} style={{ display: 'flex' }}>
                    <Upload>
                      <Button>点击上传</Button>
                    </Upload>
                  </Form.Item>
                  <Button type="submit" style={{ margin: '0 40%'}} onClick={this.goToSignUp}>立即报名</Button>
                </Panel>
              )
            })}
          </Collapse>
        </Content>
      </Fragment>
    );
  }
}
