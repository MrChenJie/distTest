/**
 * @since 2019-12-03
 * @author WT <tao13.wang@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import {
  DataSet,
  Table,
  Button,
  Modal,
  Tree,
  Form,
  TextField,
  IntlField,
  Lov,
  Switch,
  NumberField,
} from 'choerodon-ui/pro';
import { Row, Col, Input, Icon, Dropdown, Menu, Badge, Collapse, Tabs, Select } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { Button as ButtonPermission } from 'components/Permission';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { formDS, treeDS, employeeTableDS } from '@/stores/positionDS';
import {
  updatePositionInformation,
  disablePosition,
  enablePosition,
} from '@/services/newOrganizationService';

import styles from './index.less';

const { Search, Group } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;
const statusMap = ['error', 'success'];

export default class Position extends React.Component {
  constructor(props) {
    super(props);
    this.treeDS = new DataSet(treeDS);
    this.formDS = new DataSet(formDS);
    this.employeeTableDS = new DataSet(employeeTableDS);
    this.state = {
      basicInformation: {
        positionCode: '',
        positionName: '',
        enabledFlag: '',
      },
      panelKey: 'information',
      searchValue: null,
      optionValue: undefined,
    };
  }

  componentDidMount() {
    this.treeDS.addEventListener('load', this.loadData);
  }

  componentWillUnmount() {
    this.treeDS.addEventListener('load', this.loadData);
  }

  @Bind()
  loadData() {
    const initData = this.treeDS.toData()[0] || { positionId: '' };
    const { positionId } = initData;
    this.setState({ basicInformation: initData });
    if (positionId !== '') {
      this.employeeTableDS.setQueryParameter('positionId', positionId);
      this.employeeTableDS.query();
    } else {
      this.employeeTableDS.setQueryParameter('positionId', 0);
      this.employeeTableDS.query();
    }
  }

  get employeeColumn() {
    return [
      {
        name: 'employeeCode',
      },
      {
        name: 'name',
      },
      {
        name: 'gender',
        renderer: ({ value }) =>
          value === 0
            ? intl.get('hpfm.organization.model.position.men').d('男')
            : intl.get('hpfm.organization.model.position.women').d('女'),
      },
      {
        name: 'mobile',
        width: 130,
      },
      {
        name: 'email',
        width: 180,
      },
      {
        name: 'unitName',
      },
      {
        name: 'positionName',
      },
      {
        name: 'primaryPositionFlag',
        align: 'left',
        width: 100,
        renderer: ({ value }) => {
          const tempFlag = value === 0 || value === '0' ? 0 : 1;
          return (
            <Badge
              status={statusMap[tempFlag]}
              text={
                tempFlag
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')
              }
            />
          );
        },
      },
      {
        name: 'status',
        renderer: ({ value }) => {
          const tempFlag = value === 'LEAVE' ? 0 : 1;
          let textFiled;
          switch (value) {
            case 'ON':
              textFiled = intl.get('hpfm.organization.model.position.onPosition').d('在职');
              break;
            case 'TRIAL':
              textFiled = intl.get('hpfm.organization.model.position.trial').d('试用');
              break;
            case 'INTERNSHIP':
              textFiled = intl.get('hpfm.organization.model.position.practice').d('实习');
              break;
            case 'LEAVE':
              textFiled = intl.get('hpfm.organization.model.position.leave').d('离职');
              break;
            default:
              return;
          }
          return <Badge status={statusMap[tempFlag]} text={textFiled} />;
        },
      },
    ];
  }

  // 公司查询
  @Bind()
  searchAllFormation(record) {
    const { searchCompanyAndDepartmentDS } = this.props;
    this.setState({ optionValue: undefined });
    if (searchCompanyAndDepartmentDS.current) {
      const { unitCompanyId = null, unitDepartmentId = null } =
        searchCompanyAndDepartmentDS.current.toJSONData() || {};
      this.treeDS.setQueryParameter('unitCompanyId', unitCompanyId);
      this.treeDS.setQueryParameter('unitId', unitDepartmentId);
    }
    this.treeDS.setQueryParameter('keyWord', record);
    this.treeDS.query();
  }

  // 新建或者更新公司信息
  @Bind()
  handelCreatePosition({ type, record = {} }) {
    switch (type) {
      case 'create':
        this.openModal(
          record,
          intl.get('hpfm.organization.view.message.create').d('新建岗位'),
          type
        );
        break;
      case 'createLevelCompany':
        this.openModal(
          record.toData(),
          intl.get('hpfm.organization.view.message.createLevelPosition').d('新建平级岗位'),
          type
        );
        break;
      case 'createChildrenCompany':
        this.openModal(
          record.toData(),
          intl.get('hpfm.organization.view.message.createChildrenPosition').d('新建下级岗位'),
          type
        );
        break;
      case 'edit':
        this.openModal(
          this.state.basicInformation,
          intl.get('hsrh.organization.view.message.editPosition').d('编辑岗位'),
          type
        );
        break;
      default:
    }
  }

  // 禁用公司
  @Bind()
  async handelDisabledPosition({ record = {} }) {
    const res = await disablePosition(record.toData());
    if (res && res.failed) {
      notification.error({
        message: res.message,
      });
    } else {
      this.treeDS.query();
      notification.success({
        message: intl.get('hpfm.organization.view.message.operationSuccess').d('操作成功！'),
      });
    }
  }

  // 启用公司
  @Bind()
  async handelEnablePosition({ record = {} }) {
    const res = await enablePosition(record.toData());
    if (res && res.failed) {
      notification.error({
        message: res.message,
      });
    } else {
      this.treeDS.query();
      notification.success({
        message: intl.get('hpfm.organization.view.message.operationSuccess').d('操作成功！'),
      });
    }
  }

  @Bind()
  async handleCreate() {
    const validate = await this.formDS.validate();
    if (validate) {
      const data = this.formDS.toData();
      const { unitCompanyId } = data[0];
      this.formDS.setQueryParameter('unitCompanyId', unitCompanyId);
      const res = await this.formDS.submit();
      if (res && res.success) {
        this.treeDS.query();
      }
      return true;
    } else {
      return false;
    }
  }

  @Bind()
  async handleCreateLevelPosition() {
    const validate = await this.formDS.validate();
    if (validate) {
      const res = await this.formDS.submit();
      if (res && res.success) {
        this.treeDS.query();
      }
      return true;
    } else {
      return false;
    }
  }

  @Bind()
  async handleCreateChildrenPosition() {
    const validate = await this.formDS.validate();
    if (validate) {
      const res = await this.formDS.submit();
      if (res && res.success) {
        this.treeDS.query();
      }
      return true;
    } else {
      return false;
    }
  }

  @Bind()
  async handelEdit(record) {
    const validate = await this.formDS.validate();
    if (validate) {
      const updateData = this.formDS.current.toData();
      const { companyLov, departmentLov, parentPositionLov, ...other } = updateData;
      const res = await updatePositionInformation({
        ...other,
        unitCompanyId: record.unitCompanyId,
      });
      if (res && res.failed) {
        notification.error({
          message: res.message,
        });
      } else {
        this.treeDS.query();
        notification.success({
          message: intl
            .get('hpfm.organization.view.message.editInformationSuccess')
            .d('编辑信息成功！'),
        });
      }
      return true;
    } else {
      return false;
    }
  }

  @Bind()
  handleChangeCompanyLov(record) {
    const { unitId = '' } = record;
    this.formDS.current.set('departmentLov', '');
    this.formDS.setQueryParameter('unitCompanyId', unitId);
  }

  /**
   * 打开模态框
   */
  @Bind()
  openModal(record, title, type) {
    const {
      unitId = '',
      unitName = '',
      unitCompanyId = '',
      unitCompanyName = '',
      positionId = '',
      parentPositionId = '',
    } = record;
    const editFlag = type === 'edit';
    switch (type) {
      case 'create':
        this.formDS.create({});
        break;
      case 'createLevelCompany':
        this.formDS.setQueryParameter('unitCompanyId', unitCompanyId);
        this.formDS.create({ unitId, unitName, unitCompanyId, unitCompanyName, parentPositionId });
        break;
      case 'createChildrenCompany':
        this.formDS.setQueryParameter('unitCompanyId', unitCompanyId);
        this.formDS.create({
          unitId,
          unitName,
          unitCompanyId,
          unitCompanyName,
          parentPositionId: positionId,
        });
        break;
      case 'edit':
        this.formDS.create(record);
        break;
      default:
    }
    Modal.open({
      title,
      drawer: true,
      width: 520,
      children: (
        <Form dataSet={this.formDS}>
          <TextField name="positionCode" disabled={editFlag} />
          <IntlField name="positionName" />
          <Lov name="companyLov" onChange={this.handleChangeCompanyLov} disabled={editFlag} />
          <Lov name="departmentLov" disabled={editFlag} />
          {editFlag && <Lov name="parentPositionLov" />}
          <NumberField step={1} name="orderSeq" />
          <Switch name="supervisorFlag" />
        </Form>
      ),
      onOk: async () => {
        let isClose = false;
        switch (type) {
          case 'create':
            isClose = this.handleCreate();
            break;
          case 'createLevelCompany':
            isClose = this.handleCreateLevelPosition();
            break;
          case 'createChildrenCompany':
            isClose = this.handleCreateChildrenPosition();
            break;
          case 'edit':
            isClose = await this.handelEdit(record);
            break;
          default:
        }
        return isClose;
      },
      onCancel: () => true,
      afterClose: () => this.formDS.reset(),
    });
  }

  // 选中某一个节点
  @Bind()
  handleSelect(record) {
    const tempRecord = record.toData();
    const { positionId } = tempRecord;
    this.setState({ basicInformation: tempRecord, optionValue: undefined });
    this.employeeTableDS.setQueryParameter('keyWord', null);
    this.employeeTableDS.setQueryParameter('positionId', positionId);
    this.employeeTableDS.query();
  }

  // 树节点渲染方式
  @Bind()
  nodeRenderer({ record }) {
    const { path } = this.props;
    const { positionCode = '', positionName = '', enabledFlag = '' } = record.toData();
    const menu = (
      <Menu style={{ marginTop: 16 }}>
        <Menu.Item key="itemOne">
          <ButtonPermission
            type="text"
            permissionList={[
              {
                code: `${path}/createLevelPosition`,
                type: 'button',
                meaning: '企业通讯录-新建平级岗位',
              },
            ]}
            onClick={() => {
              this.handelCreatePosition({ type: 'createLevelCompany', record });
            }}
          >
            {intl.get('hpfm.organization.view.button.createLevelPosition').d('新建平级岗位')}
          </ButtonPermission>
        </Menu.Item>
        <Menu.Item key="itemTwo">
          <ButtonPermission
            type="text"
            permissionList={[
              {
                code: `${path}/createChildrenPosition`,
                type: 'button',
                meaning: '企业通讯录-新建下级岗位',
              },
            ]}
            onClick={() => {
              this.handelCreatePosition({ type: 'createChildrenCompany', record });
            }}
          >
            {intl.get('hpfm.organization.view.button.createChildrenPosition').d('新建下级岗位')}
          </ButtonPermission>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="itemThree">
          {enabledFlag ? (
            <ButtonPermission
              type="text"
              permissionList={[
                {
                  code: `${path}/disabledPosition`,
                  type: 'button',
                  meaning: '企业通讯录-禁用岗位',
                },
              ]}
              onClick={() => {
                this.handelDisabledPosition({ record });
              }}
            >
              {intl.get('hpfm.organization.view.button.disabledPosition').d('禁用岗位')}
            </ButtonPermission>
          ) : (
            <ButtonPermission
              type="text"
              permissionList={[
                {
                  code: `${path}/enablePosition`,
                  type: 'button',
                  meaning: '企业通讯录-启用岗位',
                },
              ]}
              onClick={() => {
                this.handelEnablePosition({ record });
              }}
            >
              {intl.get('hpfm.organization.view.button.enablePosition').d('启用岗位')}
            </ButtonPermission>
          )}
        </Menu.Item>
      </Menu>
    );
    return (
      <Row type="flex" justify="space-between" style={{ width: '20vw' }}>
        <Col span={20} onClick={() => this.handleSelect(record)}>
          <span>
            {positionCode}-{positionName}
          </span>
        </Col>
        <Col span={2}>
          <Dropdown overlay={menu} trigger="click">
            <Icon type="more_horiz" />
          </Dropdown>
        </Col>
      </Row>
    );
  }

  // 查询员工或者岗位信息
  @Bind()
  handleSearchInformation(value) {
    this.setState({ optionValue: undefined });
    this.employeeTableDS.setQueryParameter('keyWord', value);
    this.employeeTableDS.query();
  }

  // 是否主岗切换
  @Bind()
  handleSelected(value) {
    this.setState({ optionValue: value });
    this.employeeTableDS.setQueryParameter('primaryPositionFlag', value);
    this.employeeTableDS.query();
    this.employeeTableDS.setQueryParameter('primaryPositionFlag', null);
  }

  @Bind()
  changePanel() {
    const { panelKey } = this.state;
    if (panelKey === '') {
      this.setState({ panelKey: 'information' });
    } else {
      this.setState({ panelKey: '' });
    }
  }

  // Search为受控组件
  @Bind()
  handleChangeSearchData(e) {
    this.setState({ searchValue: e.target.value });
  }

  render() {
    const { path } = this.props;
    const { basicInformation, panelKey, searchValue, optionValue } = this.state;
    const panelKeyFlag = panelKey === 'information';
    return (
      <>
        <Row gutter={45}>
          <Col span={8}>
            <Search
              placeholder={intl
                .get('hpfm.organization.view.button.jobCodeOrName')
                .d('岗位编码/岗位名称')}
              enterButton
              size="large"
              style={{ marginBottom: 10 }}
              value={searchValue}
              onChange={this.handleChangeSearchData}
              onSearch={this.searchAllFormation}
            />
            <ButtonPermission
              type="c7n-pro"
              permissionList={[
                {
                  code: `${path}/createPosition`,
                  type: 'button',
                  meaning: '企业通讯录-新建岗位',
                },
              ]}
              color="primary"
              icon="add"
              style={{ width: '100%' }}
              onClick={() => {
                this.handelCreatePosition({ record: basicInformation, type: 'create' });
              }} // 新建岗位
            >
              {intl.get('hpfm.organization.view.button.createPosition').d('新建岗位')}
            </ButtonPermission>
            <div style={{ height: 420, overflow: 'auto', marginTop: 16 }}>
              <Tree disableCheckbox dataSet={this.treeDS} renderer={this.nodeRenderer} />
            </div>
          </Col>
          <Col span={16}>
            <Collapse activeKey={panelKey}>
              <Panel
                showArrow={false}
                disabled
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ lineHeight: '28px' }}>
                      {intl.get('hpfm.organization.view.title.baseMessage').d('基本信息')}
                    </div>
                    <div>
                      {panelKeyFlag ? (
                        <ButtonPermission
                          type="c7n-pro"
                          permissionList={[
                            {
                              code: `${path}/edit`,
                              type: 'button',
                              meaning: '企业通讯录-编辑',
                            },
                          ]}
                          color="primary"
                          onClick={() => this.handelCreatePosition({ type: 'edit' })}
                        >
                          {intl.get('hzero.common.button.edit').d('编辑')}
                        </ButtonPermission>
                      ) : null}
                      <Button
                        color="primary"
                        funcType="flat"
                        shape="circle"
                        onClick={this.changePanel}
                        icon={panelKeyFlag ? 'expand_less' : 'expand_more'}
                      />
                    </div>
                  </div>
                }
                key="information"
              >
                <div style={{ marginBottom: 100 }}>
                  <Col span={6}>
                    <div style={{ color: 'rgb(152, 152, 152)' }}>
                      {intl.get('hpfm.organization.model.position.positionCode').d('岗位编码')}
                    </div>
                    <div style={{ overflowWrap: 'break-word' }}>
                      {basicInformation.positionCode}
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ color: 'rgb(152, 152, 152)' }}>
                      {intl.get('hpfm.organization.model.position.positionName').d('岗位名称')}
                    </div>
                    <div style={{ overflowWrap: 'break-word' }}>
                      {basicInformation.positionName}
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ color: 'rgb(152, 152, 152)' }}>
                      {intl.get('hpfm.organization.model.position.unitCompanyName').d('公司')}
                    </div>
                    <div style={{ overflowWrap: 'break-word' }}>
                      {basicInformation.unitCompanyName}
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ color: 'rgb(152, 152, 152)' }}>
                      {intl.get('hpfm.organization.model.position.department').d('上级岗位')}
                    </div>
                    <div style={{ overflowWrap: 'break-word', marginLeft: '2px' }}>
                      {basicInformation.parentPositionName
                        ? basicInformation.parentPositionName
                        : intl.get('hpfm.organization.view.position.nothing').d('无')}
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ marginTop: 16, color: 'rgb(152, 152, 152)' }}>
                      {intl.get('hpfm.organization.model.position.department').d('部门')}
                    </div>
                    <div style={{ overflowWrap: 'break-word' }}>{basicInformation.unitName}</div>
                  </Col>
                  <Col span={6}>
                    <div style={{ marginTop: 16, color: 'rgb(152, 152, 152)' }}>
                      {intl
                        .get('hpfm.organization.model.position.supervisorPosition')
                        .d('主管岗位')}
                    </div>
                    <div style={{ overflowWrap: 'break-word', marginLeft: '2px' }}>
                      <Badge
                        status={statusMap[basicInformation.supervisorFlag]}
                        text={
                          basicInformation.supervisorFlag
                            ? intl.get('hzero.common.status.yes').d('是')
                            : intl.get('hzero.common.status.no').d('否')
                        }
                      />
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ marginTop: 16, color: 'rgb(152, 152, 152)' }}>
                      {intl.get('hpfm.organization.model.position.currentStatus').d('状态')}
                    </div>
                    <div style={{ overflowWrap: 'break-word', marginLeft: '2px' }}>
                      <Badge
                        status={statusMap[basicInformation.enabledFlag]}
                        text={
                          basicInformation.enabledFlag
                            ? intl.get('hzero.common.status.enable').d('启用')
                            : intl.get('hzero.common.status.disable').d('禁用')
                        }
                      />
                    </div>
                  </Col>
                </div>
              </Panel>
            </Collapse>
            <Tabs
              className={styles['tabs-style']}
              defaultActiveKey="employeeInformation"
              animated={false}
              tabBarExtraContent={
                <Group
                  style={{
                    marginTop: 4,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Select
                    className={styles['select-style']}
                    allowClear
                    placeholder={intl
                      .get('hpfm.organization.view.placeHolder.isPrimaryPosition')
                      .d('是否主岗')}
                    style={{ width: 110, marginRight: 10 }}
                    onChange={this.handleSelected}
                    value={optionValue}
                  >
                    <Option value="1">{intl.get('hzero.common.status.yes').d('是')}</Option>
                    <Option value="0">{intl.get('hzero.common.status.no').d('否')}</Option>
                  </Select>
                  <Search
                    placeholder={intl
                      .get('hpfm.organization.view.button.employeeHolderPlace')
                      .d('员工编码/员工姓名')}
                    enterButton
                    size="small"
                    onSearch={this.handleSearchInformation}
                  />
                </Group>
              }
            >
              <TabPane
                tab={intl.get('hpfm.organization.view.title.employeeInfo').d('员工信息')}
                key="employeeInformation"
              >
                <Table dataSet={this.employeeTableDS} columns={this.employeeColumn} />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </>
    );
  }
}
