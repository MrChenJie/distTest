/**
 * @since 2019-12-03
 * @author WT <tao13.wang@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, SelectBox, Select, Button, Lov, TextField, Switch } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { fetchEmployeeDetail } from '@/services/newOrganizationService';

const { Option } = Select;
export default class CreateEmployeeDrawer extends React.Component {
  componentDidMount() {
    const { type, employeeId, employeeFormDS, employeePositionFormDS } = this.props;
    if (type === 'edit') {
      fetchEmployeeDetail({ employeeId }).then(data => {
        const {
          list = [],
          name = '',
          gender = '',
          enabledFlag = '',
          mobile = '',
          email = '',
          employeeCode = '',
          status = '',
          objectVersionNumber,
          _token,
        } = data;
        const partTimeList = list
          .filter(item => item.primaryPositionFlag === 0)
          .map(record => ({
            partTimePositionId: record.positionId,
            unitId: record.unitId,
            unitName: record.unitName,
          }));
        const { unitId, unitName, positionId } = list.filter(
          item => item.primaryPositionFlag === 1
        )[0];
        employeeFormDS.loadData([
          {
            employeeId,
            name,
            gender,
            enabledFlag,
            mobile,
            email,
            employeeCode,
            status,
            unitId,
            unitName,
            positionId,
            objectVersionNumber,
            _token,
          },
        ]);
        employeePositionFormDS.loadData(partTimeList);
        this.setState({});
      });
    }
  }

  @Bind()
  addPartTimePosition() {
    const { employeePositionFormDS } = this.props;
    employeePositionFormDS.create({});
    this.setState({});
  }

  @Bind()
  dataChange(item) {
    item.set('partTimePositionId', '');
  }

  @Bind()
  positionFormItem() {
    const { employeePositionFormDS } = this.props;
    const { records } = employeePositionFormDS;
    return [
      ...records.map(item => [
        <Lov
          record={item}
          label={intl.get('hpfm.organization.model.department.partTimeDepartment').d('兼职部门')}
          name="partTimeDepartmentLov"
          onChange={() => {
            this.dataChange(item);
          }}
        />,
        <Select
          record={item}
          label={intl.get('hpfm.organization.model.department.position').d('岗位')}
          name="partTimePositionId"
        />,
      ]),
    ];
  }

  @Bind()
  departmentLovChange() {
    const { employeeFormDS, employeePositionFormDS } = this.props;
    const { records } = employeePositionFormDS;
    employeeFormDS.current.set('positionId', '');
    employeePositionFormDS.remove(records);
  }

  render() {
    const { employeeFormDS, type } = this.props;
    const employeeCodeFlag = type !== 'create';
    return (
      <>
        <Form dataSet={employeeFormDS}>
          <TextField name="employeeCode" disabled={employeeCodeFlag} />
          <TextField name="name" />
          <SelectBox name="gender">
            <Option value={0}>{intl.get('hpfm.organization.model.position.men').d('男')}</Option>
            <Option value={1}>{intl.get('hpfm.organization.model.position.women').d('女')}</Option>
          </SelectBox>
          <TextField name="mobile" />
          <TextField name="email" />
          <Lov name="departmentLov" onChange={this.departmentLovChange} />
          <Select name="positionId" />
          {this.positionFormItem()}
          <Button funcType="flat" onClick={this.addPartTimePosition} icon="add">
            {intl.get('hpfm.organization.model.department.addPartTimeDepartment').d('添加兼职部门')}
          </Button>
          <SelectBox name="status">
            <Option value="ON">
              {intl.get('hpfm.organization.model.department.onPosition').d('在职')}
            </Option>
            <Option value="TRIAL">
              {intl.get('hpfm.organization.model.department.trial').d('试用')}
            </Option>
            <Option value="INTERNSHIP">
              {intl.get('hpfm.organization.model.department.practice').d('实习')}
            </Option>
            <Option value="LEAVE">
              {intl.get('hpfm.organization.model.department.leave').d('离职')}
            </Option>
          </SelectBox>
          <Switch name="enabledFlag" />
        </Form>
      </>
    );
  }
}
